import type { Express, Request } from 'express';
import type { Pool, PoolClient } from 'pg';
import { randomUUID } from 'node:crypto';
import { authenticated, role, csrf } from './auth.js';
import { exact, fail, uuid, HttpError } from './http.js';
import { mean, parseAnswers, parseDefinition, validatePublication } from './feedback-rules.js';

type Row = Record<string, any>;
const disclosure = 'This survey is identified. Your answers remain linked to your account in storage. The survey owner sees summaries and unlabelled written feedback after closing, without your account identifier. Your written content may still identify you. Small groups can also make summaries identifiable.';
const scale = (q: Row) => q.type === 'TEXT' ? null : ({ min: q.ratingMin, max: q.ratingMax, minLabel: q.ratingMinLabel, maxLabel: q.ratingMaxLabel, interpretation: q.scaleInterpretation });
const questionView = (q: Row) => ({ id: q.id, position: q.position, prompt: q.prompt, type: q.type, required: q.required, ratingScale: scale(q) });
const courseView = (r: Row) => ({ id: r.courseId, code: r.courseCode, title: r.courseTitle });
const sectionView = (r: Row) => ({ id: r.sectionId, courseId: r.courseId, term: r.term, sectionCode: r.sectionCode });
const lectureView = (r: Row) => ({ id: r.lectureId, title: r.lectureTitle, lectureDate: typeof r.lectureDate === 'string' ? r.lectureDate : r.lectureDate.toISOString().slice(0,10), sequence: r.sequence });
const context = (r: Row) => ({ course: courseView(r), section: sectionView(r), lecture: lectureView(r) });
const joined = `SELECT s.*, l.title AS "lectureTitle", l."lectureDate"::text, l.sequence, sec.id AS "sectionId", sec.term, sec."sectionCode", sec."courseId", c.code AS "courseCode", c.title AS "courseTitle" FROM "Survey" s JOIN "Lecture" l ON l.id=s."lectureId" JOIN "Section" sec ON sec.id=l."sectionId" JOIN "Course" c ON c.id=sec."courseId"`;
function query(req: Request, allowed: string[]) {
  const values = new URL(req.originalUrl, 'http://local').searchParams;
  for (const key of values.keys()) if (!allowed.includes(key) || values.getAll(key).length !== 1) fail(422, /^\/api\/surveys\//.test(req.path) || req.method!=='GET' ? 'INVALID_REQUEST' : 'VALIDATION_FAILED');
  return values;
}
function page(req: Request, allowed: string[] = []) {
  const q = query(req, ['limit','offset',...allowed]);
  const limit = q.get('limit') ?? '20', offset = q.get('offset') ?? '0';
  if (!/^[1-9]\d*$/.test(limit) || Number(limit) > 100 || !/^(0|[1-9]\d*)$/.test(offset) || Number(offset) > 10000) fail(422, 'VALIDATION_FAILED');
  return { q, limit: Number(limit), offset: Number(offset) };
}
async function transaction<T>(pool: Pool, action: (db: PoolClient) => Promise<T>, read = false): Promise<T> {
  const db = await pool.connect();
  try { await db.query(read ? 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY' : 'BEGIN'); await db.query("SET LOCAL lock_timeout='5s'"); await db.query("SET LOCAL statement_timeout='10s'"); const result = await action(db); await db.query('COMMIT'); return result; }
  catch (error) { await db.query('ROLLBACK'); throw error; } finally { db.release(); }
}
async function scope(db: PoolClient, req: Request, lock = false) {
  const id = uuid(req.params.id, 'INVALID_REQUEST');
  const owner = req.actor!.role === 'OWNER';
  const predicate = owner ? 'sec."ownerId"=$2 AND s."ownerId"=sec."ownerId"' : `s.status IN ('PUBLISHED','CLOSED') AND EXISTS (SELECT 1 FROM "SurveyEligibility" e WHERE e."surveyId"=s.id AND e."studentId"=$2)`;
  const row = (await db.query(`${joined} WHERE s.id=$1 AND ${predicate}${lock ? ' FOR UPDATE OF s' : ''}`, [id,req.actor!.userId])).rows[0];
  if (!row) fail(404, 'NOT_FOUND');
  return row!;
}
async function questions(db: PoolClient, id: string) { return (await db.query('SELECT * FROM "Question" WHERE "surveyId"=$1 ORDER BY position', [id])).rows; }
async function definitionView(db: PoolClient, row: Row, owner: boolean) {
  const base = { id: row.id, lectureId: row.lectureId, title: row.title, status: row.status, mode: row.mode, context: context(row), questions: (await questions(db,row.id)).map(questionView), privacyDisclosure: disclosure };
  return owner ? { ...base, definitionRevision: row.definitionRevision, publishedAt: row.publishedAt?.toISOString() ?? null, closedAt: row.closedAt?.toISOString() ?? null } : base;
}
const revision = (value: unknown) => { exact(value, ['expectedRevision'], 'INVALID_REQUEST'); const n = (value as {expectedRevision: unknown}).expectedRevision; if (!Number.isSafeInteger(n) || Number(n) < 1) fail(422, 'VALIDATION_FAILED'); return n; };
const state = (row: Row, expected: string) => { if (row.status !== expected) fail(409, 'INVALID_STATE'); };
const sameRevision = (row: Row, expected: unknown) => { if (row.definitionRevision !== expected) fail(409, 'REVISION_CONFLICT'); };
async function paginated(db: PoolClient, sql: string, values: unknown[], limit: number, offset: number, order: string) {
  const total = Number((await db.query(`SELECT count(*) AS n FROM (${sql}) result`,values)).rows[0].n);
  const items = (await db.query(`${sql} ORDER BY ${order} LIMIT $${values.length+1} OFFSET $${values.length+2}`,[...values,limit,offset])).rows;
  return { items, pagination: { total, limit, offset } };
}
export function setupFeedback(app: Express, pool: Pool) {
  app.use('/api', (req,res,next) => {
    const path = req.path;
    let methods: string[] | undefined;
    if (/^\/courses$|^\/sections$|^\/sections\/[^/]+\/lectures$|^\/surveys\/[^/]+\/(results|my-submission)$/.test(path)) methods=['GET'];
    else if (path==='/surveys') methods=['GET','POST'];
    else if (/^\/surveys\/[^/]+$/.test(path)) methods=['GET','PATCH','DELETE'];
    else if (/^\/surveys\/[^/]+\/(publish|close|responses)$/.test(path)) methods=['POST'];
    if (!methods || methods.includes(req.method)) return next();
    authenticated(req,res,error => {
      if (error) return next(error);
      const reject = () => { res.set('Allow',methods!.join(', ')); next(new HttpError(405,'METHOD_NOT_ALLOWED','Method not allowed.')); };
      if (!['GET','HEAD','OPTIONS'].includes(req.method)) csrf(req,res,error => error ? next(error) : reject()); else reject();
    });
  });
  app.get('/api/courses', authenticated, role('OWNER'), async (req,res) => {
    const p = page(req);
    const data = await transaction(pool, db => paginated(db, 'SELECT c.id,c.code,c.title FROM "Course" c WHERE EXISTS (SELECT 1 FROM "Section" sec WHERE sec."courseId"=c.id AND sec."ownerId"=$1)', [req.actor!.userId],p.limit,p.offset,'code COLLATE "C",id'),true);
    res.json({ data });
  });
  app.get('/api/sections', authenticated, role('OWNER'), async (req,res) => {
    const p=page(req,['courseId']); const courseId=uuid(p.q.get('courseId'));
    const data=await transaction(pool,async db => {
      if (!(await db.query('SELECT id FROM "Section" WHERE "courseId"=$1 AND "ownerId"=$2',[courseId,req.actor!.userId])).rowCount) fail(404,'NOT_FOUND');
      return paginated(db,'SELECT id,"courseId",term,"sectionCode" FROM "Section" WHERE "courseId"=$1 AND "ownerId"=$2',[courseId,req.actor!.userId],p.limit,p.offset,'term COLLATE "C" DESC,"sectionCode" COLLATE "C",id');
    },true);res.json({data});
  });
  app.get('/api/sections/:sectionId/lectures', authenticated, role('OWNER'), async(req,res)=>{
    const p=page(req);const sectionId=uuid(req.params.sectionId);
    const data=await transaction(pool,async db=>{
      if (!(await db.query('SELECT id FROM "Section" WHERE id=$1 AND "ownerId"=$2',[sectionId,req.actor!.userId])).rowCount) fail(404,'NOT_FOUND');
      const data=await paginated(db,`SELECT l.id,l."sectionId",l.title,l."lectureDate"::text,l.sequence, CASE WHEN s.id IS NULL THEN NULL ELSE json_build_object('id',s.id,'title',s.title,'status',s.status,'mode',s.mode) END AS "existingSurvey" FROM "Lecture" l LEFT JOIN "Survey" s ON s."lectureId"=l.id WHERE l."sectionId"=$1`,[sectionId],p.limit,p.offset,'sequence,l.id');
      return data;
    },true);res.json({data});
  });
  app.get('/api/surveys',authenticated,async(req,res)=>{
    const owner=req.actor!.role==='OWNER';const p=page(req,owner?['lectureId']:[]);const lecture=p.q.get('lectureId');if(lecture)uuid(lecture);
    const data=await transaction(pool,async db=>{
      if(lecture && !(await db.query('SELECT l.id FROM "Lecture" l JOIN "Section" sec ON sec.id=l."sectionId" WHERE l.id=$1 AND sec."ownerId"=$2',[lecture,req.actor!.userId])).rowCount)fail(404,'NOT_FOUND');
      const predicate=owner?'sec."ownerId"=$1 AND s."ownerId"=sec."ownerId"':`s.status IN ('PUBLISHED','CLOSED') AND EXISTS (SELECT 1 FROM "SurveyEligibility" e WHERE e."surveyId"=s.id AND e."studentId"=$1)`;
      const select=owner?joined:joined.replace('SELECT s.*,',`SELECT s.*, EXISTS(SELECT 1 FROM "Participation" p WHERE p."surveyId"=s.id AND p."studentId"=$1) AS submitted,`);
      const values:unknown[]=[req.actor!.userId];if(lecture)values.push(lecture);
      const data=await paginated(db,`${select} WHERE ${predicate}${lecture?' AND l.id=$2':''}`,values,p.limit,p.offset,'"lectureDate" DESC,sequence DESC,s.id');
      return {...data,items:data.items.map(row=>({id:row.id,title:row.title,status:row.status,mode:row.mode,...context(row),...(!owner?{participation:{submitted:row.submitted}}:{})}))};
    },true);res.json({data});
  });
  app.post('/api/surveys',authenticated,csrf,role('OWNER'),async(req,res)=>{
    query(req,[]);exact(req.body,['lectureId'],'INVALID_REQUEST');const lecture=uuid(req.body.lectureId,'INVALID_REQUEST');
    const data=await transaction(pool,async db=>{
      const found=await db.query('SELECT l.id FROM "Lecture" l JOIN "Section" sec ON sec.id=l."sectionId" WHERE l.id=$1 AND sec."ownerId"=$2',[lecture,req.actor!.userId]);if(!found.rowCount)fail(404,'NOT_FOUND');
      // Unique lectureId is the final arbiter for concurrent creates.
      const row=(await db.query('INSERT INTO "Survey" ("lectureId","ownerId") VALUES ($1,$2) RETURNING id',[lecture,req.actor!.userId])).rows[0];
      return definitionView(db,(await db.query(`${joined} WHERE s.id=$1`,[row.id])).rows[0],true);
    });res.location(`/api/surveys/${data.id}`).status(201).json({data});
  });
  app.get('/api/surveys/:id',authenticated,async(req,res)=>{query(req,[]);const data=await transaction(pool,async db=>definitionView(db,await scope(db,req),req.actor!.role==='OWNER'),true);res.json({data});});
  app.patch('/api/surveys/:id',authenticated,csrf,role('OWNER'),async(req,res)=>{
    query(req,[]);const input=parseDefinition(req.body);
    const data=await transaction(pool,async db=>{
      const row=await scope(db,req,true);state(row,'DRAFT');sameRevision(row,input.expectedRevision);
      const old=await questions(db,row.id);
      if(input.questions.some(q=>q.id&&!old.some(x=>x.id===q.id)))fail(422,'INVALID_DEFINITION');
      const existing=old.map(({id, ...q})=>({id,prompt:q.prompt,type:q.type,required:q.required,ratingScale:scale(q)}));
      if(row.title===input.title && JSON.stringify(existing)===JSON.stringify(input.questions)) return definitionView(db,row,true);
      const retained=input.questions.flatMap(q=>q.id?[q.id]:[]);
      await db.query('DELETE FROM "Question" WHERE "surveyId"=$1 AND NOT (id=ANY($2::uuid[]))',[row.id,retained]);
      await db.query('UPDATE "Question" SET position=position+10 WHERE "surveyId"=$1',[row.id]);
      for(const [index,q] of input.questions.entries()) {
        const id=q.id??randomUUID();const s=q.ratingScale;
        await db.query(`INSERT INTO "Question" (id,"surveyId",position,prompt,type,required,"ratingMin","ratingMax","ratingMinLabel","ratingMaxLabel","scaleInterpretation") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (id) DO UPDATE SET position=EXCLUDED.position,prompt=EXCLUDED.prompt,type=EXCLUDED.type,required=EXCLUDED.required,"ratingMin"=EXCLUDED."ratingMin","ratingMax"=EXCLUDED."ratingMax","ratingMinLabel"=EXCLUDED."ratingMinLabel","ratingMaxLabel"=EXCLUDED."ratingMaxLabel","scaleInterpretation"=EXCLUDED."scaleInterpretation"`,[id,row.id,index+1,q.prompt,q.type,q.required,s?.min??null,s?.max??null,s?.minLabel??null,s?.maxLabel??null,s?.interpretation??null]);
      }
      row.title=input.title;row.definitionRevision++;
      await db.query('UPDATE "Survey" SET title=$2,"definitionRevision"=$3 WHERE id=$1',[row.id,row.title,row.definitionRevision]);return definitionView(db,row,true);
    });res.json({data});
  });
  app.delete('/api/surveys/:id',authenticated,csrf,role('OWNER'),async(req,res)=>{query(req,[]);const rev=revision(req.body);await transaction(pool,async db=>{const row=await scope(db,req,true);state(row,'DRAFT');sameRevision(row,rev);await db.query('DELETE FROM "Survey" WHERE id=$1',[row.id]);});res.sendStatus(204);});
  app.post('/api/surveys/:id/publish',authenticated,csrf,role('OWNER'),async(req,res)=>{
    query(req,[]);const rev=revision(req.body);const data=await transaction(pool,async db=>{
      const row=await scope(db,req,true);state(row,'DRAFT');sameRevision(row,rev);const qs=(await questions(db,row.id)).map(questionView);validatePublication({title:row.title,questions:qs});
      if ((await db.query('SELECT 1 FROM \"Membership\" m JOIN \"User\" u ON u.id=m.\"studentId\" WHERE m.\"sectionId\"=$1 AND u.role<>\'RESPONDENT\'',[row.sectionId])).rowCount) fail(422,'ELIGIBILITY_INVALID');
      const count=await db.query('INSERT INTO "SurveyEligibility" ("surveyId","studentId") SELECT $1,m."studentId" FROM "Membership" m JOIN "User" u ON u.id=m."studentId" AND u.role=\'RESPONDENT\' WHERE m."sectionId"=$2',[row.id,row.sectionId]);
      if(!count.rowCount)fail(422,'ELIGIBILITY_EMPTY');
      const updated=(await db.query('UPDATE "Survey" SET status=\'PUBLISHED\',"publishedAt"=now() WHERE id=$1 RETURNING status,"publishedAt"',[row.id])).rows[0];Object.assign(row,updated);return definitionView(db,row,true);
    });res.json({data});
  });
  app.post('/api/surveys/:id/close',authenticated,csrf,role('OWNER'),async(req,res)=>{
    query(req,[]);exact(req.body,[],'INVALID_REQUEST');const data=await transaction(pool,async db=>{const row=await scope(db,req,true);state(row,'PUBLISHED');Object.assign(row,(await db.query('UPDATE "Survey" SET status=\'CLOSED\',"closedAt"=now() WHERE id=$1 RETURNING status,"closedAt"',[row.id])).rows[0]);return definitionView(db,row,true);});res.json({data});
  });
  app.post('/api/surveys/:id/responses',authenticated,csrf,role('RESPONDENT'),async(req,res)=>{
    query(req,[]);const data=await transaction(pool,async db=>{
      const row=await scope(db,req,true);state(row,'PUBLISHED');
      if(row.mode!=='IDENTIFIED')fail(409,'MODE_NOT_SUPPORTED');
      if((await db.query('SELECT 1 FROM "Participation" WHERE "surveyId"=$1 AND "studentId"=$2',[row.id,req.actor!.userId])).rowCount)fail(409,'RESPONSE_ALREADY_SUBMITTED');
      const answers=parseAnswers(req.body,await questions(db,row.id));const bundle=randomUUID();
      await db.query('INSERT INTO "Participation" VALUES ($1,$2)',[row.id,req.actor!.userId]);
      await db.query('INSERT INTO "ResponseBundle" (id,"surveyId","identifiedStudentId") VALUES ($1,$2,$3)',[bundle,row.id,req.actor!.userId]);
      for(const a of answers)await db.query('INSERT INTO "Answer" ("bundleId","questionId","surveyId","ratingValue","textValue") VALUES ($1,$2,$3,$4,$5)',[bundle,a.questionId,row.id,typeof a.value==='number'?a.value:null,typeof a.value==='string'?a.value:null]);
      return {surveyId:row.id,submitted:true,answers};
    });res.status(201).json({data});
  });
  app.get('/api/surveys/:id/my-submission',authenticated,role('RESPONDENT'),async(req,res)=>{
    query(req,[]);const data=await transaction(pool,async db=>{
      const row=await scope(db,req);const submitted=Boolean((await db.query('SELECT 1 FROM "Participation" WHERE "surveyId"=$1 AND "studentId"=$2',[row.id,req.actor!.userId])).rowCount);
      const bundles=(await db.query('SELECT id FROM "ResponseBundle" WHERE "surveyId"=$1 AND "identifiedStudentId"=$2',[row.id,req.actor!.userId])).rows;
      if(submitted!==(bundles.length===1))fail(500,'INTERNAL_ERROR');
      const answers=submitted?(await db.query('SELECT a."questionId",COALESCE(to_jsonb(a."ratingValue"),to_jsonb(a."textValue")) AS value FROM "Answer" a JOIN "Question" q ON q.id=a."questionId" WHERE a."bundleId"=$1 ORDER BY q.position',[bundles[0]!.id])).rows:null;
      if(submitted&&!answers?.length)fail(500,'INTERNAL_ERROR');return {surveyId:row.id,submitted,answers};
    },true);res.json({data});
  });
  app.get('/api/surveys/:id/results',authenticated,role('OWNER'),async(req,res)=>{
    query(req,[]);const data=await transaction(pool,async db=>{
      const row=await scope(db,req);if(row.status==='DRAFT')fail(409,'RESULTS_NOT_AVAILABLE');if(row.mode!=='IDENTIFIED')fail(409,'MODE_NOT_SUPPORTED');
      const survey={id:row.id,title:row.title,status:row.status,mode:row.mode,context:context(row)};
      const responseCount=Number((await db.query('SELECT count(*) AS n FROM "Participation" WHERE "surveyId"=$1',[row.id])).rows[0].n);
      if(row.status==='PUBLISHED')return {survey,responseCount};
      const result=[];
      for(const q of await questions(db,row.id)) {
        const {id,...base}=questionView(q);const answers=(await db.query('SELECT "ratingValue","textValue" FROM "Answer" WHERE "surveyId"=$1 AND "questionId"=$2 ORDER BY "textValue" COLLATE "C"',[row.id,q.id])).rows;
        if (answers.length > responseCount || (q.type==='RATING' && (q.ratingMin!==1 || q.ratingMax!==5 || answers.some(a=>!Number.isInteger(a.ratingValue)||a.ratingValue<1||a.ratingValue>5||a.textValue!==null))) || (q.type==='TEXT' && answers.some(a=>a.ratingValue!==null||typeof a.textValue!=='string'||!a.textValue.trim()))) fail(500,'RESULTS_INCONSISTENT');
        if(q.type==='TEXT')result.push({questionId:id,...base,comments:answers.flatMap(a=>typeof a.textValue==='string'&&a.textValue.trim()?[a.textValue]:[])});
        else {const scores=answers.map(a=>Number(a.ratingValue));result.push({questionId:id,...base,answeredCount:scores.length,distribution:[1,2,3,4,5].map(score=>({score,count:scores.filter(x=>x===score).length})),mean:mean(scores)});}
      }
      return {survey,responseCount,questions:result};
    },true);res.json({data});
  });
}

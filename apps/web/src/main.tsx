import { StrictMode, useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import './theme.css';

type User = { id: string; displayName: string; role: 'OWNER' | 'RESPONDENT' };
type Session = { authenticated: boolean; user: User | null; csrfToken: string; expiresAt: string | null };
type Scale = { min: 1; max: 5; minLabel: string; maxLabel: string; interpretation: string };
type Question = { id: string | null; position?: number; prompt: string; type: 'RATING' | 'TEXT'; required: boolean; ratingScale: Scale | null };
type Context = { course: { title: string; code: string }; section: { sectionCode: string }; lecture: { title: string; lectureDate: string } };
type Survey = { id: string; lectureId: string; title: string; status: 'DRAFT' | 'PUBLISHED' | 'CLOSED'; mode: string; definitionRevision?: number; context: Context; questions: Question[]; privacyDisclosure: string };
type Item = { id: string; title?: string; code?: string; sectionCode?: string; sequence?: number; lectureDate?: string; existingSurvey?: { id: string }; status?: string; participation?: { submitted: boolean }; lecture?: { title: string } };
type Collection = { items: Item[]; pagination: { total: number; limit: number; offset: number } };
type Answer = { questionId: string; value: string | number };
type Submission = { surveyId: string; submitted: boolean; answers: Answer[] | null };
type Results = { responseCount: number; questions?: { questionId: string; prompt: string; type: string; ratingScale: Scale | null; mean?: string | null; answeredCount?: number; distribution?: { score: number; count: number }[]; comments?: string[] }[] };
class ApiError extends Error { constructor(public status: number, public code: string, message: string, public retryAfter?: number) { super(message); } }
type Api = <T>(path: string, method?: string, body?: unknown) => Promise<T>;
const defaultScale = (): Scale => ({ min: 1, max: 5, minLabel: '', maxLabel: '', interpretation: '' });
function ErrorBox({ message }: { message: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (message) ref.current?.focus(); }, [message]);
  return message ? <div ref={ref} className="error" role="alert" tabIndex={-1}>{message}</div> : null;
}
const reason = (error: unknown) => error instanceof ApiError ? `${error.message} (${error.code})` : 'Connection interrupted. The outcome may be unknown. Check saved status before trying again.';
function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading,setLoading] = useState(true);
  const [health,setHealth] = useState('Checking service connection…');
  const [error,setError] = useState('');
  const [busy,setBusy] = useState(false);
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [retryAt,setRetryAt] = useState(0);
  useEffect(()=>{if(!retryAt)return;const timer=setTimeout(()=>setRetryAt(0),Math.max(0,retryAt-Date.now()));return()=>clearTimeout(timer);},[retryAt]);
  const [pendingLogout,setPendingLogout] = useState(false);
  const retainedLogoutToken = useRef('');
  const generation = useRef(0);
  const token = useRef('');
  const bootstrap = useCallback(async () => {
    const version=++generation.current;setLoading(true);
    try {
      const response=await fetch('/api/auth/session',{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000)});
      const value=await response.json();if(!response.ok)throw new ApiError(response.status,value.error?.code??'UNAVAILABLE',value.error?.message??'Service unavailable.');
      if(version!==generation.current)return;
      token.current=value.data.csrfToken;setSession(value.data);setPendingLogout(false);
    } catch(e) { if(version===generation.current){setError(reason(e));setSession(null);} }
    finally {if(version===generation.current)setLoading(false);}
  },[]);
  useEffect(()=>{void bootstrap();const controller=new AbortController();fetch('/api/health',{cache:'no-store',signal:controller.signal}).then(r=>{if(!r.ok)throw Error();setHealth('Service connection ready.');}).catch(()=>{if(!controller.signal.aborted)setHealth('Service is unavailable.');});return()=>{controller.abort();generation.current++;};},[bootstrap]);
  useEffect(()=>{
    const revalidate=()=>{if(document.visibilityState==='visible'&&!pendingLogout)void bootstrap();};
    document.addEventListener('visibilitychange',revalidate);return()=>document.removeEventListener('visibilitychange',revalidate);
  },[bootstrap,pendingLogout]);
  const api:Api=useCallback(async<T,>(path:string,method='GET',body?:unknown):Promise<T>=>{
    const version=generation.current;
    const response=await fetch(path,{method,credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000),headers:method==='GET'?{}:{'Content-Type':'application/json','X-CSRF-Token':token.current},...(body!==undefined?{body:JSON.stringify(body)}:{})});
    const value=response.status===204?null:await response.json();
    if(version!==generation.current)throw new Error('Account changed.');
    if(!response.ok){if(response.status===401){generation.current++;token.current='';setSession(null);setPassword('');setError('Your session ended. Log in again.');void bootstrap();}throw new ApiError(response.status,value?.error?.code??'INTERNAL_ERROR',value?.error?.message??'Request failed.',Number(response.headers.get('Retry-After')));}
    return value?.data as T;
  },[bootstrap]);
  async function signIn(event:FormEvent) {
    event.preventDefault();if(busy||Date.now()<retryAt)return;setBusy(true);setError('');
    try { const result=await api<{user:User;csrfToken:string;expiresAt:string}>('/api/auth/login','POST',{email,password});generation.current++;token.current=result.csrfToken;setSession({authenticated:true,...result}); }
    catch(e){setError(reason(e));if(e instanceof ApiError&&e.status===429)setRetryAt(Date.now()+(e.retryAfter??900)*1000);if(!(e instanceof ApiError)||[401,403,503].includes(e.status))await bootstrap();}
    finally{setPassword('');setBusy(false);}
  }
  async function logout(){
    if(busy)return;setBusy(true);setPendingLogout(true);retainedLogoutToken.current ||= token.current;generation.current++;setSession(null);setPassword('');setError('');
    try {
      const response=await fetch('/api/auth/logout',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json','X-CSRF-Token':retainedLogoutToken.current},body:'{}',signal:AbortSignal.timeout(15000)});
      if(response.status!==204)throw Error();
      retainedLogoutToken.current='';token.current='';setPendingLogout(false);await bootstrap();
    }catch{setError('Server sign-out is not confirmed. Private content is hidden. Retry sign-out.');}
    finally{setBusy(false);}
  }
  return <main><header className="brand"><div><p className="eyebrow">LECTURE FEEDBACK</p><h1>LECTRA</h1></div><p role="status">{health}</p></header>
    <ErrorBox message={error}/>
    {loading?<p role="status">Checking your session…</p>:pendingLogout?<section className="card"><h2>Signing out</h2><p>Private content is hidden until sign-out is confirmed.</p><button disabled={busy} onClick={()=>void logout()}>Retry sign-out</button></section>:session?.authenticated&&session.user?<>
      <div className="userbar"><span>{session.user.displayName} · {session.user.role==='OWNER'?'Instructor':'Student'}</span><button onClick={()=>void logout()} disabled={busy}>Log out</button></div>
      <Workspace key={session.user.id} user={session.user} api={api}/>
    </>:<section className="card login"><h2>Log in</h2><p>Use your privately supplied LECTRA account.</p><form onSubmit={e=>void signIn(e)}>
      <label>Email<input type="email" autoComplete="username" value={email} required onChange={e=>setEmail(e.target.value)}/></label>
      <label>Password<input type="password" autoComplete="current-password" value={password} required onChange={e=>setPassword(e.target.value)}/></label>
      <button disabled={busy||!token.current||Date.now()<retryAt}>{busy?'Logging in…':'Log in'}</button>
    </form>{Date.now()<retryAt&&<p role="status">Login is temporarily rate limited. Retry after {new Date(retryAt).toLocaleTimeString()}.</p>}
    <button className="secondary" disabled={busy} onClick={()=>{void bootstrap();}}>Check session / reconnect</button></section>}
  </main>;
}
function Selector({path,label,api,onSelect}:{path:string;label:string;api:Api;onSelect:(item:Item|null)=>void}){
  const [data,setData]=useState<Collection|null>(null),[offset,setOffset]=useState(0),[value,setValue]=useState(''),[error,setError]=useState('');
  useEffect(()=>{let current=true;setData(null);setError('');api<Collection>(`${path}${path.includes('?')?'&':'?'}offset=${offset}`).then(d=>{if(current)setData(d);}).catch(e=>{if(current)setError(reason(e));});return()=>{current=false;};},[path,offset,api]);
  return <section><ErrorBox message={error}/><label>{label}<select aria-label={label} value={value} disabled={!data} onChange={e=>{setValue(e.target.value);onSelect(data?.items.find(i=>i.id===e.target.value)??null);}}><option value="">Choose {label.toLowerCase()}</option>{data?.items.map(i=><option key={i.id} value={i.id}>{i.code??i.sectionCode??i.title}{i.sequence?` · Lecture ${i.sequence}`:''}</option>)}</select></label>{!data&&!error&&<p>Loading {label.toLowerCase()}…</p>}{data&&!data.items.length&&<p>No {label.toLowerCase()} available.</p>}{data&&data.pagination.total>20&&<div className="actions"><button disabled={offset===0} onClick={()=>{setOffset(Math.max(0,offset-20));setValue('');onSelect(null);}}>Previous {label.toLowerCase()}</button><button disabled={offset+20>=data.pagination.total} onClick={()=>{setOffset(offset+20);setValue('');onSelect(null);}}>Next {label.toLowerCase()}</button></div>}</section>;
}
function Workspace({user,api}:{user:User;api:Api}){
  const [course,setCourse]=useState<Item|null>(null),[section,setSection]=useState<Item|null>(null),[lecture,setLecture]=useState<Item|null>(null),[selected,setSelected]=useState(''),[revision,setRevision]=useState(0),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function create(){if(!lecture||busy)return;setBusy(true);setError('');try{const result=await api<Survey>('/api/surveys','POST',{lectureId:lecture.id});setSelected(result.id);setRevision(r=>r+1);}catch(e){setError(reason(e));}finally{setBusy(false);}}
  return <><h2>{user.role==='OWNER'?'Your classroom feedback':'Your eligible surveys'}</h2><ErrorBox message={error}/>
    {user.role==='OWNER'&&<section className="card selectors"><Selector label="Course" path="/api/courses" api={api} onSelect={i=>{setCourse(i);setSection(null);setLecture(null);setSelected('');}}/>
      {course&&<Selector key={course.id} label="Section" path={`/api/sections?courseId=${course.id}`} api={api} onSelect={i=>{setSection(i);setLecture(null);setSelected('');}}/>}
      {section&&<Selector key={`${section.id}:${revision}`} label="Lecture" path={`/api/sections/${section.id}/lectures`} api={api} onSelect={i=>{setLecture(i);setSelected(i?.existingSurvey?.id??'');}}/>}
      {lecture&&!selected&&<button onClick={()=>void create()} disabled={busy}>{busy?'Creating…':'Create draft'}</button>}
    </section>}
    {!selected&&<SurveyList key={revision} api={api} select={setSelected}/>}
    {selected&&<><button className="secondary" onClick={()=>{setSelected('');setLecture(null);setRevision(r=>r+1);}}>Back to survey list</button><SurveyDetail key={selected} id={selected} api={api} owner={user.role==='OWNER'} deleted={()=>{setSelected('');setLecture(null);setRevision(r=>r+1);}}/></>}
  </>;
}
function SurveyList({api,select}:{api:Api;select:(id:string)=>void}){
  const [data,setData]=useState<Collection|null>(null),[offset,setOffset]=useState(0),[error,setError]=useState(''),[refresh,setRefresh]=useState(0);
  useEffect(()=>{let active=true;setData(null);api<Collection>(`/api/surveys?offset=${offset}`).then(d=>{if(active)setData(d);}).catch(e=>{if(active)setError(reason(e));});return()=>{active=false;};},[api,offset,refresh]);
  return <section className="card"><h3>Surveys</h3><ErrorBox message={error}/><button className="secondary" onClick={()=>{setError('');setRefresh(r=>r+1);}}>Refresh surveys</button>{!data&&!error&&<p role="status">Loading surveys…</p>}{data&&!data.items.length&&<p>No surveys available.</p>}
    <ul className="survey-list">{data?.items.map(s=><li key={s.id}><div><strong>{s.title||'Untitled draft'}</strong><p>{s.lecture?.title} · {s.status}{s.participation?` · ${s.participation.submitted?'Submitted':'Not submitted'}`:''}</p></div><button onClick={()=>select(s.id)}>Open survey</button></li>)}</ul>
    {data&&<div className="actions"><button disabled={offset===0} onClick={()=>setOffset(Math.max(0,offset-20))}>Previous page</button><span>{data.pagination.total} surveys</span><button disabled={offset+20>=data.pagination.total} onClick={()=>setOffset(offset+20)}>Next page</button></div>}
  </section>;
}
function SurveyDetail({id,api,owner,deleted}:{id:string;api:Api;owner:boolean;deleted:()=>void}){
  const [survey,setSurvey]=useState<Survey|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[refresh,setRefresh]=useState(0);
  useEffect(()=>{let active=true;setSurvey(null);api<Survey>(`/api/surveys/${id}`).then(s=>{if(active)setSurvey(s);}).catch(e=>{if(active)setError(reason(e));});return()=>{active=false;};},[id,api,refresh]);
  async function action(name:'publish'|'close'|'delete'){
    if(!survey||busy)return;setBusy(true);setError('');
    try{if(name==='delete'){await api(`/api/surveys/${id}`,'DELETE',{expectedRevision:survey.definitionRevision});deleted();}else{const saved=await api<Survey>(`/api/surveys/${id}/${name}`,'POST',name==='publish'?{expectedRevision:survey.definitionRevision}:{});setSurvey(saved);}}
    catch(e){setError(reason(e));}finally{setBusy(false);}
  }
  return <section className="card"><ErrorBox message={error}/>{!survey?<><p>Loading survey…</p><button onClick={()=>{setError('');setRefresh(r=>r+1);}}>Reload survey</button></>:<>
    <p className="eyebrow">{survey.context.course.code} · Section {survey.context.section.sectionCode} · {survey.context.lecture.lectureDate}</p><h2>{survey.title||'Untitled draft'}</h2><p>{survey.context.lecture.title} · <strong>{survey.status}</strong></p>
    <p className="disclosure">{survey.privacyDisclosure}</p>
    {owner&&survey.status==='DRAFT'?<DraftEditor key={survey.definitionRevision} survey={survey} api={api} saved={setSurvey} publish={()=>void action('publish')} busy={busy}/>:<>
      {!owner&&<ResponseForm key={survey.status} survey={survey} api={api}/>}
      {owner&&<><ResultsView key={survey.status} id={id} api={api}/>{survey.status==='PUBLISHED'&&<button disabled={busy} onClick={()=>void action('close')}>{busy?'Closing…':'Close survey'}</button>}</>}
    </>}
    {owner&&survey.status==='DRAFT'&&<button className="danger" disabled={busy} onClick={()=>void action('delete')}>Delete draft</button>}
  </>}</section>;
}
function DraftEditor({survey,api,saved,publish,busy}:{survey:Survey;api:Api;saved:(s:Survey)=>void;publish:()=>void;busy:boolean}){
  const [title,setTitle]=useState(survey.title),[questions,setQuestions]=useState<Question[]>(survey.questions),[dirty,setDirty]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState('');
  function change(index:number,patch:Partial<Question>){setDirty(true);setQuestions(q=>q.map((v,i)=>i===index?{...v,...patch}:v));}
  async function save(e:FormEvent){e.preventDefault();setSaving(true);setError('');try{const value=await api<Survey>(`/api/surveys/${survey.id}`,'PATCH',{expectedRevision:survey.definitionRevision,title,questions:questions.map(({id,prompt,type,required,ratingScale})=>({id,prompt,type,required,ratingScale}))});saved(value);setDirty(false);}catch(e){setError(reason(e));}finally{setSaving(false);}}
  return <><form onSubmit={e=>void save(e)}><ErrorBox message={error}/><label>Survey title<input value={title} onChange={e=>{setTitle(e.target.value);setDirty(true);}}/></label>
    {questions.map((q,index)=><fieldset key={q.id??`new-${index}`}><legend>Question {index+1}</legend><label>Prompt<input value={q.prompt} onChange={e=>change(index,{prompt:e.target.value})}/></label><label>Question type<select value={q.type} onChange={e=>change(index,{type:e.target.value as Question['type'],ratingScale:e.target.value==='RATING'?defaultScale():null})}><option value="RATING">Rating 1–5</option><option value="TEXT">Written feedback</option></select></label>
      <label className="check"><input type="checkbox" checked={q.required} onChange={e=>change(index,{required:e.target.checked})}/>Required</label>
      {q.ratingScale&&<div className="scale-editor">{(['minLabel','maxLabel','interpretation'] as const).map(key=><label key={key}>{key==='minLabel'?'Score 1 label':key==='maxLabel'?'Score 5 label':'Scale interpretation'}<input value={q.ratingScale![key]} onChange={e=>change(index,{ratingScale:{...q.ratingScale!,[key]:e.target.value}})}/></label>)}</div>}
      <div className="actions"><button type="button" disabled={index===0} onClick={()=>{setDirty(true);setQuestions(old=>{const items=[...old];[items[index-1],items[index]]=[items[index]!,items[index-1]!];return items;});}}>Move question {index+1} up</button><button type="button" onClick={()=>{setDirty(true);setQuestions(old=>old.filter((_,i)=>i!==index));}}>Remove question {index+1}</button></div>
    </fieldset>)}
    <div className="actions"><button type="button" disabled={questions.length>=10||saving} onClick={()=>{setDirty(true);setQuestions(q=>[...q,{id:null,prompt:'',type:'RATING',required:true,ratingScale:defaultScale()}]);}}>Add question</button><button disabled={saving||busy}>{saving?'Saving…':'Save draft'}</button></div>
  </form><p>{dirty?'Unsaved changes. Save before publishing.':`Saved revision ${survey.definitionRevision}.`}</p><button disabled={dirty||saving||busy} onClick={publish}>Publish survey</button></>;
}
function ResponseForm({survey,api}:{survey:Survey;api:Api}){
  const [submission,setSubmission]=useState<Submission|null>(null),[values,setValues]=useState<Record<string,string|number>>({}),[error,setError]=useState(''),[busy,setBusy]=useState(false),[refresh,setRefresh]=useState(0);
  useEffect(()=>{let active=true;api<Submission>(`/api/surveys/${survey.id}/my-submission`).then(v=>{if(active)setSubmission(v);}).catch(e=>{if(active)setError(reason(e));});return()=>{active=false;};},[api,survey.id,refresh]);
  async function submit(e:FormEvent){e.preventDefault();if(busy)return;setBusy(true);setError('');try{const result=await api<Submission>(`/api/surveys/${survey.id}/responses`,'POST',{answers:Object.entries(values).map(([questionId,value])=>({questionId,value}))});setSubmission(result);setValues({});}
    catch(e){setError(reason(e));if(!(e instanceof ApiError)||e.status>=500||e.status===409){try{const stored=await api<Submission>(`/api/surveys/${survey.id}/my-submission`);setSubmission(stored);}catch{/* retain inputs, no automatic resend */}}}finally{setBusy(false);}}
  if(!submission)return <><ErrorBox message={error}/><p>Checking your submission…</p><button onClick={()=>setRefresh(r=>r+1)}>Check saved status</button></>;
  if(submission.submitted)return <section><h3>Submission received</h3><p>Your saved answers are read-only.</p>{submission.answers?.map(a=><div className="answer" key={a.questionId}><strong>{survey.questions.find(q=>q.id===a.questionId)?.prompt}</strong><p className="prewrap">{a.value}</p></div>)}</section>;
  if(survey.status==='CLOSED')return <p>This survey is closed. No submission was recorded for your account.</p>;
  return <form onSubmit={e=>void submit(e)}><ErrorBox message={error}/>{survey.questions.map(q=><fieldset key={q.id!}><legend>{q.prompt}{q.required?' (required)':' (optional)'}</legend>{q.type==='RATING'?<><p>1: {q.ratingScale?.minLabel} · 5: {q.ratingScale?.maxLabel}</p><p>{q.ratingScale?.interpretation}</p><div className="ratings">{[1,2,3,4,5].map(score=><label key={score}><input type="radio" name={q.id!} value={score} checked={values[q.id!]===score} onChange={()=>setValues(v=>({...v,[q.id!]:score}))}/>{score}</label>)}</div>{!q.required&&<button type="button" onClick={()=>setValues(v=>{const next={...v};delete next[q.id!];return next;})}>Clear answer for {q.prompt}</button>}</>:<><label>Written answer for {q.prompt}<textarea value={values[q.id!]??''} onChange={e=>setValues(v=>({...v,[q.id!]:e.target.value}))}/></label><small>{[...String(values[q.id!]??'')].length}/2000 characters</small></>}</fieldset>)}<button disabled={busy}>{busy?'Submitting…':'Submit feedback'}</button><button type="button" className="secondary" disabled={busy} onClick={()=>setRefresh(r=>r+1)}>Check saved status</button></form>;
}
function ResultsView({id,api}:{id:string;api:Api}){
  const [data,setData]=useState<Results|null>(null),[error,setError]=useState(''),[refresh,setRefresh]=useState(0);
  useEffect(()=>{let active=true;setData(null);api<Results>(`/api/surveys/${id}/results`).then(v=>{if(active)setData(v);}).catch(e=>{if(active)setError(reason(e));});return()=>{active=false;};},[id,api,refresh]);
  return <section><h3>Feedback summary</h3><ErrorBox message={error}/><button className="secondary" onClick={()=>{setError('');setRefresh(r=>r+1);}}>Refresh results</button>{!data&&!error&&<p>Loading results…</p>}{data&&<><p>Responses: <strong>{data.responseCount}</strong></p>{!data.questions&&<p>Scores and written feedback become available after closing.</p>}{data.questions?.map(q=><section className="result" key={q.questionId}><h4>{q.prompt}</h4>{q.type==='RATING'?<><p>Mean: <strong>{q.mean??'No answers'}</strong> · Answered: {q.answeredCount}</p><p>1: {q.ratingScale?.minLabel} · 5: {q.ratingScale?.maxLabel}</p><p>{q.ratingScale?.interpretation}</p><table><caption>Score distribution for {q.prompt}</caption><thead><tr><th scope="col">Score</th><th scope="col">Responses</th><th scope="col">Distribution</th></tr></thead><tbody>{q.distribution?.map(b=><tr key={b.score}><th scope="row">{b.score}</th><td>{b.count}</td><td><div className="bar" style={{width:`${Math.max(0,b.count/Math.max(1,q.answeredCount??0)*100)}%`}} aria-hidden="true"/></td></tr>)}</tbody></table></>:q.comments?.length?<ul>{q.comments.map((text,index)=><li className="prewrap" key={index}>{text}</li>)}</ul>:<p>No written feedback.</p>}</section>)}</>}</section>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);

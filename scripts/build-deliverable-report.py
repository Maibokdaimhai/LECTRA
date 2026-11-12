"""Build the self-contained assessed-release Deliverable 1 report.
Requires reportlab and pypdf; never reads private environment/credential files.
Run from repository root after updating the tracked review snapshot.
"""
from pathlib import Path
import re, json, html
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, Flowable
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT
from pypdf import PdfReader

root = Path.cwd()
snapshot = json.loads((root/'docs/deliverable-1/release-snapshot.json').read_text())
font_root = Path('/System/Library/Fonts/Supplemental')
font = Path(__import__('os').environ.get('LECTRA_REPORT_FONT', str(font_root/'Arial Unicode.ttf')))
bold = Path(__import__('os').environ.get('LECTRA_REPORT_BOLD_FONT', str(font_root/'Tahoma Bold.ttf')))
pdfmetrics.registerFont(TTFont('Body',str(font)))
pdfmetrics.registerFont(TTFont('BodyBold',str(bold)))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='BodyBold', italic='Body', boldItalic='BodyBold')
styles = {
 'body':ParagraphStyle('Body',fontName='Body',fontSize=9,leading=13,spaceAfter=6,splitLongWords=True),
 'small':ParagraphStyle('Small',fontName='Body',fontSize=8,leading=11,spaceAfter=5,splitLongWords=True),
 'title':ParagraphStyle('Title',fontName='BodyBold',fontSize=30,leading=36,textColor=colors.HexColor('#14213d'),spaceAfter=18),
 'chapter':ParagraphStyle('Chapter',fontName='BodyBold',fontSize=21,leading=27,textColor=colors.HexColor('#087f8c'),spaceAfter=16,keepWithNext=True),
 'h1':ParagraphStyle('H1',fontName='BodyBold',fontSize=15,leading=20,spaceBefore=14,spaceAfter=9,keepWithNext=True),
 'h2':ParagraphStyle('H2',fontName='BodyBold',fontSize=12,leading=17,spaceBefore=10,spaceAfter=7,keepWithNext=True),
 'h3':ParagraphStyle('H3',fontName='BodyBold',fontSize=10,leading=14,spaceBefore=8,spaceAfter=5,keepWithNext=True),
 'code':ParagraphStyle('Code',fontName='Courier',fontSize=7,leading=10,spaceAfter=1,wordWrap='CJK',splitLongWords=True),
 'record':ParagraphStyle('Record',fontName='BodyBold',fontSize=9,leading=13,spaceBefore=7,spaceAfter=5,backColor=colors.HexColor('#eaf3fa'),borderPadding=5,keepWithNext=True),
}
def normalize(s):
 s=s.replace('\u2011','-').replace('\u2013','-').replace('\u2014',' - ').replace('\u2610','[ ]').replace('\u2611','[x]').replace('\u2713','[x]')
 return ''.join(c if ord(c)<=0xffff else '\\U%08x'%ord(c) for c in s)
def rich(s):
 s=normalize(s)
 s=re.sub(r'\[([^\]]+)\]\(([^)]+)\)',lambda m:m[1]+' ('+m[2]+')',s)
 s=html.escape(s)
 s=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',s)
 s=re.sub(r'`([^`]+)`',lambda m:'<font name="Courier">'+m[1]+'</font>',s)
 return s
story=[]
def para(text,style='body'):
 p=Paragraph(rich(text),styles[style]);story.append(p);return p
def markdown(path):
 lines=path.read_text().splitlines();i=0
 while i<len(lines):
  line=lines[i]
  if not line.strip():i+=1;continue
  if line.startswith('```'):
   language=line[3:].strip();i+=1
   if language=='mermaid':para('Diagram source (complete, with entity/edge labels):','small')
   while i<len(lines) and not lines[i].startswith('```'):
    # Printable code-point escapes preserve unsupported non-BMP fixture meaning.
    s=normalize(lines[i]).expandtabs(2)
    story.append(Paragraph(html.escape(s).replace(' ','&#160;') or '&#160;',styles['code']));i+=1
   story.append(Spacer(1,8));i+=1;continue
  if line.startswith('|'):
   rows=[]
   while i<len(lines) and lines[i].startswith('|'):
    cells=re.split(r'(?<!\\)\|',lines[i])[1:-1];rows.append([x.strip().replace('\\|','|') for x in cells]);i+=1
   headers=rows[0]
   for row in rows[2:]:
    if not row:continue
    para(row[0],'record')
    for label,value in zip(headers[1:],row[1:]):para('**'+label+':** '+value)
   continue
  match=re.match(r'^(#{1,6})\s+(.*)',line)
  if match:para(match[2], 'h1' if len(match[1])==1 else 'h2' if len(match[1])==2 else 'h3');i+=1;continue
  if re.match(r'^\s*(?:[-*]|\d+\.)\s+',line):para(line.strip());i+=1;continue
  group=[line];i+=1
  while i<len(lines) and lines[i].strip() and not re.match(r'^(?:#|\||```|\s*[-*]\s|\d+\.\s)',lines[i]):group.append(lines[i]);i+=1
  para(' '.join(group))

class Report(SimpleDocTemplate):
 def beforeDocument(self):self.parts={}
 def afterFlowable(self,flow):
  if isinstance(flow,Paragraph) and hasattr(flow,'toc_title'):
   level,title,key=flow.toc_title;self.canv.bookmarkPage(key);self.canv.addOutlineEntry(title,key,level,False);self.notify('TOCEntry',(level,title,self.page,key))
   if level==0:self.parts[key]=self.page

def chapter(key,title):
 story.append(PageBreak());p=para(title,'chapter');p.toc_title=(0,title,key)
def source(path):
 story.append(PageBreak());p=para(path,'h1');p.toc_title=(1,path,'source-'+path.replace('/','-').replace('.','-'))
 para('Embedded source snapshot. Historical draft/pending statements retain their original planning meaning; current execution and acceptance limits are in Part F.','small')
 markdown(root/path)

import subprocess, math
from reportlab.graphics.shapes import Drawing, Rect, Line, String, Polygon
source_commit = subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
output = root/'output/pdf/lectra-deliverable-1.pdf'
page_map = root/'output/pdf/deliverable-page-map.json'
prior = json.loads(page_map.read_text()) if page_map.exists() else {}
def footer(canvas,doc):
 canvas.saveState();canvas.setStrokeColor(colors.HexColor('#c8d7e8'));canvas.line(44,39,551,39);canvas.setFont('Body',7);canvas.setFillColor(colors.HexColor('#455775'))
 canvas.drawString(44,26,'LECTRA | sprint-1 / af2e103 | Deliverable 1 | '+snapshot['date']);canvas.drawRightString(551,26,str(doc.page));canvas.restoreState()
class Slice(Flowable):
 def __init__(self,path,width,offset,height):
  Flowable.__init__(self);self.path=path;self.width=width;self.offset=offset;self.height=height
 def draw(self):
  from PIL import Image as Raster
  with Raster.open(self.path) as im:iw,ih=im.size
  total=ih*self.width/iw;self.canv.saveState();p=self.canv.beginPath();p.rect(0,0,self.width,self.height);self.canv.clipPath(p,stroke=0,fill=0)
  self.canv.drawImage(self.path,0,self.height-total+self.offset,width=self.width,height=total,mask='auto');self.canv.restoreState()
def figure(path,caption,narrow=False):
 from PIL import Image as Raster
 with Raster.open(root/path) as im:iw,ih=im.size
 w=350 if narrow else 495;total=ih*w/iw;tile=560;count=math.ceil(total/tile)
 for i in range(count):
  story.append(PageBreak());para(caption+(' / panel '+str(i+1)+' of '+str(count) if count>1 else ''),'h2');para('Actual assessed-version evidence. Original bitmap preserved; tall capture paginated at a readable width.','small')
  story.append(Slice(str(root/path),w,i*tile,min(tile,total-i*tile)))
def architecture():
 d=Drawing(490,145)
 boxes=[(0,'React / browser','Memory-only identity, forms'),(174,'Express / TypeScript','Role, CSRF, ownership, SQL'),(348,'PostgreSQL 17','Durable sessions / feedback')]
 for x,title,detail in boxes:
  d.add(Rect(x,54,142,66,rx=8,fillColor=colors.HexColor('#eaf5f8'),strokeColor=colors.HexColor('#087f8c')));d.add(String(x+8,96,title,fontName='BodyBold',fontSize=10));d.add(String(x+8,75,detail,fontName='Body',fontSize=7))
 for x in [142,316]:
  d.add(Line(x,86,x+32,86,strokeColor=colors.HexColor('#455775')));d.add(Polygon([x+32,86,x+25,90,x+25,82],fillColor=colors.HexColor('#455775')))
 d.add(String(0,27,'HTTP-only opaque cookie; server derives identity. Browser never supplies trusted role/ownership.',fontName='Body',fontSize=8));d.add(String(0,10,'Prisma manages migrations/generated adapter; runtime domain operations use parameterized PostgreSQL transactions.',fontName='Body',fontSize=7))
 story.append(d)
para('LECTRA','title');para('Deliverable 1 - Parts A-F','h1');para('Released Sprint 1 / team report review copy','chapter')
para('CPE334 Software Engineering | Theme 10: Review, Feedback, and Survey System | Lecture feedback context')
for student in snapshot['students']:para(student['id']+' - '+student['name']+' / '+student['github'])
para('Repository: https://github.com/Maibokdaimhai/LECTRA')
para('Assessed immutable application: '+snapshot['releaseTag']+' -> '+snapshot['testedCommit'])
para('Report/source revision: '+source_commit+'. The later PDF publication commit does not replace the assessed application/tag.')
para('Prepared '+snapshot['date']+'. The original instructor deadline was 8 November 2026, 23:59 Asia/Bangkok. This report records actual later release/check dates and makes no timely-submission or LEB2 submission claim.')
para('Authority: instructor deliverable/group specifications define assessment requirements. LECTRA policies, exact limits, theme and sprint allocations are team decisions. Parts A-D cover the whole product; E-F cover the bounded Sprint 1 increment.')
para('Navigation - actual page ranges','h2')
labels={'A':'FR / BR / NFR; complete SRS','B':'F-01-F-10; requirement traceability','C':'architecture / data / UI / API / security','D':'Sprints 1-3; workflow','E':'F-01-F-05; all AC / STS / DoD','F':'assessed main; tests / demos / history / contributions'}
for i,key in enumerate('ABCDEF'):
 starts=prior.get('partsStartPages',{});start=starts.get(key);end=(starts.get('ABCDEF'[i+1],0)-1 if i<5 else prior.get('pages')) if start else None
 para(key+' | pages '+(str(start)+'-'+str(end) if start else 'pagination in progress')+' | '+labels[key],'small')
para('Reading guide: full Markdown tables are expanded into labelled records to remain readable; complete diagrams-as-source supplement the visual architecture. Source snapshots retain historical planning dates/status language; current acceptance/results are in Part F. Manual/Not run/Partial and runner Pass are not interchangeable. No secrets or real student feedback are included.','small')
story.append(PageBreak());para('Contents','chapter');toc=TableOfContents();toc.levelStyles=[styles['h2'],styles['small']];story.append(toc)
parts={}
 def afterFlowable(self,flow):
  if isinstance(flow,Paragraph) and hasattr(flow,'toc_title'):
   level,title,key=flow.toc_title;self.canv.bookmarkPage(key);self.canv.addOutlineEntry(title,key,level,False);self.notify('TOCEntry',(level,title,self.page,key))
   if level==0:self.parts[key]=self.page

def chapter(key,title):
 story.append(PageBreak());p=para(title,'chapter');p.toc_title=(0,title,key)
def source(path):
 story.append(PageBreak());p=para(path,'h1');p.toc_title=(1,path,'source-'+path.replace('/','-').replace('.','-'))
 para('Embedded source snapshot. Historical draft/pending statements retain their original planning meaning; current execution and acceptance limits are in Part F.','small')
 markdown(root/path)
def footer(canvas,doc):
 canvas.saveState();canvas.setStrokeColor(colors.HexColor('#c8d7e8'));canvas.line(44,39,551,39);canvas.setFont('Body',7);canvas.setFillColor(colors.HexColor('#455775'))
 canvas.drawString(44,26,'LECTRA | REVIEW DRAFT - NOT AN ACCEPTED RELEASE | 2026-11-09');canvas.drawRightString(551,26,str(doc.page));canvas.restoreState()

para('LECTRA','title');para('Deliverable 1 - Parts A-F','h1');para('REVIEW DRAFT / NOT READY FOR SUBMISSION','chapter')
para('Theme 10: Review, Feedback, and Survey System. Context: feedback after individual lectures. Course: CPE334 Software Engineering.')
for s in snapshot['students']:para(s['id']+' - '+s['name'])
para('Repository: https://github.com/Maibokdaimhai/LECTRA')
para('Working increment PR: '+snapshot.get('pullRequest','Pending creation'))
para('Observed candidate source: '+snapshot['testedCommit'])
para('Assessed main release/tag: **NOT AVAILABLE**. This draft contains complete embedded planning sources and selected actual candidate checks. It does not replace required human review, integrated release verification or final contributions. Source/code and separate report revisions are distinguished.')
para('Known open boundaries: PR #35 integration; working increment teammate review/integration; complete STS dispositions; teammate setup reproduction; assessed main release and release-linked checks; final contribution confirmation.')
para('Reading notes: wide Markdown tables are expanded into labelled records to preserve all cells legibly. Mermaid source is retained verbatim as code, with architectural/domain descriptions in the SDS. Unsupported non-BMP fixture characters are displayed as explicit Unicode escapes. No secrets, passwords, session cookies or real feedback are embedded.','small')
story.append(PageBreak());para('Contents and page navigation','chapter');toc=TableOfContents();toc.levelStyles=[styles['h2'],styles['small']];story.append(toc)
parts=[('A','Part A - SRS and product scope',['docs/srs.md','docs/decisions.md','docs/baseline-review.md']),('B','Part B - Feature inventory and traceability',['docs/features.md','docs/traceability.md']),('C','Part C - System-Level SDS',['docs/system-sds.md','docs/sprints/sprint-1/database-foundation.md']),('D','Part D - Three-sprint plan and team workflow',['docs/sprints/plan.md','docs/sprints/sprint-1/workflow.md','docs/sprints/sprint-1/tracker.md']),('E','Part E - Feature contracts, AC, STS and Product DoD',['docs/sprints/sprint-1/README.md','docs/sprints/sprint-1/shared-contract.md','docs/sprints/sprint-1/product-dod.md']+[f'docs/sprints/sprint-1/{name}{suffix}.md' for name in ['f-01-authentication','f-02-context-discovery','f-03-survey-authoring','f-04-responses','f-05-results'] for suffix in ['', '-sts']])]

for key,title,paths in parts:
 chapter(key,title)
 if key=='C':
  para('Current implemented architecture (team design)','h1');architecture()
 for path in paths:source(path)
chapter('F','Part F - Assessed Sprint 1 execution and evidence')
para('Assessed release and actual post-main verification','h1');para(snapshot['verificationSummary'])
markdown(root/'docs/sprints/sprint-1/main-release.md')
para('Exact commands and readable runner results','h1')
for check in snapshot['results']:
 para(check['command'],'record');para('Exit '+str(check['exit'])+'; '+'; '.join(check['summary'] or ['Completed successfully.']))
para('Build/typecheck/ORM/restart are additional checks, not additional passing-test counts. All listed execution results identify actual merged main '+snapshot['testedCommit']+'. Installation used a new clone/npm ci; browser executable cache reuse is disclosed. No historical counts are combined.')
para('Safe local setup summary','h1')
para('Node 24.22.1 / npm 10.9.2 / PostgreSQL 17. Clone the repository and checkout sprint-1; install the lockfile with npm ci; use setup:local and the README private environment examples. Generate synthetic role credentials locally; migrate/seed only explicitly allowlisted isolated targets. npm run demo uses its private demo config. Never publish passwords/tokens or reuse shared data for reset-style tests. Stop/resume the named demo volume to retain data. README commands remain embedded below for reproducibility.')
source('README.md')
para('Complete S1 AC-to-test/results mapping','h1');markdown(root/'docs/deliverable-1/release-ac-results.md')
para('Two actual automated test excerpts','h1')
text=(root/'apps/api/tests/features/workflows.test.ts').read_text()
for term in ['F-04: an actual SQL fault','INT22-06:']:
 start=text.index("it('"+term);end=text.find('\nit(',start+1);excerpt=text[start:end if end!=-1 else len(text)]
 para(term,'h2');para('Real PostgreSQL fixture, trusted synthetic role login, guarded disposable target. This scenario passed in the 41-case API/database run on assessed main. Helpers perform actual HTTP calls with the session-bound CSRF token; no identity header is trusted.','small')
 for line in excerpt.splitlines():story.append(Paragraph(html.escape(normalize(line)).replace(' ','&#160;') or '&#160;',styles['code']))
para('Actual process, substantive reviews and contributions','h1');markdown(root/'docs/deliverable-1/release-process-and-contributions.md')
para('Actual release approval','h2')
history=json.loads((root/'docs/sprints/sprint-1/main-release-review-history.json').read_text());r=next(x for x in history['pullRequests'] if x['number']==40)
for review in r['reviews']:
 para(review['reviewer']+' / '+review['state']+' / '+review['submittedAt']+' / reviewed '+review['sourceSha'],'record');para(review['body'])
para('Known incomplete or limited work','h1')
para('Selected tests passed; broad STS rows remain Partial where every timing/fault/permutation/manual condition was not exercised. Actual opposite-member release review accepted the documented G-04 local MVP dispositions. Full human assistive-technology/WCAG testing was not run. Anonymous response separation, export, comparison/history, notes and P15 remain later planned work; Docker/complete CI/CD/GCP are later Lab 5 scope. No deployed security/usability outcome is certified. Pair sessions/hours were not supplied and are not invented; the contribution table records actual artifacts/reviews and confirmed identities.')
para('Submission boundary: this assembled report is for team review; no LEB2 submission is performed. The application release is immutable; later report changes identify their own revision. #8/#26 remain delivery/report tracking until actual report review/completion. The prior review draft is superseded by this assessed-release report, not relabelled as a timely submitted artifact.')
for path,caption in [
 ('docs/sprints/sprint-1/main-release-evidence/persisted-submission-narrow.png','F-04 / AC-F04-09/15/17: eligible student, saved answer readback after normal submission'),
 ('docs/sprints/sprint-1/main-release-evidence/closed-results-narrow.png','F-05 / AC-F05-03/08/17: owner, Closed persisted score distribution and written feedback'),
 ('docs/sprints/sprint-1/main-release-evidence/closed-rejection-recovered-narrow.png','F-04 / AC-F04-14/18: Closed-state rejection and persisted-status recovery; no automatic replay'),
 ('docs/sprints/sprint-1/main-release-evidence/foreign-owner-safe-list-narrow.png','F-02/F-03/F-05: different owner, scoped list; actual API assertions establish protected 404/403')]:figure(path,caption,True)
for path,caption in [
 ('docs/sprints/sprint-1/main-release-evidence/main-merge-header.png','Actual GitHub PR #40 main merge; assessed SHA verified through API'),
 ('docs/sprints/sprint-1/main-release-evidence/main-release-approval.png','Actual R1NNE0 release approval/G-04 acceptance; exact source/body embedded in Part F'),
 ('docs/sprints/sprint-1/main-release-evidence/kanban-release-snapshot.png','Actual release-time Kanban; 23 Done, #8 Started, #26 Backlog at capture; no all-Done claim')]:figure(path,caption)
output.parent.mkdir(parents=True,exist_ok=True)
doc=Report(str(output),pagesize=(595.28,841.89),leftMargin=44,rightMargin=44,topMargin=48,bottomMargin=54,title='LECTRA Deliverable 1 - Sprint 1 assessed release',author='Thanawat Suntarawattana; Songwit Rueangsawat')
doc.multiBuild(story,onFirstPage=footer,onLaterPages=footer)
reader=PdfReader(output);meta={'pages':len(reader.pages),'partsStartPages':doc.parts,'testedCommit':snapshot['testedCommit'],'releaseTag':snapshot['releaseTag'],'reportSourceCommit':source_commit,'output':str(output)}
page_map.write_text(json.dumps(meta,indent=2));print(json.dumps(meta))

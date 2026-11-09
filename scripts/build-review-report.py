"""Build a self-contained, explicitly incomplete Deliverable 1 review PDF.
Requires reportlab and pypdf; never reads private environment/credential files.
Run from repository root after updating the tracked review snapshot.
"""
from pathlib import Path
import re, json, html
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_LEFT
from pypdf import PdfReader

root = Path.cwd()
snapshot = json.loads((root/'docs/deliverable-1/review-snapshot.json').read_text())
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
 for path in paths:source(path)
chapter('F','Part F - Actual candidate evidence and remaining gates')
para('Actual verification on '+snapshot['testedCommit'],'h1')
para(snapshot['verificationSummary'])
for check in snapshot['results']:
 para(check['command'],'record');para('Exit: '+str(check['exit'])+'; '+'; '.join(check['summary'] or ['Command completed successfully.']))
para('These are candidate checks, not post-merge assessed-main checks. Installation succeeded with the unchanged lockfile; actual earlier failures/corrections are disclosed in the embedded implementation record.')
source('docs/sprints/sprint-1/implementation-evidence.md')
source('README.md')
para('Selected real test excerpts','h1')
text=(root/'apps/api/tests/features/workflows.test.ts').read_text()
for term in ['F-02: owner context','F-04: an actual SQL fault']:
 start=text.index("it('"+term) if "it('"+term in text else text.index('it("'+term)
 end=text.find('\nit(',start+1)
 excerpt=text[start:end if end!=-1 else len(text)]
 para(term,'h2')
 for line in excerpt.splitlines():story.append(Paragraph(html.escape(normalize(line)).replace(' ','&#160;') or '&#160;',styles['code']))
para('Selected actual browser evidence','h1')
para('Figure source commit: '+snapshot.get('figureSourceCommit',snapshot['testedCommit'])+'. These actual synthetic UI captures are candidate evidence, not assessed-release figures.','small')
for name in ['submission-chromium-wide.png','submission-chromium-narrow.png','results-chromium-wide.png','results-chromium-narrow.png']:
 p=root/'docs/deliverable-1/figures'/name
 if p.exists():
  story.append(PageBreak());para(name,'h2');image=Image(str(p));factor=min(495/image.imageWidth,620/image.imageHeight);image.drawWidth=image.imageWidth*factor;image.drawHeight=image.imageHeight*factor;story.append(image)
 else:para('Not available: '+name)
para('Review, integration and contribution status','h1')
para('Completed history: baseline PR #7, tracker #27, workflow #28, shared/F-01 #29, evidence plan #30, F-02 #31, F-03 #32, F-05 #33 and tooling/F-04 #34 merged. Actual approval is recorded on GitHub; no review is invented. PR #31 has the owner-accepted Good to go approval. Database PR #35 is approved but not merged at the captured audit.')
para('Maibokdaimhai: project-owner-authorized AI-assisted candidate implementation/publication and actual review of database PR #35. R1NNE0: database PR #35 author and actual reviewer of PR #34. No hours, unsupported pairing history, individual comprehension or later acceptance is inferred. The team must confirm the final contribution account/name mapping and actual personal contribution description.')
para('AI use: Codex assisted planning, implementation, test execution and this draft assembly. AI output is not teammate approval or proof that either student can explain the work. Both students remain responsible for understanding, reviewing and validating the submitted result.')
para('Final release/report gate: retain an immutable accepted main SHA/tag; run required checks on it; update AC-to-actual-test dispositions and final board/review evidence; confirm contributions; regenerate and visually check the final PDF. This draft is intentionally not presented as completion of #25/#26 or a timely submission.')

output=root/'output/pdf/lectra-deliverable-1-review-draft.pdf';output.parent.mkdir(parents=True,exist_ok=True)
doc=Report(str(output),pagesize=(595.28,841.89),leftMargin=44,rightMargin=44,topMargin=48,bottomMargin=54,title='LECTRA Deliverable 1 - Review Draft',author='LECTRA team')
doc.multiBuild(story,onFirstPage=footer,onLaterPages=footer)
reader=PdfReader(output)
meta={'pages':len(reader.pages),'partsStartPages':doc.parts,'testedCommit':snapshot['testedCommit'],'output':str(output)}
(root/'output/pdf/review-page-map.json').write_text(json.dumps(meta,indent=2));print(json.dumps(meta))

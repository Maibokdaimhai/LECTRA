import { StrictMode, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { draftFieldIssues, responseFieldIssues, type DraftField, type FieldIssue } from './ui-validation';
import './theme.css';
type User = {
    id: string;
    displayName: string;
    role: 'OWNER' | 'RESPONDENT';
};
type Session = {
    authenticated: boolean;
    user: User | null;
    csrfToken: string;
    expiresAt: string | null;
};
type Scale = {
    min: 1;
    max: 5;
    minLabel: string;
    maxLabel: string;
    interpretation: string;
};
type Question = {
    id: string | null;
    position?: number;
    prompt: string;
    type: 'RATING' | 'TEXT';
    required: boolean;
    ratingScale: Scale | null;
};
type Context = {
    course: {
        title: string;
        code: string;
    };
    section: {
        sectionCode: string;
    };
    lecture: {
        title: string;
        lectureDate: string;
    };
};
type Survey = {
    id: string;
    lectureId: string;
    title: string;
    status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
    mode: string;
    definitionRevision?: number;
    context: Context;
    questions: Question[];
    privacyDisclosure: string;
};
type Item = {
    id: string;
    title?: string;
    code?: string;
    sectionCode?: string;
    sequence?: number;
    lectureDate?: string;
    existingSurvey?: {
        id: string;
    };
    status?: string;
    participation?: {
        submitted: boolean;
    };
    mode?: string;
    course?: Context['course'];
    section?: Context['section'];
    lecture?: Context['lecture'];
};
type Collection = {
    items: Item[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
    };
};
type Answer = {
    questionId: string;
    value: string | number;
};
type Submission = {
    surveyId: string;
    submitted: boolean;
    answers: Answer[] | null;
};
type Results = {
    responseCount: number;
    questions?: {
        questionId: string;
        prompt: string;
        type: string;
        ratingScale: Scale | null;
        mean?: string | null;
        answeredCount?: number;
        distribution?: {
            score: number;
            count: number;
        }[];
        comments?: string[];
    }[];
};
class ApiError extends Error {
    constructor(public status: number, public code: string, message: string, public retryAfter?: number) { super(message); }
}
type Api = <T>(path: string, method?: string, body?: unknown) => Promise<T>;
const defaultScale = (): Scale => ({ min: 1, max: 5, minLabel: '', maxLabel: '', interpretation: '' });
function ErrorBox({ message, fields = [], focusKey }: {
    message: string;
    fields?: FieldIssue[];
    focusKey?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const focusTrigger = focusKey ?? message;
    useEffect(() => { if (message)
        ref.current?.focus(); }, [focusTrigger]);
    return message ? <div ref={ref} className="error" role="alert" tabIndex={-1}>{message}{fields.length > 0 && <ul>{fields.map(field => <li key={field.target}><a href={`#${field.target}`} onClick={event => { event.preventDefault(); document.getElementById(field.target)?.focus(); }}>{field.message}</a></li>)}</ul>}</div> : null;
}
function fieldAttributes(id: string, fields: FieldIssue[]) {
    return fields.some(field => field.target === id) ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-error` } : {};
}
function FieldError({ id, fields }: { id: string; fields: FieldIssue[] }) {
    const issue = fields.find(field => field.target === id);
    return issue ? <p className="field-error" id={`${id}-error`}>{issue.message}</p> : null;
}
const reason = (error: unknown) => error instanceof ApiError ? `${error.message} (${error.code})` : 'Connection interrupted. The outcome may be unknown. Check saved status before trying again.';
const formCodes = new Set(['INVALID_DEFINITION', 'INVALID_REQUEST', 'INVALID_ANSWERS', 'REVISION_CONFLICT', 'INVALID_STATE', 'SURVEY_ALREADY_EXISTS', 'RESPONSE_ALREADY_SUBMITTED', 'MODE_NOT_SUPPORTED', 'NOT_FOUND', 'FORBIDDEN_ROLE', 'AUTH_REQUIRED', 'SESSION_EXPIRED', 'CSRF_INVALID', 'ORIGIN_FORBIDDEN', 'BODY_TOO_LARGE', 'UNSUPPORTED_CONTENT', 'MALFORMED_JSON', 'ELIGIBILITY_EMPTY', 'ELIGIBILITY_INVALID', 'AUTH_SERVICE_UNAVAILABLE', 'SERVICE_UNAVAILABLE', 'INTERNAL_ERROR']);
const formReason = (error: unknown) => error instanceof ApiError ? `Request could not be completed.${formCodes.has(error.code) ? ` (${error.code})` : ''}` : reason(error);
function App() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [health, setHealth] = useState('Checking service connection…');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [retryAt, setRetryAt] = useState(0);
    useEffect(() => { if (!retryAt)
        return; const timer = setTimeout(() => setRetryAt(0), Math.max(0, retryAt - Date.now())); return () => clearTimeout(timer); }, [retryAt]);
    const [pendingLogout, setPendingLogout] = useState(false);
    const retainedLogoutToken = useRef('');
    const generation = useRef(0);
    const token = useRef('');
    const bootstrapFlight = useRef<{ version: number; promise: Promise<Session> } | null>(null);
    const logoutPending = useRef(false);
    const identity = useRef('');
    const [verified, setVerified] = useState(true);
    const bootstrap = useCallback(async () => {
        if (logoutPending.current) return;
        const version = generation.current;
        let flight = bootstrapFlight.current;
        let applied = false;
        setLoading(true);
        try {
            // Drain an old flight before starting a new one: even ignored fetches
            // can still change cookies. Never adopt an older flight's identity.
            if (flight && flight.version !== version) {
                try { await flight.promise; } catch { /* fresh check below */ }
                if (version !== generation.current || logoutPending.current) return;
                if (bootstrapFlight.current === flight) bootstrapFlight.current = null;
                flight = bootstrapFlight.current?.version === version ? bootstrapFlight.current : null;
            }
            flight ??= { version, promise: (async () => {
                const response = await fetch('/api/auth/session', { credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000) });
                const value = await response.json();
                if (!response.ok)
                    throw new ApiError(response.status, value.error?.code ?? 'UNAVAILABLE', value.error?.message ?? 'Service unavailable.');
                return value.data as Session;
            })() };
            bootstrapFlight.current = flight;
            const value = await flight.promise;
            if (flight.version !== generation.current || logoutPending.current)
                return;
            const nextIdentity = value.user ? `${value.user.id}:${value.user.role}` : '';
            if (identity.current !== nextIdentity) generation.current++;
            identity.current = nextIdentity;
            token.current = value.csrfToken;
            setVerified(true);
            setSession(value);
            applied = true;
        }
        catch (e) {
            if (version === generation.current && !logoutPending.current) {
                setError(reason(e));
                setVerified(false);
            }
        }
        finally {
            if (bootstrapFlight.current === flight) bootstrapFlight.current = null;
            if (version === generation.current || applied) setLoading(false);
        }
    }, []);
    useEffect(() => { void bootstrap(); const controller = new AbortController(); fetch('/api/health', { cache: 'no-store', signal: controller.signal }).then(r => { if (!r.ok)
        throw Error(); setHealth('Service connection ready.'); }).catch(() => { if (!controller.signal.aborted)
        setHealth('Service is unavailable.'); }); return () => { controller.abort(); }; }, [bootstrap]);
    useEffect(() => {
        const revalidate = () => { if (document.visibilityState === 'visible' && !pendingLogout)
            void bootstrap(); };
        document.addEventListener('visibilitychange', revalidate);
        return () => document.removeEventListener('visibilitychange', revalidate);
    }, [bootstrap, pendingLogout]);
    const api: Api = useCallback(async <T,>(path: string, method = 'GET', body?: unknown): Promise<T> => {
        const version = generation.current;
        const response = await fetch(path, { method, credentials: 'same-origin', cache: 'no-store', signal: AbortSignal.timeout(15000), headers: method === 'GET' ? {} : { 'Content-Type': 'application/json', 'X-CSRF-Token': token.current }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
        const value = response.status === 204 ? null : await response.json();
        if (version !== generation.current)
            throw new Error('Account changed.');
        if (!response.ok) {
            if (response.status === 401) {
                generation.current++;
                token.current = '';
                identity.current = '';
                setSession(null);
                setPassword('');
                setError('Your session ended. Log in again.');
                void bootstrap();
            }
            throw new ApiError(response.status, value?.error?.code ?? 'INTERNAL_ERROR', value?.error?.message ?? 'Request failed.', Number(response.headers.get('Retry-After')));
        }
        return value?.data as T;
    }, [bootstrap]);
    async function signIn(event: FormEvent) {
        event.preventDefault();
        if (busy || Date.now() < retryAt)
            return;
        setBusy(true);
        setError('');
        try {
            const result = await api<{
                user: User;
                csrfToken: string;
                expiresAt: string;
            }>('/api/auth/login', 'POST', { email, password });
            generation.current++;
            token.current = result.csrfToken;
            identity.current = `${result.user.id}:${result.user.role}`;
            setVerified(true);
            setSession({ authenticated: true, ...result });
        }
        catch (e) {
            setError(reason(e));
            if (e instanceof ApiError && e.status === 429)
                setRetryAt(Date.now() + (e.retryAfter ?? 900) * 1000);
            if (!(e instanceof ApiError) || [401, 403, 503].includes(e.status))
                await bootstrap();
        }
        finally {
            setPassword('');
            setBusy(false);
        }
    }
    async function logout() {
        if (busy)
            return;
        setBusy(true);
        logoutPending.current = true;
        setPendingLogout(true);
        retainedLogoutToken.current ||= token.current;
        generation.current++;
        identity.current = '';
        setSession(null);
        setPassword('');
        setError('');
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': retainedLogoutToken.current }, body: '{}', signal: AbortSignal.timeout(15000) });
            if (response.status !== 204)
                throw Error();
            retainedLogoutToken.current = '';
            token.current = '';
            logoutPending.current = false;
            setPendingLogout(false);
            await bootstrap();
        }
        catch {
            setError('Server sign-out is not confirmed. Private content is hidden. Retry sign-out.');
        }
        finally {
            setBusy(false);
        }
    }
    return <main><header className="brand"><div><p className="eyebrow">LECTURE FEEDBACK</p><h1>LECTRA</h1></div><p role="status">{health}</p></header>
    <ErrorBox message={error}/>
    {loading && <p role="status">Checking your session…</p>}
    {!verified && !pendingLogout && <button disabled={loading} onClick={() => void bootstrap()}>Check session / reconnect</button>}
    {loading && !session ? null : pendingLogout ? <section className="card"><h2>Signing out</h2><p>Private content is hidden until sign-out is confirmed.</p><button disabled={busy} onClick={() => void logout()}>Retry sign-out</button></section> : session?.authenticated && session.user ? <>
      <div className="userbar"><span>{session.user.displayName} · {session.user.role === 'OWNER' ? 'Instructor' : 'Student'}</span><button onClick={() => void logout()} disabled={busy}>Log out</button></div>
      <fieldset className="workspace" disabled={loading || !verified}><legend className="sr-only">Classroom workspace</legend><Workspace key={`${session.user.id}:${session.user.role}`} user={session.user} api={api}/></fieldset>
    </> : <section className="card login"><h2>Log in</h2><p>Use your privately supplied LECTRA account.</p><form onSubmit={e => void signIn(e)}>
      <label>Email<input type="email" autoComplete="username" value={email} required onChange={e => setEmail(e.target.value)}/></label>
      <label>Password<input type="password" autoComplete="current-password" value={password} required onChange={e => setPassword(e.target.value)}/></label>
      <button disabled={busy || loading || !verified || !token.current || Date.now() < retryAt}>{busy ? 'Logging in…' : 'Log in'}</button>
    </form>{Date.now() < retryAt && <p role="status">Login is temporarily rate limited. Retry after {new Date(retryAt).toLocaleTimeString()}.</p>}
    <button className="secondary" disabled={busy} onClick={() => { void bootstrap(); }}>Check session / reconnect</button></section>}
  </main>;
}
function Selector({ path, label, api, onSelect, beforeChange = () => true }: {
    path: string;
    label: string;
    api: Api;
    onSelect: (item: Item | null) => void;
    beforeChange?: () => boolean;
}) {
    const [data, setData] = useState<Collection | null>(null), [offset, setOffset] = useState(0), [value, setValue] = useState(''), [error, setError] = useState('');
    useEffect(() => { let current = true; setData(null); setError(''); api<Collection>(`${path}${path.includes('?') ? '&' : '?'}offset=${offset}`).then(d => { if (current)
        setData(d); }).catch(e => { if (current)
        setError(reason(e)); }); return () => { current = false; }; }, [path, offset, api]);
    return <section><ErrorBox message={error}/><label>{label}<select aria-label={label} value={value} disabled={!data} onChange={e => { if (!beforeChange()) return; setValue(e.target.value); onSelect(data?.items.find(i => i.id === e.target.value) ?? null); }}><option value="">Choose {label.toLowerCase()}</option>{data?.items.map(i => <option key={i.id} value={i.id}>{i.code ?? i.sectionCode ?? i.title}{i.sequence ? ` · Lecture ${i.sequence}` : ''}</option>)}</select></label>{!data && !error && <p>Loading {label.toLowerCase()}…</p>}{data && !data.items.length && <p>No {label.toLowerCase()} available.</p>}{data && data.pagination.total > 20 && <div className="actions"><button disabled={offset === 0} onClick={() => { if (!beforeChange()) return; setOffset(Math.max(0, offset - 20)); setValue(''); onSelect(null); }}>Previous {label.toLowerCase()}</button><button disabled={offset + 20 >= data.pagination.total} onClick={() => { if (!beforeChange()) return; setOffset(offset + 20); setValue(''); onSelect(null); }}>Next {label.toLowerCase()}</button></div>}</section>;
}
function Workspace({ user, api }: {
    user: User;
    api: Api;
}) {
    const [course, setCourse] = useState<Item | null>(null), [section, setSection] = useState<Item | null>(null), [lecture, setLecture] = useState<Item | null>(null), [selected, setSelected] = useState(''), [revision, setRevision] = useState(0), [error, setError] = useState(''), [busy, setBusy] = useState(false);
    const [createUncertain, setCreateUncertain] = useState(false);
    const [navigationBlocked, setNavigationBlocked] = useState(false);
    const beforeNavigate = () => !navigationBlocked || window.confirm('Discard unsaved edits or unresolved changes and leave this survey?');
    async function checkCreated() {
        if (!section || !lecture || busy) return;
        setBusy(true); setError('');
        try {
            let offset = 0;
            while (true) {
                const data = await api<Collection>(`/api/sections/${section.id}/lectures?offset=${offset}`);
                const current = data.items.find(item => item.id === lecture.id);
                if (current) { setLecture(current); setSelected(current.existingSurvey?.id ?? ''); setCreateUncertain(false); return; }
                offset += data.pagination.limit;
                if (offset >= data.pagination.total) throw new Error('Lecture no longer available.');
            }
        } catch (e) { setError(reason(e)); } finally { setBusy(false); }
    }
    async function create() { if (!lecture || busy || createUncertain)
        return; setBusy(true); setError(''); try {
        const result = await api<Survey>('/api/surveys', 'POST', { lectureId: lecture.id });
        setSelected(result.id);
        setRevision(r => r + 1);
    }
    catch (e) {
        setError(reason(e));
        setCreateUncertain(true);
    }
    finally {
        setBusy(false);
    } }
    return <><h2>{user.role === 'OWNER' ? 'Your classroom feedback' : 'Your eligible surveys'}</h2><ErrorBox message={error}/>
    {user.role === 'OWNER' && <section className="card selectors"><Selector beforeChange={beforeNavigate} label="Course" path="/api/courses" api={api} onSelect={i => { setCreateUncertain(false); setCourse(i); setSection(null); setLecture(null); setSelected(''); }}/>
      {course && <Selector beforeChange={beforeNavigate} key={course.id} label="Section" path={`/api/sections?courseId=${course.id}`} api={api} onSelect={i => { setCreateUncertain(false); setSection(i); setLecture(null); setSelected(''); }}/>}
      {section && <Selector beforeChange={beforeNavigate} key={`${section.id}:${revision}`} label="Lecture" path={`/api/sections/${section.id}/lectures`} api={api} onSelect={i => { setCreateUncertain(false); setLecture(i); setSelected(i?.existingSurvey?.id ?? ''); }}/>}
      {lecture && !selected && <button onClick={() => void create()} disabled={busy || createUncertain}>{busy ? 'Creating…' : 'Create draft'}</button>}
      {createUncertain && <><p>Creation outcome needs checking before another create attempt.</p><button disabled={busy} onClick={() => void checkCreated()}>Check persisted lecture</button></>}
    </section>}
    {!selected && <SurveyList key={revision} api={api} select={setSelected}/>}
    {selected && <><button className="secondary" onClick={() => { if (!beforeNavigate()) return; setSelected(''); setLecture(null); setRevision(r => r + 1); }}>Back to survey list</button><SurveyDetail key={selected} id={selected} api={api} owner={user.role === 'OWNER'} navigationBlocked={setNavigationBlocked} deleted={() => { setSelected(''); setLecture(null); setRevision(r => r + 1); }}/></>}
  </>;
}
function SurveyList({ api, select }: {
    api: Api;
    select: (id: string) => void;
}) {
    const [data, setData] = useState<Collection | null>(null), [offset, setOffset] = useState(0), [error, setError] = useState(''), [refresh, setRefresh] = useState(0);
    useEffect(() => { let active = true; setData(null); api<Collection>(`/api/surveys?offset=${offset}`).then(d => { if (active)
        setData(d); }).catch(e => { if (active)
        setError(reason(e)); }); return () => { active = false; }; }, [api, offset, refresh]);
    return <section className="card"><h3>Surveys</h3><ErrorBox message={error}/><button className="secondary" onClick={() => { setError(''); setRefresh(r => r + 1); }}>Refresh surveys</button>{!data && !error && <p role="status">Loading surveys…</p>}{data && !data.items.length && <p>No surveys available.</p>}
    <ul className="survey-list">{data?.items.map(s => <li key={s.id}><div><strong>{s.title || 'Untitled draft'}</strong><p>{s.course?.code} · {s.course?.title} · Section {s.section?.sectionCode} · {s.lecture?.title} · {s.lecture?.lectureDate} · {s.mode} · {s.status}{s.participation ? ` · ${s.participation.submitted ? 'Submitted' : 'Not submitted'}` : ''}</p></div><button onClick={() => select(s.id)}>Open survey</button></li>)}</ul>
    {data && <div className="actions"><button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 20))}>Previous page</button><span>{data.pagination.total} surveys</span><button disabled={offset + 20 >= data.pagination.total} onClick={() => setOffset(offset + 20)}>Next page</button></div>}
  </section>;
}
function SurveyDetail({ id, api, owner, deleted, navigationBlocked }: {
    id: string;
    api: Api;
    owner: boolean;
    deleted: () => void;
    navigationBlocked: (value: boolean) => void;
}) {
    const [survey, setSurvey] = useState<Survey | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [refresh, setRefresh] = useState(0);
    const [needsCheck, setNeedsCheck] = useState(false);
    const [editorBlocked, setEditorBlocked] = useState(false);
    useEffect(() => { navigationBlocked(editorBlocked || needsCheck || busy); return () => navigationBlocked(false); }, [editorBlocked, needsCheck, busy, navigationBlocked]);
    async function reconcile() {
        if (busy) return;
        setBusy(true); setError('');
        try { setSurvey(await api<Survey>(`/api/surveys/${id}`)); setNeedsCheck(false); }
        catch (e) {
            if (e instanceof ApiError && e.status === 404) { deleted(); return; }
            setError(reason(e));
        } finally { setBusy(false); }
    }
    useEffect(() => { let active = true; setSurvey(null); api<Survey>(`/api/surveys/${id}`).then(s => { if (active)
        setSurvey(s); }).catch(e => { if (active)
        setError(reason(e)); }); return () => { active = false; }; }, [id, api, refresh]);
    async function action(name: 'publish' | 'close' | 'delete') {
        if (!survey || busy || needsCheck || editorBlocked)
            return;
        if (name === 'delete' && !window.confirm('Delete this Draft permanently? Its unsaved definition cannot be recovered.')) return;
        if (name === 'publish' && !window.confirm('Publishing freezes the title, questions, rating scales and eligible student list. This survey is identified. Eligible students can submit once. Publish this survey?')) return;
        if (name === 'close' && !window.confirm('Closing permanently stops submissions and makes scores and written feedback available to you. This survey cannot be reopened. Close this survey?')) return;
        setBusy(true);
        setError('');
        try {
            if (name === 'delete') {
                await api(`/api/surveys/${id}`, 'DELETE', { expectedRevision: survey.definitionRevision });
                deleted();
            }
            else {
                const saved = await api<Survey>(`/api/surveys/${id}/${name}`, 'POST', name === 'publish' ? { expectedRevision: survey.definitionRevision } : {});
                setSurvey(saved);
            }
        }
        catch (e) {
            setError(reason(e));
            setNeedsCheck(true);
        }
        finally {
            setBusy(false);
        }
    }
    return <section className="card"><ErrorBox message={error}/>{needsCheck && <><p>The mutation outcome needs checking. No request will be replayed automatically.</p><button disabled={busy} onClick={() => void reconcile()}>Check persisted survey</button></>}{!survey ? <><p>Loading survey…</p><button onClick={() => { setError(''); setRefresh(r => r + 1); }}>Reload survey</button></> : <>
    <p className="eyebrow">{survey.context.course.code} · Section {survey.context.section.sectionCode} · {survey.context.lecture.lectureDate}</p><h2>{survey.title || 'Untitled draft'}</h2><p>{survey.context.lecture.title} · <strong>{survey.status}</strong></p>
    <p className="disclosure">{survey.privacyDisclosure}</p>
    {owner && survey.status === 'DRAFT' ? <DraftEditor survey={survey} api={api} saved={setSurvey} publish={() => void action('publish')} busy={busy || needsCheck} blocked={setEditorBlocked}/> : <>
      {!owner && <ResponseForm survey={survey} api={api} navigationBlocked={navigationBlocked} refreshSurvey={async () => {
        const latest = await api<Survey>(`/api/surveys/${id}`);
        setSurvey(latest);
        return latest;
      }}/>}
      {owner && <><Questionnaire survey={survey}/><ResultsView key={survey.status} id={id} api={api}/>{survey.status === 'PUBLISHED' && <button disabled={busy || needsCheck} onClick={() => void action('close')}>{busy ? 'Closing…' : 'Close survey'}</button>}</>}
    </>}
    {owner && survey.status === 'DRAFT' && <button className="danger" disabled={busy || needsCheck || editorBlocked} onClick={() => void action('delete')}>Delete draft</button>}
  </>}</section>;
}
function Questionnaire({ survey }: { survey: Survey }) {
    return <section aria-label="Frozen questionnaire"><h3>{survey.status === 'DRAFT' ? 'Saved questionnaire' : 'Frozen questionnaire'}</h3><p>Read-only · {survey.mode}</p>
      {survey.questions.map((q, index) => <section key={q.id ?? index}><h4>{index + 1}. {q.prompt}</h4><p>{q.type === 'RATING' ? 'Rating 1–5' : 'Written feedback'} · {q.required ? 'Required' : 'Optional'}</p>{q.ratingScale && <><p>1: {q.ratingScale.minLabel} · 5: {q.ratingScale.maxLabel}</p><p>{q.ratingScale.interpretation}</p></>}</section>)}
    </section>;
}
function DraftEditor({ survey, api, saved, publish, busy, blocked }: {
    survey: Survey;
    api: Api;
    saved: (s: Survey) => void;
    publish: () => void;
    busy: boolean;
    blocked: (value: boolean) => void;
}) {
    type EditorQuestion = Question & { editorKey: string };
    const formId = useId(), serial = useRef(0), pendingFocus = useRef<string | null>(null);
    function editable(items: Question[], previous: EditorQuestion[] = []): EditorQuestion[] {
        return items.map((q, index) => ({ ...q, editorKey: previous.find(old => q.id && old.id === q.id)?.editorKey ?? (previous[index]?.id === null ? previous[index].editorKey : undefined) ?? q.id ?? `new-${serial.current++}` }));
    }
    const [baseline, setBaseline] = useState(survey);
    const [needsCheck, setNeedsCheck] = useState(false), [persisted, setPersisted] = useState<Survey | null>(null), [checking, setChecking] = useState(false);
    const [title, setTitle] = useState(survey.title), [questions, setQuestions] = useState<EditorQuestion[]>(() => editable(survey.questions)), [dirty, setDirty] = useState(false), [saving, setSaving] = useState(false), [error, setError] = useState('');
    const [validation, setValidation] = useState<'draft' | 'publish' | null>(null), [errorAttempt, setErrorAttempt] = useState(0);
    const titleId = `${formId}-title`, addId = `${formId}-add`;
    const questionId = (index: number, field: DraftField) => `${formId}-${questions[index]!.editorKey}-${field}`;
    const validate = (publishing: boolean) => draftFieldIssues(title, questions, { title: titleId, add: addId, question: questionId }, publishing);
    const fields = validation ? validate(validation === 'publish') : [];
    useLayoutEffect(() => { if (pendingFocus.current) { document.getElementById(pendingFocus.current)?.focus(); pendingFocus.current = null; } }, [questions]);
    useEffect(() => { blocked(saving || needsCheck || checking || dirty); return () => blocked(false); }, [saving, needsCheck, checking, dirty, blocked]);
    useEffect(() => {
        if (!dirty && !needsCheck && !saving) { setBaseline(survey); setTitle(survey.title); setQuestions(old => editable(survey.questions, old)); }
    }, [survey, dirty, needsCheck, saving]);
    function change(index: number, patch: Partial<Question>) { setDirty(true); setQuestions(q => q.map((v, i) => i === index ? { ...v, ...patch } : v)); }
    function moveUp(index: number) {
        if (!index) return;
        pendingFocus.current = questionId(index, 'prompt');
        setDirty(true); setQuestions(old => { const items = [...old]; [items[index - 1], items[index]] = [items[index]!, items[index - 1]!]; return items; });
    }
    function remove(index: number) {
        const remaining = questions.filter((_, i) => i !== index), next = remaining[index] ?? remaining[index - 1];
        pendingFocus.current = next ? `${formId}-${next.editorKey}-prompt` : addId;
        setDirty(true); setQuestions(remaining);
    }
    function publishDraft() {
        if (validate(true).length) { setValidation('publish'); setError('Check the form fields before publishing.'); setErrorAttempt(n => n + 1); return; }
        setError(''); setValidation(null); publish();
    }
    async function checkPersisted() {
        if (checking || saving) return;
        setChecking(true); setError(''); setValidation(null);
        try { setPersisted(await api<Survey>(`/api/surveys/${survey.id}`)); }
        catch (e) { setError(formReason(e)); setErrorAttempt(n => n + 1); } finally { setChecking(false); }
    }
    function acceptPersisted(reapply: boolean) {
        if (!persisted) return;
        if (reapply) {
            const ids = new Set(persisted.questions.map(q => q.id));
            setQuestions(old => old.map(q => ({ ...q, id: q.id && ids.has(q.id) ? q.id : null })));
            setDirty(true);
        } else { setTitle(persisted.title); setQuestions(old => editable(persisted.questions, old)); setDirty(false); }
        setBaseline(persisted); saved(persisted); setNeedsCheck(false); setPersisted(null); setError(''); setValidation(null);
    }
    async function save(e: FormEvent) { e.preventDefault(); if (saving || busy || needsCheck) return; setSaving(true); setError(''); setValidation(null); try {
        const value = await api<Survey>(`/api/surveys/${survey.id}`, 'PATCH', { expectedRevision: baseline.definitionRevision, title, questions: questions.map(({ id, prompt, type, required, ratingScale }) => ({ id, prompt, type, required, ratingScale })) });
        setBaseline(value); setTitle(value.title); setQuestions(old => editable(value.questions, old));
        saved(value);
        setDirty(false);
    }
    catch (e) {
        setError(formReason(e)); setErrorAttempt(n => n + 1);
        if (e instanceof ApiError && e.status === 422 && validate(false).length) setValidation('draft');
        if (!(e instanceof ApiError) || e.status >= 500 || e.status === 409) { setNeedsCheck(true); setPersisted(null); }
    }
    finally {
        setSaving(false);
    } }
    return <><form onSubmit={e => void save(e)}><ErrorBox message={validation && !fields.length ? '' : error} fields={fields} focusKey={errorAttempt}/><fieldset disabled={saving || busy || checking}><legend className="sr-only">Draft definition</legend><label>Survey title<input id={titleId} {...fieldAttributes(titleId, fields)} value={title} onChange={e => { setTitle(e.target.value); setDirty(true); }}/></label><FieldError id={titleId} fields={fields}/>
    {questions.map((q, index) => <fieldset key={q.editorKey}><legend>Question {index + 1}</legend><label>Prompt<input id={questionId(index, 'prompt')} {...fieldAttributes(questionId(index, 'prompt'), fields)} value={q.prompt} onChange={e => change(index, { prompt: e.target.value })}/></label><FieldError id={questionId(index, 'prompt')} fields={fields}/><label>Question type<select id={questionId(index, 'type')} {...fieldAttributes(questionId(index, 'type'), fields)} value={q.type} onChange={e => change(index, { type: e.target.value as Question['type'], ratingScale: e.target.value === 'RATING' ? defaultScale() : null })}><option value="RATING">Rating 1–5</option><option value="TEXT">Written feedback</option></select></label><FieldError id={questionId(index, 'type')} fields={fields}/>
      <label className="check"><input type="checkbox" checked={q.required} onChange={e => change(index, { required: e.target.checked })}/>Required</label>
      {q.ratingScale && <div className="scale-editor">{(['minLabel', 'maxLabel', 'interpretation'] as const).map(key => <div key={key}><label>{key === 'minLabel' ? 'Score 1 label' : key === 'maxLabel' ? 'Score 5 label' : 'Scale interpretation'}<input id={questionId(index, key)} {...fieldAttributes(questionId(index, key), fields)} value={q.ratingScale![key]} onChange={e => change(index, { ratingScale: { ...q.ratingScale!, [key]: e.target.value } })}/></label><FieldError id={questionId(index, key)} fields={fields}/></div>)}</div>}
      <div className="actions"><button type="button" disabled={index === 0} onClick={() => moveUp(index)}>Move question {index + 1} up</button><button type="button" onClick={() => remove(index)}>Remove question {index + 1}</button></div>
    </fieldset>)}
    <div className="actions"><button id={addId} type="button" disabled={questions.length >= 10 || saving} onClick={() => { setDirty(true); setQuestions(q => [...q, { id: null, editorKey: `new-${serial.current++}`, prompt: '', type: 'RATING', required: true, ratingScale: defaultScale() }]); }}>Add question</button><button disabled={saving || busy || needsCheck}>{saving ? 'Saving…' : 'Save draft'}</button></div><FieldError id={addId} fields={fields}/>
  </fieldset></form><p>{dirty ? 'Unsaved changes. Save before publishing.' : `Saved revision ${baseline.definitionRevision}.`}</p><button disabled={dirty || saving || busy || needsCheck} onClick={publishDraft}>Publish survey</button>
    {needsCheck && <section><p>Your local edits are retained. Check the persisted draft before choosing to discard or reapply them. Removed questions will be recreated with new identifiers only after you explicitly reapply and save.</p><button disabled={checking || saving} onClick={() => void checkPersisted()}>Check persisted draft</button>
      {persisted && <section aria-label="Persisted draft"><h3>Persisted draft</h3><p>{persisted.title} · {persisted.status} · Revision {persisted.definitionRevision}</p><Questionnaire survey={persisted}/><button disabled={checking || busy} type="button" onClick={() => acceptPersisted(false)}>Use persisted draft</button>{persisted.status === 'DRAFT' && <button disabled={checking || busy} type="button" onClick={() => acceptPersisted(true)}>Reapply my edits to revision {persisted.definitionRevision}</button>}</section>}
    </section>}</>;
}
function ResponseForm({ survey, api, navigationBlocked, refreshSurvey }: {
    survey: Survey;
    api: Api;
    navigationBlocked: (value: boolean) => void;
    refreshSurvey: () => Promise<Survey>;
}) {
    const [submission, setSubmission] = useState<Submission | null>(null), [values, setValues] = useState<Record<string, string | number>>({}), [error, setError] = useState(''), [busy, setBusy] = useState(false), [unknownOutcome, setUnknownOutcome] = useState(false), [checking, setChecking] = useState(false);
    const formId = useId(), confirmation = useRef<HTMLHeadingElement>(null), focusConfirmation = useRef(false);
    const [validation, setValidation] = useState(false), [errorAttempt, setErrorAttempt] = useState(0);
    const target = (index: number) => `${formId}-${survey.questions[index]!.id}-${survey.questions[index]!.type === 'RATING' ? 'rating-1' : 'text'}`;
    const fields = validation ? responseFieldIssues(survey.questions, values, target) : [];
    useLayoutEffect(() => { if (submission?.submitted && focusConfirmation.current) { confirmation.current?.focus(); focusConfirmation.current = false; } }, [submission?.submitted]);
    const lifecycleNeedsCheck = useRef(false);
    useEffect(() => { navigationBlocked(busy || unknownOutcome || checking || Object.keys(values).length > 0); return () => navigationBlocked(false); }, [busy, unknownOutcome, checking, values, navigationBlocked]);
    useEffect(() => { let active = true; api<Submission>(`/api/surveys/${survey.id}/my-submission`).then(v => { if (active)
        setSubmission(v); }).catch(e => { if (active)
        setError(reason(e)); }); return () => { active = false; }; }, [api, survey.id]);
    async function recoverSubmission() {
        let latest: Survey | undefined;
        if (lifecycleNeedsCheck.current) {
            latest = await refreshSurvey();
            lifecycleNeedsCheck.current = false;
        }
        const stored = await api<Submission>(`/api/surveys/${survey.id}/my-submission`);
        if (stored.submitted && !submission?.submitted) focusConfirmation.current = true;
        setSubmission(stored); setUnknownOutcome(false);
        if (stored.submitted || latest?.status === 'CLOSED' || survey.status === 'CLOSED') setValues({});
    }
    async function checkSaved() {
        if (busy || checking) return;
        setChecking(true); setError(''); setValidation(false);
        try {
            await recoverSubmission();
        } catch (e) { setError(formReason(e)); setErrorAttempt(n => n + 1); }
        finally { setChecking(false); }
    }
    async function submit(e: FormEvent) {
        e.preventDefault();
        if (busy || checking || unknownOutcome)
            return;
        setBusy(true);
        setError(''); setValidation(false);
        try {
            const result = await api<Submission>(`/api/surveys/${survey.id}/responses`, 'POST', { answers: Object.entries(values).map(([questionId, value]) => ({ questionId, value })) });
            if (result.submitted) focusConfirmation.current = true;
            setSubmission(result);
            setUnknownOutcome(false);
            setValues({});
        }
        catch (e) {
            setError(formReason(e)); setErrorAttempt(n => n + 1);
            if (e instanceof ApiError && e.status === 422 && responseFieldIssues(survey.questions, values, target).length) setValidation(true);
            if (e instanceof ApiError && e.status === 409 && e.code === 'INVALID_STATE')
                lifecycleNeedsCheck.current = true;
            if (!(e instanceof ApiError) || e.status >= 500 || e.status === 409) {
                setUnknownOutcome(true);
                try {
                    await recoverSubmission();
                }
                catch { /* retain inputs, no automatic resend */ }
            }
        }
        finally {
            setBusy(false);
        }
    }
    if (!submission)
        return <><ErrorBox message={error}/><p>Checking your submission…</p><button disabled={checking} onClick={() => void checkSaved()}>Check saved status</button></>;
    if (submission.submitted)
        return <section><h3 ref={confirmation} tabIndex={-1}>Submission received</h3><p>Your saved answers are read-only.</p>{submission.answers?.map(a => <div className="answer" key={a.questionId}><strong>{survey.questions.find(q => q.id === a.questionId)?.prompt}</strong><p className="prewrap">{a.value}</p></div>)}</section>;
    if (survey.status === 'CLOSED')
        return <><ErrorBox message={error}/><p>{unknownOutcome ? 'This survey is closed. Check saved status to confirm whether your submission was recorded.' : 'This survey is closed. No submission was recorded for your account.'}</p>{unknownOutcome && <button disabled={busy || checking} onClick={() => void checkSaved()}>Check saved status</button>}</>;
    return <form onSubmit={e => void submit(e)}><ErrorBox message={validation && !fields.length ? '' : error} fields={fields} focusKey={errorAttempt}/>{unknownOutcome && <p role="status">Submission outcome unknown. Check saved status before trying again.</p>}<fieldset disabled={busy || checking || unknownOutcome}><legend className="sr-only">Feedback answers</legend>{survey.questions.map((q, index) => <fieldset key={q.id!} {...fieldAttributes(target(index), fields)}><legend>{q.prompt}{q.required ? ' (required)' : ' (optional)'}</legend>{q.type === 'RATING' ? <><p>1: {q.ratingScale?.minLabel} · 5: {q.ratingScale?.maxLabel}</p><p>{q.ratingScale?.interpretation}</p><div className="ratings">{[1, 2, 3, 4, 5].map(score => <label key={score}><input id={`${formId}-${q.id}-rating-${score}`} {...fieldAttributes(target(index), fields)} type="radio" name={q.id!} value={score} checked={values[q.id!] === score} onChange={() => setValues(v => ({ ...v, [q.id!]: score }))}/>{score}</label>)}</div>{!q.required && <button type="button" onClick={() => setValues(v => { const next = { ...v }; delete next[q.id!]; return next; })}>Clear answer for {q.prompt}</button>}</> : <><label>Written answer for {q.prompt}<textarea id={target(index)} {...fieldAttributes(target(index), fields)} value={values[q.id!] ?? ''} onChange={e => setValues(v => ({ ...v, [q.id!]: e.target.value }))}/></label><small>{[...String(values[q.id!] ?? '')].length}/2000 characters</small></>}<FieldError id={target(index)} fields={fields}/></fieldset>)}</fieldset><button disabled={busy || checking || unknownOutcome}>{busy ? 'Submitting…' : 'Submit feedback'}</button><button type="button" className="secondary" disabled={busy || checking} onClick={() => void checkSaved()}>Check saved status</button></form>;
}
function ResultsView({ id, api }: {
    id: string;
    api: Api;
}) {
    const [data, setData] = useState<Results | null>(null), [error, setError] = useState(''), [refresh, setRefresh] = useState(0);
    useEffect(() => { let active = true; setData(null); api<Results>(`/api/surveys/${id}/results`).then(v => { if (active)
        setData(v); }).catch(e => { if (active)
        setError(reason(e)); }); return () => { active = false; }; }, [id, api, refresh]);
    return <section><h3>Feedback summary</h3><ErrorBox message={error}/><button className="secondary" onClick={() => { setError(''); setRefresh(r => r + 1); }}>Refresh results</button>{!data && !error && <p>Loading results…</p>}{data && <><p>Responses: <strong>{data.responseCount}</strong></p>{!data.questions && <p>Scores and written feedback become available after closing.</p>}{data.questions?.map(q => <section className="result" key={q.questionId}><h4>{q.prompt}</h4>{q.type === 'RATING' ? <><p>Mean: <strong>{q.mean ?? 'No answers'}</strong> · Answered: {q.answeredCount}</p><p>1: {q.ratingScale?.minLabel} · 5: {q.ratingScale?.maxLabel}</p><p>{q.ratingScale?.interpretation}</p><table><caption>Score distribution for {q.prompt}</caption><thead><tr><th scope="col">Score</th><th scope="col">Responses</th><th scope="col">Distribution</th></tr></thead><tbody>{q.distribution?.map(b => <tr key={b.score}><th scope="row">{b.score}</th><td>{b.count}</td><td><div className="bar" style={{ width: `${Math.max(0, b.count / Math.max(1, q.answeredCount ?? 0) * 100)}%` }} aria-hidden="true"/></td></tr>)}</tbody></table></> : q.comments?.length ? <ul>{q.comments.map((text, index) => <li className="prewrap" key={index}>{text}</li>)}</ul> : <p>No written feedback.</p>}</section>)}</>}</section>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

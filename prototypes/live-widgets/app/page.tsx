'use client';

import { FormEvent, useCallback, useState } from 'react';
import { Widget } from '../components/Widget';
import { briefs, type Brief, type BriefId } from '../lib/briefs';

type DataModel = Record<string, unknown>;
type Turn = { request?: string; reply: string };
type LiveWidget = {
  messages: unknown[];
  dataModel: DataModel;
  turns: Turn[];
  revision: number;
  saved?: boolean;
};
type NoteSummary = { id: string; title: string; briefId: string; createdAt?: string };
type Note = NoteSummary & { messages: unknown[]; dataModel: DataModel; reply?: string };
type Storage = 'neon' | 'scratch';
type Generation = { messages: unknown[]; reply?: string; dataModel?: DataModel };
type Busy = 'generation' | 'chat' | 'save' | 'notes' | 'reopen';

async function request<T>(url: string, body?: object): Promise<T> {
  const response = await fetch(url, body === undefined ? undefined : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok || json.error) throw new Error(json.error || `Request failed (${response.status}).`);
  return json as T;
}

function WidgetStage({ brief, widget, active, pending, onData }: {
  brief: Brief; widget?: LiveWidget; active: boolean; pending: boolean;
  onData: (id: BriefId, data: DataModel) => void;
}) {
  const onDataModel = useCallback((data: DataModel) => onData(brief.id, data), [brief.id, onData]);
  return <div hidden={!active} aria-label={`${brief.shortTitle} Widget`}>
    {widget?.messages.length ? <div inert={pending} className="widget-canvas">
      <Widget key={widget.revision} messages={widget.messages} onDataModel={onDataModel} />
    </div> : null}
  </div>;
}

function shownValue(brief: Brief, value: unknown) {
  if (typeof value !== 'number') return value == null ? '—' : String(value);
  return brief.id === 'present-value' ? `${value}%` : new Intl.NumberFormat('en-US', {style:'currency', currency:'USD', maximumFractionDigits:2}).format(value);
}

export default function Page() {
  const [activeId, setActiveId] = useState<BriefId>(briefs[0].id);
  const [widgets, setWidgets] = useState<Partial<Record<BriefId, LiveWidget>>>({});
  const [busy, setBusy] = useState<Busy | null>(null);
  const [status, setStatus] = useState('Choose a Widget brief to build live.');
  const [failure, setFailure] = useState(false);
  const [chat, setChat] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [storage, setStorage] = useState<Storage>();
  const brief = briefs.find((entry) => entry.id === activeId)!;
  const active = widgets[activeId];

  function start(kind: Busy, message: string) { setBusy(kind); setStatus(message); setFailure(false); }
  function fail(error: unknown) { setStatus(error instanceof Error ? error.message : String(error)); setFailure(true); }
  const updateData = useCallback((id: BriefId, dataModel: DataModel) => {
    setWidgets(current => {
      const previous = current[id];
      if (!previous || JSON.stringify(previous.dataModel) === JSON.stringify(dataModel)) return current;
      return { ...current, [id]: {...previous, dataModel: structuredClone(dataModel), saved: false} };
    });
  }, []);

  async function generate() {
    if (busy) return;
    start('generation', `The Chatbot is building ${brief.shortTitle.toLowerCase()} from its brief…`);
    try {
      const result = await request<Generation>('/api/generate', { brief: brief.brief });
      if (!result.messages?.length) throw new Error('No Widget was returned by the model.');
      setWidgets(previous => ({...previous, [activeId]: {
        messages: result.messages, dataModel: result.dataModel ?? {},
        turns: result.reply ? [{reply: result.reply}] : [],
        revision: (previous[activeId]?.revision ?? 0) + 1,
      }}));
      setStatus('Live Widget ready. Change an amount, then ask the Chatbot about it.');
    } catch (error) { fail(error); }
    finally { setBusy(null); }
  }

  async function ask(message: string) {
    if (!active || busy || !message.trim()) return;
    start('chat', 'The Chatbot is reading your current Widget and responding…');
    try {
      const result = await request<Generation>('/api/change', {messages: active.messages, dataModel: active.dataModel, request: message.trim()});
      setWidgets(previous => ({...previous, [activeId]: {...active,
        messages: result.messages, dataModel: result.dataModel ?? active.dataModel,
        turns: [...active.turns, {request: message.trim(), reply: result.reply || 'The Chatbot returned an update.'}], saved: false,
      }}));
      setChat('');
      setStatus('Chatbot turn complete. Check that the Widget reflects the requested change.');
    } catch (error) { fail(error); }
    finally { setBusy(null); }
  }

  async function save() {
    if (!active || busy) return;
    start('save', 'Saving the Widget and its current values as a Note…');
    try {
      const result = await request<{id:string;storage?:Storage}>('/api/notes', {title: brief.shortTitle, briefId: activeId,
        messages: active.messages, dataModel: active.dataModel, reply: active.turns.at(-1)?.reply});
      setWidgets(previous => ({...previous, [activeId]: {...active, saved: true}}));
      setStorage(result.storage);
      setStatus(result.storage === 'scratch' ? 'Saved to local scratch storage. The ValueIt database check is still open.' : 'Saved as a Note. Reopen it to check the values.');
      // The Notes list will refresh on opening, not on every local input change.
    } catch (error) { fail(error); }
    finally { setBusy(null); }
  }

  async function listNotes() {
    if (busy) return;
    if (notesOpen) { setNotesOpen(false); return; }
    start('notes', 'Loading saved Notes…');
    try {
      const result = await request<{notes: NoteSummary[]; storage?:Storage}>('/api/notes');
      setNotes(result.notes);
      setStorage(result.storage);
      setNotesOpen(true);
      setStatus(result.notes.length ? 'Choose a Note to reopen it.' : 'No saved Notes yet.');
    } catch (error) { fail(error); }
    finally { setBusy(null); }
  }

  async function reopen(id: string) {
    if (busy) return;
    start('reopen', 'Reopening the saved Widget and restoring its values…');
    try {
      const result = await request<{note: Note; storage?:Storage}>(`/api/notes?id=${encodeURIComponent(id)}`);
      const note = result.note;
      const loadedBrief = briefs.find(entry => entry.id === note.briefId);
      if (!loadedBrief) throw new Error('The saved Note does not match a Widget brief in this prototype.');
      setWidgets(previous => ({ ...previous, [loadedBrief.id]: {
        messages: note.messages, dataModel: note.dataModel,
        turns: note.reply ? [{reply: note.reply}] : [],
        revision: (previous[loadedBrief.id]?.revision ?? 0) + 1,
        saved: true,
      }}));
      setActiveId(loadedBrief.id); setNotesOpen(false); setChat('');
      setStorage(result.storage);
      setStatus(result.storage === 'scratch' ? 'Reopened from local scratch storage, not ValueIt’s database.' : 'Reopened the saved Widget. Change its control to check it still works.');
    } catch (error) { fail(error); }
    finally { setBusy(null); }
  }

  function select(id: BriefId) {
    setActiveId(id); setChat(''); setFailure(false);
    setStatus(widgets[id] ? 'Live Widget ready.' : 'Ready to build this Widget live.');
  }

  function submit(event: FormEvent<HTMLFormElement>) {event.preventDefault(); void ask(chat);}

  return <>
    <header className="topbar">
      <div className="identity"><span className="brand">ValueIt<span className="brand-period">.</span></span><span className="top-separator"/><div className="app-title">Live Widget prototype<small>Throwaway experiment · not a Lesson Plan</small></div></div>
      <div className="top-actions"><span className="model-label"><span className="model-dot"/> GPT-6.2 Sol · xhigh</span><button className="quiet-button" onClick={listNotes} disabled={!!busy} aria-expanded={notesOpen}>Notes <span aria-hidden="true">▤</span></button></div>
    </header>
    <main className="lesson-screen">
      <section className="conversation" aria-label="Lesson conversation">
        <div className="chat-scroll">
          <div className="chat-inner">
            <p className="eyebrow">{brief.topic} <span className="muted">· Example {briefs.indexOf(brief) + 1} of {briefs.length}</span></p>
            <h1>{brief.title}</h1>
            <p className="opening">{brief.opening}</p>
            <div className="exercise"><span className="exercise-label">Try it yourself</span><p>{brief.challenge}</p></div>
            {!active ? <button className="primary-button build-button" onClick={generate} disabled={!!busy}>{busy === 'generation' ? 'Building Widget…' : <>Build live Widget <span aria-hidden="true">↗</span></>}</button> : <>
              <div className="chat-turns" aria-label="Live Chatbot messages" aria-live="polite">
                {active.turns.map((turn, i) => <div className="turn" key={i}>
                  {turn.request && <p className="student-message"><span className="message-name">You</span>{turn.request}</p>}
                  <p className="bot-message"><span className="message-name">Chatbot</span>{turn.reply}</p>
                </div>)}
              </div>
              <button className="suggestion" disabled={!!busy} onClick={() => ask(brief.ask)}><span className="message-name">Try asking the Chatbot</span><span>{brief.ask}</span><span className="suggestion-arrow" aria-hidden="true">↗</span></button>
            </>}
            <details className="evidence"><summary>For the prototype review: fixed figures and Widget brief</summary><p><strong>Independent expected result</strong><br/>{brief.expected}</p><p>{brief.brief}</p></details>
          </div>
        </div>
        <form className="composer" onSubmit={submit}>
          <label className="sr-only" htmlFor="chat-input">Message the Chatbot</label>
          <input id="chat-input" placeholder={active ? 'Ask about or change the Widget…' : 'Build a live Widget to start…'} value={chat} onChange={event => setChat(event.target.value)} disabled={!active || !!busy} autoComplete="off" enterKeyHint="send" />
          <button type="submit" className="primary-button send-button" disabled={!active || !!busy || !chat.trim()}>Send <span aria-hidden="true">↑</span></button>
        </form>
      </section>
      <section className="widget-pane" aria-label="Widget workspace">
        <nav aria-label="Widget examples" className="example-tabs">
          {briefs.map(entry => <button key={entry.id} aria-current={entry.id === activeId ? 'page' : undefined} className={`example-tab ${entry.id === activeId ? 'selected' : ''}`} onClick={() => select(entry.id)} disabled={!!busy}>
            {entry.shortTitle}{widgets[entry.id] && <span className="ready-dot" aria-label="Generated live"/>}
          </button>)}
        </nav>
        <div className="stage-scroll">
          <div className="stage-inner">
            <div className="stage-meta"><span className="pill">{active ? 'Built live' : busy === 'generation' ? 'Building live' : 'Not generated yet'}</span>{active && <span className="current-input">{brief.inputLabel} <strong>{shownValue(brief, active.dataModel[brief.inputKey])}</strong></span>}</div>
            {!active && <div className="empty-stage"><div className="placeholder-diagram" aria-hidden="true"><div className="ghost-stack"><i/><i/><i/></div><div className="ghost-stack short"><i/><i/></div></div><h2>{busy === 'generation' ? 'Building your Widget' : 'The Widget will appear here.'}</h2><p>{busy === 'generation' ? 'The Chatbot is arranging the Building blocks and checking its output before showing it.' : 'No pre-made Widget: build one from the brief and test the result.'}</p></div>}
            {briefs.map(entry => <WidgetStage key={entry.id} brief={entry} widget={widgets[entry.id]} active={entry.id === activeId} pending={!!busy} onData={updateData}/>)}
            {active && <details className="evidence technical"><summary>Current Widget state · {active.messages.length} A2UI messages</summary><p>The numbers in this view are what the Chatbot receives when you send a request. Drag the Widget’s control to see them update.</p><pre>{JSON.stringify(active.dataModel, null, 2)}</pre></details>}
          </div>
        </div>
        <footer className="stage-footer"><div className={`status ${failure ? 'failed' : ''}`} role="status" aria-live="polite">{busy && <span className="working-mark" aria-hidden="true"/>}{status}</div><div className="stage-actions">{active && <button className="quiet-button" onClick={generate} disabled={!!busy}>Build again</button>}<button className="quiet-button save-button" onClick={save} disabled={!active || !!busy}>{active?.saved ? '✓ Saved' : 'Save as Note'}</button></div></footer>
        {notesOpen && <section className="notes-panel" aria-label="Saved Notes"><div className="notes-head"><div><h2>Notes</h2><p>{storage === 'scratch' ? 'Local scratch storage — Neon check remains open.' : 'Widgets saved in the database.'}</p></div><button onClick={() => setNotesOpen(false)} className="quiet-button" aria-label="Close Notes">×</button></div>{notes.length ? <ul className="notes-list">{notes.map(note => <li key={note.id}><button className="note" onClick={() => reopen(note.id)} disabled={!!busy}><span>{note.title}</span><small>Reopen Widget ↗</small></button></li>)}</ul> : <p>No saved Notes yet.</p>}</section>}
      </section>
    </main>
  </>;
}

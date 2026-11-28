'use client';

import { useState } from 'react';
import { Widget } from '../../components/Widget';
import { briefs } from '../../lib/briefs';
import captured from '../../evidence/live-generated.json';

type DataModel = Record<string, unknown>;
const examples = [...captured.examples, {...captured.afterChat, title:'After Chatbot edit'}];

/** Replay the actual validated live responses for the owner's visual/teaching review. */
export default function ReviewPage() {
  const [index,setIndex]=useState(0);
  const [models,setModels]=useState<DataModel[]>(examples.map(example=>example.dataModel));
  const selected=examples[index];
  const brief=briefs.find(entry=>entry.id===selected.briefId)!;
  const format=(amount:unknown)=>typeof amount==='number'?(brief.id==='present-value'?`${amount}%`:new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(amount)):'—';
  return <>
    <header className="topbar">
      <div className="identity"><span className="brand">ValueIt<span className="brand-period">.</span></span><span className="top-separator"/><div className="app-title">Review live-built Widgets<small>Actual captured model outputs · interactive replay</small></div></div>
      <div className="top-actions"><span className="model-label"><span className="model-dot"/> GPT-6.2 Sol · xhigh</span><a className="quiet-button" href="/">Live prototype ↗</a></div>
    </header>
    <main className="lesson-screen">
      <section className="conversation" aria-label="Captured Lesson conversation"><div className="chat-scroll"><div className="chat-inner">
        <p className="eyebrow">{brief.topic} <span className="muted">· {index===3?'Chatbot change':'Example '+(index+1)+' of 3'}</span></p>
        <h1>{brief.title}</h1><p className="opening">{brief.opening}</p>
        <div className="exercise"><span className="exercise-label">Try it yourself</span><p>{brief.challenge}</p></div>
        {index===3 && <div className="student-message"><span className="message-name">You</span>{brief.ask}</div>}
        <div className="chat-turns"><p className="bot-message"><span className="message-name">Chatbot · captured reply</span>{selected.reply}</p></div>
        <details className="evidence"><summary>Fixed figures and Widget brief</summary><p><strong>Independent expected result</strong><br/>{brief.expected}</p><p>{brief.brief}</p></details>
      </div></div></section>
      <section className="widget-pane" aria-label="Generated Widget review">
        <nav className="example-tabs" aria-label="Captured examples">{examples.map((example,i)=><button key={i} aria-current={index===i?'page':undefined} className={`example-tab ${index===i?'selected':''}`} onClick={()=>setIndex(i)}>{example.title}</button>)}</nav>
        <div className="stage-scroll"><div className="stage-inner"><div className="stage-meta"><span className="pill">Captured live Widget · no new model call</span><span className="current-input">{brief.inputLabel} <strong>{format(models[index]?.[brief.inputKey])}</strong></span></div>
          {examples.map((example,i)=><div key={i} hidden={index!==i}><Widget messages={example.messages} onDataModel={data=>setModels(current=>JSON.stringify(current[i])===JSON.stringify(data)?current:current.map((model,j)=>j===i?data:model))}/></div>)}
          <details className="evidence technical"><summary>Current Widget state</summary><pre>{JSON.stringify(models[index],null,2)}</pre></details>
        </div></div>
        <footer className="stage-footer"><div className="status">Review the original live output. Controls recalculate locally.</div><a className="quiet-button" href="/">Build a new Widget ↗</a></footer>
      </section>
    </main>
  </>;
}

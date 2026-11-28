// PROTOTYPE tooling, throwaway. Drives headless Firefox over WebDriver BiDi, with the same few calls as cdp.mjs
// (size, goto, eval, frameEval, shot, drag, key, errors, close), so a check can run in a second browser.
// No dependencies: needs Node 22+ and Firefox (FIREFOX=/path/to/firefox to choose one).
// Each openFirefox() starts its own Firefox with its own temporary profile.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { once } from 'node:events';
const sleep = ms => new Promise(r=>setTimeout(r,ms));
// Fedora's /usr/bin/firefox is a wrapper script; the real program answers --remote-debugging-port directly.
const FIREFOX = process.env.FIREFOX || (existsSync('/usr/lib64/firefox/firefox') ? '/usr/lib64/firefox/firefox' : 'firefox');

export async function openFirefox(){
  const dir = mkdtempSync(join(tmpdir(), 'valueit-firefox-'));
  const child = spawn(FIREFOX,['--headless','--no-remote','--profile',dir,'--remote-debugging-port','0','about:blank'],{stdio:['ignore','pipe','pipe']});
  let logs='', ws, id=0, waiters = new Map();
  const errors=[];
  child.stderr.on('data', d=>logs+=d);child.stdout.on('data', d=>logs+=d);
  const close = async () => { ws?.close();child.kill(); await Promise.race([once(child,'exit').catch(()=>{}),sleep(2000)]);if(child.exitCode===null) child.kill('SIGKILL');try{rmSync(dir,{recursive:true,force:true})}catch{} };
  try{
    for(let i=0;i<200 && !logs.match(/ws:\/\/[^\s]+/);i++) await sleep(50);
    const url=logs.match(/ws:\/\/[^\s]+/)?.[0];
    if(!url) throw new Error(logs);
    ws=new WebSocket(url+'/session');
    await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
    ws.onmessage=(e)=>{const v=JSON.parse(e.data);if(v.id){const fn=waiters.get(v.id);if(fn){waiters.delete(v.id);v.type==='error'?fn.reject(new Error(v.error+' '+v.message)):fn.resolve(v.result);}}else if(v.method==='log.entryAdded' && v.params.level==='error')errors.push(v.params.text);};
    const send=(method,params={})=>new Promise((resolve,reject)=>{waiters.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
    await send('session.new',{capabilities:{alwaysMatch:{acceptInsecureCerts:false}}});
    const context=(await send('browsingContext.getTree')).contexts[0].context;
    await send('session.subscribe',{events:['log.entryAdded']});
    const evaluate=async(expression,ctx=context)=>{
      const v=await send('script.evaluate',{expression:'(async()=>JSON.stringify(await ('+expression+')))()',target:{context:ctx},awaitPromise:true});
      if(v.type==='exception')throw new Error(v.exceptionDetails.text+' for '+expression.slice(0,100));
      return v.result.type==='undefined'?undefined:JSON.parse(v.result.value);
    };
    return {
      errors,close,eval:e=>evaluate(e),frameEval:async e=>{
        const {contexts}=await send('browsingContext.getTree',{root:context});
        return evaluate(e,contexts[0].children[0].context);
      },
      size:(w,h)=>send('browsingContext.setViewport',{context,viewport:{width:w,height:h}}),
      goto:async(url,settle=200)=>{await send('browsingContext.navigate',{context,url,wait:'complete'});await evaluate('document.fonts.ready.then(()=>true)');await sleep(settle)},
      shot:async path=>{mkdirSync(dirname(path),{recursive:true});const {data}=await send('browsingContext.captureScreenshot',{context});writeFileSync(path,Buffer.from(data,'base64'));},
      drag: async (x1,y1,x2,y2)=>send('input.performActions',{context,actions:[{type:'pointer',id:'mouse',parameters:{pointerType:'mouse'},actions:[{type:'pointerMove',x:Math.round(x1),y:Math.round(y1)},{type:'pointerDown',button:0},{type:'pointerMove',x:Math.round(x2),y:Math.round(y2),duration:180},{type:'pointerUp',button:0}]}]}),
      key: async key=>{const value={ArrowDown:'\uE015',ArrowLeft:'\uE012',ArrowRight:'\uE014'}[key]||key;await send('input.performActions',{context,actions:[{type:'key',id:'keyboard',actions:[{type:'keyDown',value},{type:'keyUp',value}]}]});}
    };
  }catch(e){await close();throw e}
}

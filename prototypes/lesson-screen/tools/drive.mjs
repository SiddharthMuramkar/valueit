// PROTOTYPE tooling, throwaway. Uses a look the way a Student would and checks what happens: 64 checks.
//
//   node tools/drive.mjs chrome <look> [outDir]      node tools/drive.mjs firefox <look> [outDir]
//
// What it covers: each of the nine moments drawn straight from its address (latest words, the one source link,
// the four answers, the saved summary); the 48 / 52 split, no page scroll and the font loading at all six sizes;
// a slider from the keyboard and by a real pointer drag; Notes opening and closing; Save as Note and back;
// Send through to moment 5; the marker and the tabs bringing each Widget back; "I'm stuck", a wrong pick,
// the right pick and "Go on"; the Student's own line reaching Notes and surviving a tab switch; Finish;
// then the same look inside the prototype bar: frame sizes, the bar and the look keeping each other's
// moment, arrow keys, and the first rough pass and old links still opening.
// Prints each failure and a count; writes report.json and a few pictures into outDir/<browser>-<look>/.
// The look must be listed in looks/looks.js for the checks inside the bar.
import {open, sleep, SIZES, ROOT, lookUrl} from './cdp.mjs';
import {openFirefox} from './firefox.mjs';
import {pathToFileURL} from 'node:url';
import {mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const [browser='chrome',slug='royal',outDir=join(tmpdir(),'valueit-drive')]=process.argv.slice(2);
const dir=join(outDir,browser+'-'+slug);
mkdirSync(dir,{recursive:true});
const base=pathToFileURL(ROOT+'/index.html').href;
const page=browser==='chrome'?await open():await openFirefox();
const facts=[];
const check=(name,ok,detail)=>{facts.push({name,ok:!!ok,detail});if(!ok)console.log('FAIL',name,JSON.stringify(detail)?.slice(0,300));};
const runIn=(fn,...args)=>'('+fn.toString()+')('+args.map(a=>JSON.stringify(a)).join(',')+')';
const inspect=()=> {
 const w=document.querySelector('[data-pane="widget"]'),c=document.querySelector('[data-pane="chat"]');
 return {size:[innerWidth,innerHeight], moment:Number(new URLSearchParams(location.search).get('moment')),chat:c?.innerText,widget:w?.innerText,split:c?.getBoundingClientRect().width/innerWidth,overflow:[document.documentElement.scrollWidth-innerWidth,document.documentElement.scrollHeight-innerHeight],fonts:[...document.fonts].map(f=>[f.family,f.status]),range:[...document.querySelectorAll('input[type=range]')].filter(e=>e.offsetWidth).map(e=>+e.value),source:[...document.querySelectorAll('[data-pane="chat"] a[href]')].map(a=>[a.innerText,a.href])};
};
const norm=s=>(s||'').toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
const latest=[['coffee cart'],['what if the machine gets old'],['i built a widget'],['starbucks'],['there is a question'],['no sums needed'],['most common slip'],['borrowing adds'],['here is what to keep']];
const click=(pattern,scope='',method='click')=>{
 const norm=s=>s.toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim();
 const root=scope?document.querySelector(scope):document;
 const el=[...(root?.querySelectorAll('button,[role=tab],[role=button],[role=radio],a[href]')||[])].find(e=>e.getClientRects().length && new RegExp(pattern,'i').test(norm([e.innerText,e.getAttribute('aria-label'),e.title].filter(Boolean).join(' '))));
 if(!el)return null;
 el[method]();return el.outerHTML.slice(0,120);
};
const clickIn=async (ev,pattern,scope='',method='click')=> {
 const found=await ev(runIn(click,pattern,scope,method));if(!found)check('control '+pattern,false,scope);await sleep(100);return !!found;
};
const current=()=>page.eval('Look.moment');
const testMoment=async n=>{const v=await page.eval(runIn(inspect));check('direct moment '+n,v.moment===n && norm(v.chat).includes(latest[n-1][0]),v.chat?.slice(-260));if(n===4)check('single source link',v.source.length===1 && /sec\.gov/.test(v.source[0][1]),v.source);if(n<4)check('no premature source link '+n,v.source.length===0,v.source);if([5,6,7,8].includes(n))check('all choices at '+n,['it goes up','it goes down','it stays the same','it depends'].every(x=>norm(v.widget).includes(x)),v.widget);if(n===9)check('summary saved at 9',/saved/i.test(v.widget)&&/finish/i.test(v.widget),v.widget?.slice(-230));};
try {
 await page.size(...SIZES.ipad);
 if(slug!=='_template'){
 for(let n=1;n<=9;n++){await page.goto(lookUrl(slug,n),200);await testMoment(n);if([1,5,9].includes(n)){await sleep(450);await page.shot(dir+'/moment-'+n+'.png');}}
 for(const [size,dims] of Object.entries(SIZES)){
  await page.size(...dims);await page.goto(lookUrl(slug,5),350);
  const v=await page.eval(runIn(inspect));check('standalone geometry '+size,Math.abs(v.split-.48)<.015 && v.overflow.every(x=>x<=1) && JSON.stringify(v.size)===JSON.stringify(dims),{split:v.split,overflow:v.overflow,size:v.size});
  check('local fonts loaded '+size,v.fonts.some(f=>f[1]==='loaded')&&v.fonts.every(f=>f[1]!=='error'),v.fonts);
 }
 await page.size(...SIZES.ipad);await page.goto(lookUrl(slug,1),300);
 const ev=e=>page.eval(e);
 const slider=async idx=>{
  const before=await ev(runIn(inspect));
  const result=await ev(runIn(i=>{let e=[...document.querySelectorAll('input[type=range]')].filter(e=>e.offsetWidth)[i];if(!e)return null;e.focus();return +e.value;},idx));
  if(result===null){check('keyboard range '+idx,false);return;}
  await page.key('ArrowRight');await sleep(400);
  const after=await ev(runIn(inspect));check('keyboard range '+idx,after.range[idx]!==result&&after.widget!==before.widget,[before.range,after.range]);
 };
 const note='save as note',saved='saved to notes|^saved';
 await slider(1);
 const loanRect=await ev(`(()=>{const e=document.querySelector('input[type="range"][aria-label*="loan" i]')||document.querySelector('input[type=range]');if(!e)return null;const r=e.getBoundingClientRect();return [r.x,r.y+r.height/2,r.width,+e.value];})()`);
 if(loanRect){const[x,y,w,before]=loanRect;await page.drag(x+4,y,x+w*.78,y);await sleep(450);check('real pointer drag changed loan',!(await ev(runIn(inspect))).range.includes(before),[before,(await ev(runIn(inspect))).range]);}else check('real pointer drag has a loan control',false);
 await clickIn(ev,'^notes *[(]');check('Notes opens',await ev('!!document.querySelector("dialog[open], [role=dialog]")'));await clickIn(ev,'close|done','dialog[open], [role=dialog]');
 await clickIn(ev,note,'[data-pane="widget"]');await clickIn(ev,saved,'[data-pane="widget"]');check('Note toggles back',norm((await ev(runIn(inspect))).widget).includes('save as note'));
 for(let n=2;n<=5;n++){
  await clickIn(ev,'send','[data-pane="chat"]');check('Send to '+n,await current()===n);
  if(n===2){const v=await ev(runIn(inspect));check('loan reset',v.range.includes(5000),v.range);}
  if(n===3){
    await slider(0);
    await clickIn(ev,'on the right.*(coffee|cart)|on the right.*owns','[data-pane="chat"]');
    check('lesson marker brings back sliders',(await ev(runIn(inspect))).range.length===2);
    await clickIn(ev,'machine wears out|built for you','[data-pane="widget"]');
    check('built tab brings back years',(await ev(runIn(inspect))).range.length===1);
  }
 }
 await clickIn(ev,"i'm stuck",'[data-pane="chat"]');check('stuck to 6',await current()===6);
 await clickIn(ev,'it goes up','[data-pane="widget"]');check('wrong to 7',await current()===7);
 await clickIn(ev,'it stays the same','[data-pane="widget"]');check('right to 8',await current()===8);
 await clickIn(ev,'go on','[data-pane="chat"]');check('Go on to 9',await current()===9);
 await clickIn(ev,saved,'[data-pane="widget"]');await clickIn(ev,note,'[data-pane="widget"]');
 const noteInput=await ev(`(()=>{const el=document.querySelector('[data-pane="widget"] input[type="text"],[data-pane="widget"] input:not([type]),[data-pane="widget"] textarea');if(!el)return false;el.value='Both sides grew';el.dispatchEvent(new Event('input',{bubbles:true}));return el.value;})()`);check('summary note can take text',noteInput==='Both sides grew');
 await clickIn(ev,'done','[data-pane="widget"]');
 await clickIn(ev,'^notes *[(]');check("Student's own line visible in Notes",/Both sides grew/.test(await ev('document.querySelector("dialog[open], [role=dialog]")?.innerText||""')));await clickIn(ev,'close','dialog[open], [role=dialog]');
 check('no stale Go on button at 9',await ev(`![...document.querySelectorAll('[data-pane="chat"] button')].some(e=>/go on/i.test(e.innerText) && !e.disabled)`));
 await clickIn(ev,'on the right.*(cart|owns|lesson)','[data-pane="chat"]');check('can revisit earlier Widget after summary',(await ev(runIn(inspect))).range.length===2);
 await clickIn(ev,'what to keep','[data-pane="widget"]');check("Student's line survives switching Widgets",await ev(`[...document.querySelectorAll('[data-pane="widget"] button,[data-pane="widget"] p,[data-pane="widget"] input')].some(e=>(e.textContent+' '+(e.value||'')).includes('Both sides grew'))`));
 await clickIn(ev,'finish','[data-pane="widget"]');
 }
 await page.size(1500,1000);
 for(const [size,dims] of Object.entries(SIZES)){
  const select=size.replace(/-kb$/,'');await page.goto(base+'?look='+slug+'&moment=5&screen='+select+(size.endsWith('-kb')?'&kb=1':''),350);
  const frame=await page.frameEval('[innerWidth,innerHeight]');
  check('frame geometry '+size,JSON.stringify(dims)===JSON.stringify(frame),frame);
  if(size==='ipad'||size==='ipad-kb'){await sleep(450);await page.shot(dir+'/bar-'+size+'.png');}
 }
 await page.goto(base+'?look='+slug+'&moment=1&screen=ipad',350);
 const barMoment=()=>page.eval('P.state.moment+1');
 await page.eval('document.querySelector("#m-next").click()');await sleep(150);
 check('bar next changes look',await page.frameEval('new URLSearchParams(location.search).get("moment")')==='2');
 const sendName=slug==='_template'?'send|next':'send';
 await clickIn(e=>page.frameEval(e),sendName);
 check('look Send changes bar',await barMoment()===3);
 await page.frameEval('document.body.tabIndex=-1,document.body.focus(),true');
 await page.key('ArrowDown');await sleep(150);check('frame arrow advances',await barMoment()===4);
 await page.key('ArrowRight');await sleep(300);check('frame arrow switches look',await page.eval('P.state.look')!==slug,await page.eval('P.state.look'));
 await page.goto(base+'?look=rough&variant=A&moment=3&screen=ipad',250);
 check('rough pass renders',await page.eval('P.state.split === 48 && document.querySelector("#lookframe").hidden && !!document.querySelector("#app .w")'));
 await page.goto(base+'?variant=B&moment=3',250);
 check('legacy links work',await page.eval('P.state.look==="rough" && P.state.variant==="B"'));
} catch(e){check('driver completed',false,e.stack);}
finally{check('browser errors',page.errors.length===0,page.errors);await page.close();writeFileSync(dir+'/report.json',JSON.stringify(facts,null,2));}
const bad=facts.filter(x=>!x.ok);console.log(browser,slug,facts.length-bad.length,'passed',bad.length,'failed',dir);if(bad.length)process.exitCode=1;

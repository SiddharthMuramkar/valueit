// Night glow · throwaway Lesson screen. Both instruments use the models in widgets.js.
(() => {
  const h = P.h;
  const $ = (q) => document.querySelector(q);
  const fmt = (n) => n.toLocaleString('en-US');
  const button = (cls, label, action) => h('button', { type: 'button', class: cls, onclick: action }, label);
  const names = { lesson: P.defs.lesson.short, built: P.defs.built.short, summary: 'What to keep' };
  const saved = new Map();
  let stage, values, active, openTabs, pickedWrong, pendingWrong, noteOpen, finished, noteLine = '';
  const seedNotes = ['Cash is something the cart owns.', 'The cart itself has value.', "Maya paid for the cart with her own money."];
  const symbol = (name) => h('span', { class: 'symbol ' + name, 'aria-hidden': 'true' });
  const quiet = (msg) => h('span', { class: 'meta', text: msg });

  function countNotes() {
    $('#notes').replaceChildren(symbol('book'), 'Notes (' + (seedNotes.length + saved.size) + ')');
  }

  function saveButton(key, label) {
    const b = button('save', '', () => {
      if (saved.has(key)) saved.delete(key);
      else saved.set(key, label);
      paint();
      countNotes();
      if (key === 'summary') {
        noteOpen = saved.has(key);
        drawWidget();
      }
    });
    function paint() {
      b.replaceChildren(symbol('book'), saved.has(key) ? 'Saved to Notes ✓' : 'Save as Note');
      b.setAttribute('aria-pressed', String(saved.has(key)));
    }
    paint();
    return b;
  }

  function setTab(id, focus) {
    if (!openTabs.includes(id)) openTabs.push(id);
    active = id;
    drawWidget();
    if (focus) document.getElementById('tab-' + id)?.focus();
  }

  function marker(id) {
    const chip = button('marker', '', () => setTab(id));
    chip.append(symbol('meter'), h('span', {}, quiet('On the right'), h('strong', {text: names[id]})), h('span', {class:'arrow','aria-hidden':'true',text:'→'}));
    return chip;
  }

  function conversationItem(it) {
    if (it.t === 'divider') {
      const [num, title] = it.label.split(' · ');
      return h('div', {class:'divider'}, quiet(title ? num : P.lesson.topic), h('h1', { text: title || num }));
    }
    if (it.t === 'widget' || it.t === 'use' || it.t === 'summary') return marker(it.w || 'summary');
    if (it.t === 'act' || it.t === 'skip') {
      let words = it.text;
      if (it.id === 'a2' && pickedWrong !== 0) words = 'You picked “' + P.testIntuition.answers[pickedWrong] + '”';
      return h('p', {class:'event',text: it.t === 'skip' ? 'Skipped ' + words : words});
    }
    if (it.t === 'me') return h('article', {class:'student'}, quiet('Student'), h('p',{text:it.text}));
    const item = h('article', {class:'chatbot'}, h('header', {}, symbol('signal'), quiet('Chatbot')));
    if (it.t === 'thinking') {
      item.append(h('p',{role:'status',class:'thinking'}, h('span',{class:'pulse','aria-hidden':'true'}, h('i'), h('i'), h('i')), 'Thinking. This can take half a minute. The Widget still works while you wait.'));
      return item;
    }
    const body = h('p', {html:it.html});
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    const concepts = /(?:left for Maya|blue block|bank loan|owes the bank|coffee machine|some cash)/gi;
    for (const node of texts) {
      const s = node.textContent;
      const bits = [], matches = [...s.matchAll(concepts)];
      let pos = 0;
      for (const match of matches) {
        const word = match[0].toLowerCase();
        const color = /blue|maya/.test(word) ? 'equity' : /bank/.test(word) ? 'owes' : word === 'some cash' ? 'cash' : 'machine';
        bits.push(s.slice(pos,match.index), h('span',{class:'word '+color,text:match[0]}));
        pos = match.index + match[0].length;
      }
      if (bits.length) node.replaceWith(...bits,s.slice(pos));
    }
    item.append(body);
    if (it.source) item.append(h('a',{class:'source', href:'https://www.sec.gov/edgar/browse/?CIK=829224&owner=exclude&forms=10-K',target:'_blank',rel:'noopener',text:it.source+' ↗'}));
    if (it.save) item.append(saveButton(it.id, body.textContent));
    if (it.go && Look.moment === 8) item.append(button('primary', it.go+' →', () => Look.go(9)));
    return item;
  }

  function chart(id, startLoan) {
    const def = P.defs[id], state = values[id];
    const root = h('div', {class:'instrument'});
    const segments = new Map(), readings = [], sliders = new Map();
    const legend = h('div',{class:'legend'});
    const model = def.model(state);
    const sides = [['left','Owns'], ['right',"Owes + what’s left"]];
    const axis = h('div', {class:'comparison'});
    const rails = h('div', {class:'rails'});
    const controlArea = h('div', {class:'controls'});
    for (const [side,title] of sides) {
      const total = h('strong', {class:'total'});
      readings.push({side,total});
      if (side === 'right') axis.append(h('span',{class:'equals','aria-hidden':'true',text:'='}));
      axis.append(h('div', {class:'readout'}, quiet(title), total));
      const rail = h('div', {class:'rail', 'aria-label':title});
      const group = h('div', {class:'legend-side'});
      for (const p of model[side]) {
        const seg = h('span', {class:'segment '+p.k, 'aria-hidden':'true'});
        const val = h('b');
        const entry = h('div',{class:'entry '+p.k}, h('i'), h('span',{text:p.label}), val);
        group.append(entry);
        rail.append(seg);
        segments.set(p.k, {seg,val,entry});
      }
      legend.append(group);
      rails.append(rail);
    }
    function update(shown = state) {
      const parts = def.model(shown);
      for (const {side,total} of readings) {
        total.textContent = fmt(parts[side].reduce((a,p) => a+p.v,0));
        for (const p of parts[side]) {
          const {seg,val,entry} = segments.get(p.k);
          val.textContent = fmt(p.v);
          seg.style.setProperty('--amount', (p.v / def.max * 100) + '%');
          seg.title = p.label + ' ' + fmt(p.v);
          entry.classList.toggle('zero', p.v === 0);
        }
      }
      sliders.forEach(({c,input,output}) => {
        const n = shown[c.key];
        input.value = n;
        input.style.setProperty('--fill', (n - c.min)/(c.max - c.min)*100 + '%');
        output.textContent = fmt(n);
      });
    }
    for (const c of def.controls) {
      const isPoint = stage.point?.w === id && stage.point.key === c.key;
      const output = h('output');
      const input = h('input',{type:'range', min:c.min,max:c.max,step:c.step,value:state[c.key],id:'control-'+c.key,'aria-label':c.label});
      const label = h('label', {class:'control '+(c.key === 'loan' ? 'owes' : c.key === 'years' ? 'machine':'equity') + (isPoint ? ' pointed' : '' )},
        h('span',{class:'control-name'}, c.label,output), input);
      if (isPoint) label.append(h('span',{class:'pointer-label',text:'The Chatbot is pointing here'}));
      input.addEventListener('input', () => {
        state[c.key] = Number(input.value);
        root.dataset.touch = c.key;
        update();
      });
      input.addEventListener('change', () => delete root.dataset.touch);
      sliders.set(c.key,{c,input,output});
      controlArea.append(label);
    }
    // The illuminated bars are a second handle for the same native slider.
    for (const [key, {seg}] of segments) {
      const adjustable = id === 'built' ? ['equity','machine'].includes(key) : key !== 'cart';
      if (!adjustable) { seg.classList.add('fixed'); continue; }
      seg.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        const inputKey = id === 'built' ? 'years' : seg.matches('.cash,.equity') ? 'own' : 'loan';
        const {c,input} = sliders.get(inputKey);
        const startX = e.clientX, startY = e.clientY, initial = state[c.key];
        const vertical = getComputedStyle(seg.parentElement).flexDirection === 'column-reverse';
        const rail = seg.parentElement;
        seg.setPointerCapture(e.pointerId);
        input.focus({preventScroll:true});
        root.dataset.touch = inputKey;
        const move = (ev) => {
          const dx = ev.clientX - startX, dy = startY - ev.clientY;
          const travel = vertical && Math.abs(dy) >= Math.abs(dx) ? dy / rail.clientHeight : dx / rail.clientWidth;
          const delta = travel * def.max / (id === 'built' ? -1000 : 1);
          state[inputKey] = Math.min(c.max,Math.max(c.min,Math.round((initial+delta)/c.step)*c.step));
          update();
        };
        const stop = () => {
          seg.removeEventListener('pointermove',move);
          seg.removeEventListener('lostpointercapture',stop);
          delete root.dataset.touch;
        };
        seg.addEventListener('pointermove',move);
        seg.addEventListener('lostpointercapture',stop);
      });
    }
    for (const part of [axis,rails,legend]) part.dataset.buildPart = 'amounts';
    controlArea.dataset.buildPart = 'controls';
    root.append(axis,rails,legend,controlArea);
    update();
    if (Number.isFinite(startLoan) && startLoan !== state.loan && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const target = state.loan, start = performance.now();
      let interrupted = false;
      for (const type of ['pointerdown','keydown','input']) root.addEventListener(type, () => { interrupted=true; update(); },{once:true});
      const animateLoan = (now) => {
        if (!root.isConnected || interrupted) return;
        const t = Math.min(1, (now - start) / 300);
        const shownLoan = Math.round((startLoan + (target-startLoan) * (1-(1-t)**3)) / 1000) * 1000;
        update({...state,loan:shownLoan});
        if (t < 1) requestAnimationFrame(animateLoan);
      };
      requestAnimationFrame(animateLoan);
    }
    return root;
  }

  function intuition() {
    return h('section', {class:'intuition'},
      quiet('Test intuition'),
      h('p',{text:P.testIntuition.q}),
      h('div',{class:'answers'}, P.testIntuition.answers.map((ans,i) => {
        const wrong = stage.ti !== 'open' && pickedWrong === i;
        const right = stage.ti === 'right' && i === P.testIntuition.right;
        const b = button('answer' + (wrong ? ' wrong' : '') + (right ? ' right':''), '', () => {
          if (i !== P.testIntuition.right) {
            pendingWrong=i;
            if (Look.moment === 7) { pickedWrong=i; draw(7,7); }
            else Look.go(7);
          } else Look.go(8);
        });
        b.append(h('span',{class:'choice',text:String.fromCharCode(65+i)}), h('span',{},ans, wrong || right ? h('b',{text:wrong?'Not this one':'Right ✓'}):null));
        b.disabled = wrong || stage.ti === 'right';
        return b;
      })));
  }

  function summary() {
    const panel = h('div',{class:'summary'}, h('ol',{},P.keep.map((s) => h('li',{},h('span',{text:s})))));
    if (noteOpen) {
      const input = h('input',{placeholder:'Add a line of your own (optional)', 'aria-label':'Add a line of your own (optional)',value:noteLine,oninput:(e) => noteLine=e.target.value});
      panel.append(h('form',{class:'note-line',onsubmit:(e) => {e.preventDefault(); noteOpen=false; drawWidget();}}, input, h('button',{type:'submit',text:'Done'})));
    }
    if (saved.has('summary') && !noteOpen) {
      const edit = button('own-line', noteLine.trim() ? noteLine+' · Edit' : 'Add a line of your own', () => {
        noteOpen=true; drawWidget(); document.querySelector('.note-line input').focus();
      });
      edit.setAttribute('aria-label', 'Edit your Note' + (noteLine.trim() ? ': '+noteLine : ''));
      panel.append(edit);
    }
    const finish = button('primary', finished ? 'Lesson finished ✓' : 'Finish · Next: '+P.lesson.next+' →', () => {finished = true; drawWidget();});
    finish.disabled = finished;
    panel.append(finish);
    return panel;
  }

  function drawWidget(startLoan) {
    const id = active, isTest = id==='lesson' && stage.ti;
    const title = id === 'lesson' ? P.defs.lesson.title : names[id];
    const area = $('#stage');
    area.className = 'stage' + (isTest ? ' test' : '') + (id==='summary' ? ' closing' : '');
    const tabs = h('div',{class:'tabs',role:'tablist','aria-label':'Widgets'});
    for (const key of openTabs) {
      const tab = button('tab', '', () => setTab(key,true));
      tab.append(symbol(key==='built'?'spark':'meter'), key === 'built' ? 'Built for you' : key === 'summary' ? names.summary : "Lesson’s Widget");
      tab.id = 'tab-'+key;
      tab.setAttribute('role','tab');
      tab.setAttribute('aria-selected',String(key === id));
      if (key===id) tab.setAttribute('aria-controls','panel');
      tab.tabIndex = key===id ? 0 : -1;
      tab.onkeydown = (e) => {
        if (!['ArrowRight','ArrowLeft','Home','End'].includes(e.key)) return;
        e.preventDefault();
        const idx = openTabs.indexOf(key);
        const target = e.key==='Home'?0:e.key==='End'?openTabs.length-1:(idx+(e.key==='ArrowRight'?1:-1)+openTabs.length)%openTabs.length;
        setTab(openTabs[target],true);
      };
      tabs.append(tab);
    }
    const cap = h('div',{class:'panel-head'},
      h('h2',{text:title}), saveButton(id,title));
    const contents = h('div', {class:'panel-content'});
    cap.querySelector('button').dataset.buildPart = 'controls';
    if (id === 'summary') contents.append(summary());
    else {
      if (stage.changed?.w===id) contents.append(h('div',{class:'badge'},symbol('signal'),'The Chatbot set '+stage.changed.what));
      contents.append(chart(id, startLoan));
      if (isTest) contents.append(intuition());
    }
    const topRow = h('div',{class:'tab-row'},tabs);
    if (id !== 'summary' && !isTest && openTabs.length < 3) topRow.append(h('span',{class:'drag-hint'},h('i',{'aria-hidden':'true'}),'Drag the lit bars'));
    if (isTest) {
      const cue = button('question-jump', 'Test intuition ↓', () => {
        if (contents.scrollTop > 45) { contents.scrollTop=0; return; }
        const target = contents.querySelector('.intuition');
        contents.scrollTop += target.getBoundingClientRect().top - contents.getBoundingClientRect().top;
        target.querySelector('button:enabled')?.focus({preventScroll:true});
      });
      contents.onscroll = () => cue.textContent = contents.scrollTop > 45 ? 'Widget ↑' : 'Test intuition ↓';
      topRow.append(cue);
    }
    area.replaceChildren(topRow,h('section',{id:'panel',class:'panel',role:'tabpanel','aria-labelledby':'tab-'+id},cap,contents));
  }

  function draw(moment,previous) {
    const m = P.moments[moment-1];
    const priorLoan = previous && m.stage.changed ? values?.lesson.loan : null;
    stage = m.stage; values = {lesson:{...stage.lesson},built:{...stage.built}};
    active = stage.focus; openTabs=[...stage.open];
    if (moment === 7) { pickedWrong=pendingWrong ?? stage.wrong; pendingWrong=null; }
    else if (moment !== 8 || previous !== 7) pickedWrong=stage.wrong ?? 0;
    if (moment === 9) { saved.set('summary','What to keep'); noteOpen=true; finished=false; }
    const prog = P.ideaStates(stage);
    $('#steps').replaceChildren(...prog.ideas.map(i=>h('i',{class:i.state,title:i.label+' · '+i.state})));
    $('#idea').textContent = prog.now + (stage.ideaDone ? ' ✓' : '');
    const items = P.stream.slice(0,m.upto);
    const first = moment === 1 ? 0 : P.moments[moment-2].upto;
    const history = $('#history');
    history.replaceChildren(...items.map((it,i) => {
      if (it.t === 'thinking' && moment !== 2) return null;
      const el = conversationItem(it);
      if (i >= first) el.classList.add('fresh');
      return el;
    }).filter(Boolean));
    $('#message').value='';
    $('#send').disabled = moment === 9;
    drawWidget(priorLoan);
    countNotes();
    const stick = () => { history.scrollTop = history.scrollHeight; };
    stick(); document.fonts.ready.then(stick);
  }

  $('#course').textContent = P.lesson.topic+' · Lesson '+P.lesson.number;
  $('#lesson').textContent = P.lesson.title;
  $('.compose').addEventListener('submit',(e)=>{e.preventDefault(); Look.go(Look.moment+1);});
  $('#stuck').onclick=()=>Look.go(6);
  $('#notes').onclick=()=>{
    $('#notebook ul').replaceChildren(...[...seedNotes,...Array.from(saved, ([key, value]) => key === 'summary' && noteLine.trim() ? value + ' · ' + noteLine : value)].map(s=>h('li',{text:s})));
    $('#notebook').showModal();
  };
  Look.onMoment(draw);
  draw(Look.moment,null);
})();

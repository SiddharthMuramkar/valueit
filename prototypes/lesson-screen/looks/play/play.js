// Throwaway prototype. Both instruments use the numbers and labels in P.defs.
(() => {
  const h = P.h;
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => n.toLocaleString('en-US');
  const money = ['cash', 'cart', 'machine', 'owes', 'equity'];
  const names = {lesson: "The Lesson’s Widget", built: "Built for you", summary: "What to keep"};
  const saved = new Map();
  const notes = ['What the cart owns', 'Cash', 'Cart'];
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const stageEl = $('[data-pane="widget"]');
  let stage, front, values, wrong = 0, noteLine = '', editing = false, finished = false;
  function btn(text, cls, click, attrs) {
    return h('button', {type:'button', class:cls, text, onclick:click, ...attrs});
  }
  function countNotes() {
    $('.notes').textContent = 'Notes (' + (notes.length + saved.size) + ')';
  }
  function note(key, label) {
    const button = btn('', 'bookmark', () => {
      if (saved.has(key)) saved.delete(key);
      else saved.set(key, label);
      if (key === 'summary') { editing = saved.has(key); drawWidget(); }
      paint(); countNotes();
    });
    function paint() {
      button.textContent = saved.has(key) ? 'Saved to Notes ✓' : 'Save as Note';
      button.setAttribute('aria-pressed', String(saved.has(key)));
    }
    paint(); return button;
  }
  $('.notes').onclick = () => {
    $('.note-list').replaceChildren(h('ol', {}, [...notes, ...Array.from(saved, ([key, title]) => key === 'summary' && noteLine ? title + ' · ' + noteLine : title)].map(s => h('li', {text:s}))));
    $('dialog').showModal();
  };
  $('.close').onclick = () => $('dialog').close();
  function choose(id) {
    front = id; drawWidget();
  }
  function marker(id) {
    return btn('On the right: ' + (P.defs[id]?.short || 'What to keep') + '  →', 'marker',
      () => choose(id));
  }
  function item(it) {
    if (it.t === 'divider') {
      const [pre, title] = it.label.split(' · ');
      return h('header', {class:'chapter'}, title && h('small', {text:pre}), h('h1', {text:title || pre}));
    }
    if (it.t === 'widget' || it.t === 'use' || it.t === 'summary') return marker(it.w || 'summary');
    if (it.t === 'skip' || it.t === 'act') return h('p', {class:'aside', text:it.t === 'skip' ? 'Skipped '+it.text : it.text});
    if (it.t === 'me') return h('div', {class:'student'}, h('small',{text:'Student'}), h('p',{text:it.text}));
    const prose = h('p');
    if (it.t === 'thinking') {
      prose.append(h('span',{class:'pulse','aria-hidden':'true'},h('i'),h('i'),h('i')), 'Thinking. This can take half a minute. The Widget still works while you wait.');
    } else {
      prose.innerHTML = it.html.replace(/left for Maya|blue block|owes|bank loan/gi,
        match => '<em class="' + (/left|blue/i.test(match) ? 'equity' : 'owes') + '">' + match + '</em>');
    }
    return h('article', {class:'message'}, h('small', {class:'speaker'}, h('i',{'aria-hidden':'true'}), 'Chatbot'), prose,
      it.source && h('a', {class:'source',href:'https://www.sec.gov/edgar/browse/?CIK=829224&owner=exclude&forms=10-K',target:'_blank',rel:'noopener',text:it.source + ' ↗'}),
      it.save && note(it.id, prose.textContent), it.go && Look.moment === 8 && btn(it.go + ' →','primary',()=>Look.go(9)));
  }
  function question() {
    return h('section',{class:'question'},
      h('small',{text:'Test intuition'}), h('h3',{text:P.testIntuition.q}),
      h('div',{class:'answers'}, P.testIntuition.answers.map((text,i) => {
        const good = stage.ti === 'right' && i === P.testIntuition.right;
        const bad = ['right','wrong'].includes(stage.ti) && i === wrong;
        const button = btn('', good ? 'correct' : bad ? 'incorrect' : '', () => {
          if (i !== P.testIntuition.right) wrong = i;
          if (Look.moment === 7 && i !== P.testIntuition.right) render(7,7);
          else Look.go(i === P.testIntuition.right ? 8 : 7);
        }, {disabled:bad || stage.ti === 'right'});
        button.append(h('b',{'aria-hidden':'true',text:String.fromCharCode(65+i)}),
          h('span',{},text, (good || bad) && h('strong',{text:good?'Right ✓':'Not this one'})));
        return button;
      })));
  }
  function summary() {
    const strip = h('label',{class:'note-strip'},h('strong',{text:'Add a line of your own (optional)'}),
      h('input',{type:'text',value:noteLine,placeholder:"Borrowing doesn't change what's left for me.",oninput:e=>noteLine=e.target.value}),
      btn('Done','primary',()=>{editing=false; drawWidget();}));
    return h('section',{class:'summary'}, h('div',{class:'summary-head'}, h('h2',{text:'What to keep'}), note('summary','What to keep')),
      h('ol',{},P.keep.map((line,i)=>h('li',{},h('i',{'aria-hidden':'true',class:money[[1,3,4,0][i]]}),line))),
      editing ? strip : saved.has('summary') && btn(noteLine || 'Add a line of your own','edit',()=>{editing=true;drawWidget();}),
      btn(finished?'Lesson finished ✓':'Finish · Next: ' + P.lesson.next + ' →','primary finish',()=>{finished=true;drawWidget();},{disabled:finished}));
  }
  // The same pair of stacks, amount keys and range controls renders either Widget.
  function instrument(id) {
    const def = P.defs[id], state = values[id], compact = id === 'lesson' && stage.ti;
    const controls = new Map(), columns = {}, keys = {};
    const board = h('div',{class:'board'});
    function attachDrag(tower,control,direction = 1) {
      if (!control) return;
      tower.classList.add('draggable');
      tower.onpointerdown = e => {
        if (e.button !== 0) return;
        e.preventDefault(); tower.setPointerCapture(e.pointerId);
        const y = e.clientY, start = state[control.key], input = controls.get(control.key);
        tower.classList.add('grabbed');
        tower.onpointermove = ev => {
          const travel = tower.parentElement.getBoundingClientRect().height;
          const units = def.max / (control.key === 'years' ? 1000 : 1);
          const delta = Math.round((y-ev.clientY) * units / (travel * control.step)) * control.step * direction;
          input.value = Math.max(control.min, Math.min(control.max, start + delta));
          updateInput(input,control);
        };
        tower.onlostpointercapture = () => {
          tower.onpointermove = null; tower.classList.remove('grabbed');
        };
      };
    }
    const legend = h('div',{class:'legend'});
    ['left','right'].forEach((side,index) => {
      const total = h('strong'), stack = h('div',{class:'stack'});
      const parts = {};
      const group = h('div',{class:'key-group'});
      legend.append(group);
      def.model(state)[side].forEach(p => {
        const block = h('div',{class:'block '+p.k,'data-key':p.k},
          h('div',{class:'face'},h('span',{text:p.label})));
        const link = id === 'lesson'
          ? {cash:'own', equity:'own', machine:'loan', owes:'loan'}[p.k]
          : {machine:'years',equity:'years'}[p.k];
        attachDrag(block,def.controls.find(c=>c.key===link),id === 'built' ? -1 : 1);
        parts[p.k] = block; stack.append(block);
        const n = h('b'); keys[p.k] = n;
        group.append(h('span',{},h('i',{class:p.k}),p.label,n));
      });
      columns[side] = {total,parts};
      board.append(h('div',{class:'column'},h('div',{class:'colhead'}, h('span',{text:index ? "Owes + what's left" : 'Owns'}), total),
        h('div',{class:'bay'}, stack)));
      if (!index) board.append(h('span',{class:'equals','aria-label':'equals',text:'='}));
    });
    function paint() {
      const model = def.model(state);
      for (const [side,parts] of Object.entries(model)) {
        let sum = 0;
        parts.forEach(p=>{
          const block = columns[side].parts[p.k];
          block.style.setProperty('--amount', String(p.v / def.max));
          block.hidden = !p.v;
          block.title = p.label + ' ' + fmt(p.v) + (block.classList.contains('draggable') ? ' · Drag up or down' : '');
          keys[p.k].textContent = fmt(p.v);
          sum += p.v;
        });
        columns[side].total.textContent = fmt(sum);
      }
    }
    function updateInput(input,c) {
      state[c.key] = +input.value;
      input.parentElement.querySelector('output').textContent = fmt(+input.value);
      input.style.setProperty('--fill', (100*(state[c.key]-c.min)/(c.max-c.min))+'%');
      paint();
    }
    const sliders = h('div',{class:'sliders','data-build-part':'controls'},def.controls.map(c => {
      const pointed = stage.point?.key === c.key && stage.point.w === id;
      const input = h('input',{type:'range',id:'slide-'+c.key,'aria-label':c.label,min:c.min,max:c.max,step:c.step,value:state[c.key]});
      controls.set(c.key,input);
      input.oninput=()=>updateInput(input,c);
      return h('label',{class:'range'+(pointed?' pointed':'')},h('span',{text:c.label}),h('output',{for:input.id}),input);
    }));
    def.controls.forEach(c=>updateInput(controls.get(c.key),c));
    const status = stage.changed?.w === id ? 'The Chatbot set ' + stage.changed.what : stage.point?.w === id ? 'The Chatbot is pointing here' : '';
    const save = note(id,def.title);
    save.dataset.buildPart = 'controls';
    return h('section',{class:'instrument'+(compact?' testing':'')},
      h('div',{class:'widget-head'},h('h2',{text:def.title}),save),
      h('div',{class:'chart','data-build-part':'amounts'},board,legend), status && h('div',{class:'signal',text:'↳ '+status}),sliders, compact && question());
  }
  function drawWidget() {
    const ids = [...new Set([...stage.open,front])];
    const tabs = h('div',{class:'tabs',role:'tablist','aria-label':'Widgets'},ids.map((id,i)=>{
      const tab = btn(names[id],'tab',()=>{choose(id); stageEl.querySelector('[aria-selected=true]').focus();},
        {role:'tab','aria-selected':String(id===front),tabindex:id===front?0:-1,'aria-controls':'active-widget',id:'tab-'+id});
      tab.onkeydown = e=>{
        const to = {ArrowRight:(i+1)%ids.length,ArrowLeft:(i-1+ids.length)%ids.length,Home:0,End:ids.length-1}[e.key];
        if (to === undefined) return;
        e.preventDefault(); choose(ids[to]); stageEl.querySelector('[aria-selected=true]').focus();
      }; return tab;
    }));
    if (front === 'lesson' && stage.ti) {
      const jump = btn('Test intuition ↓', 'jump', () => {
        const panel = stageEl.querySelector('.panel');
        if (panel.scrollTop < 5) stageEl.querySelector('.question').scrollIntoView({block:'end'});
        else panel.scrollTop = 0;
      });
      // Keep tablist keyboard semantics separate from the compact scroll shortcut.
      const row = h('div',{class:'tool-row'},tabs,jump);
      stageEl.replaceChildren(row);
    } else stageEl.replaceChildren(tabs);
    stageEl.append(h('div',{class:'panel',role:'tabpanel',id:'active-widget','aria-labelledby':'tab-'+front},
      front === 'summary' ? summary() : instrument(front)));
    const jump = stageEl.querySelector('.jump');
    if (jump) stageEl.querySelector('.panel').onscroll = e => {jump.textContent = e.target.scrollTop < 5 ? 'Test intuition ↓' : 'Widget ↑';};
  }
  function render(n,prev) {
    const m = P.moments[n-1];
    const previousAmounts = front === m.stage.focus && values?.[front] && {...values[front]};
    stage = m.stage; front = stage.focus;
    values = {lesson:{...stage.lesson},built:{...stage.built}};
    if (n === 7 && prev !== 6 && prev !== 5 && prev !== 7) wrong = stage.wrong;
    if (n < 5 || (n === 8 && prev !== 7)) wrong = 0;
    if (n === 9) {saved.set('summary','What to keep'); editing=true; finished=false;}
    const progress = P.ideaStates(stage);
    $('.progress ol').replaceChildren(...progress.ideas.map(i=>h('li',{class:i.state,title:i.label+' · '+i.state})));
    $('.progress span').textContent = progress.now;
    const scroll = $('.scroll');
    let first;
    scroll.replaceChildren(...P.stream.slice(0,m.upto).flatMap((it,i)=>{
      if (it.t === 'thinking' && i !== m.upto-1) return [];
      if (it.t === 'act' && it.id === 'a2' && wrong !== 0) it={...it,text:'You picked “'+P.testIntuition.answers[wrong]+'”'};
      const el = item(it); if (i >= (P.moments[n-2]?.upto||0)) {el.classList.add('fresh'); first ||= el;}
      return [el];
    }));
    drawWidget(); countNotes(); $('.composer input').value='';
    if (prev && previousAmounts && stage.changed && !calm.matches) {
      // Only the amounts the Chatbot changed enter from their former extent.
      const def = P.defs[front], before = def.model(previousAmounts), after = def.model(values[front]);
      for (const side of ['left','right']) {
        after[side].forEach((part,i) => {
          if (part.v && part.v !== before[side][i].v) {
            const block = stageEl.querySelector('[data-key="'+part.k+'"]');
            block.animate([{transform:'scaleY('+before[side][i].v/part.v+')'}, {transform:'scaleY(1)'}],
              {duration:310,easing:'cubic-bezier(.22,.8,.32,1)'});
          }
        });
      }
    }
    // Anchor after fonts and layout settle, including direct links opened above the keyboard.
    function anchor() {
      if (!first?.isConnected) return;
      scroll.scrollTop += first.getBoundingClientRect().top-scroll.getBoundingClientRect().top-12;
      if(n===1) scroll.scrollTop = innerHeight < 490 ? scroll.scrollHeight : 0;
    }
    requestAnimationFrame(anchor); document.fonts.ready.then(anchor);
    $('.send').disabled=n===9;
  }
  $('.composer').onsubmit=e=>{e.preventDefault(); Look.go(Math.min(9,Look.moment+1));};
  $('.stuck').onclick=()=>Look.go(6);
  Look.onMoment(render); render(Look.moment);
})();

// Throwaway print-inspired Lesson screen. The two diagrams use the same model and drawing routine.
(() => {
  const { h, defs, lesson, moments, stream, testIntuition } = P;
  const $ = (selector) => document.querySelector(selector);
  const number = (v) => v.toLocaleString('en-US');
  const control = (label, cls, action, attrs = {}) =>
    h('button', { type: 'button', class: cls, onclick: action, ...attrs }, label);
  const text = (tag, cls, value) => h(tag, { class: cls, text: value });
  const saved = new Map();
  const initialNotes = ['What a company owns', 'Cash in the cart', 'The cart itself'];
  let stage, active, openTabs, vals, wrong, nextPick, noteLine = '', noteEditing = true, finished = false;
  const widgetLabel = (id) => id === 'summary' ? 'What to keep' : defs[id].short;
  const titleOf = (id) => id === 'summary' ? 'What to keep' : defs[id].title;

  function updateCount() {
    $('#notes').textContent = 'Notes (' + (initialNotes.length + saved.size) + ')';
  }
  function noteButton(key, label) {
    const btn = control('', 'note', () => {
      if (saved.has(key)) saved.delete(key);
      else saved.set(key, label);
      if (key === 'summary') {
        noteEditing = saved.has(key);
        drawWidget();
      }
      paint(); updateCount();
    });
    function paint() {
      btn.textContent = saved.has(key) ? 'Saved to Notes ✓' : 'Save as Note';
      btn.setAttribute('aria-pressed', saved.has(key));
    }
    paint(); return btn;
  }

  function progress() {
    const { ideas, now } = P.ideaStates(stage);
    $('.progress').replaceChildren(h('ol', { 'aria-label': 'Lesson progress' }, ideas.map(i =>
      h('li', { class: i.state, title: i.label, 'aria-label': i.label + ', ' + i.state }))),
      text('span', '', now));
  }

  function marker(id) {
    return control([
      h('span', { class: 'mini-plot', 'aria-hidden': 'true' }, h('i'), h('i')),
      h('span', {}, text('small', '', 'On the right:'), text('strong', '', widgetLabel(id))),
      h('span', { class: 'arrow', 'aria-hidden': 'true', text: '→' })
    ], 'marker', () => {
      if (!openTabs.includes(id)) openTabs = [id, ...openTabs];
      active = id; drawWidget(true);
      const surface = $('.page h2');
      surface?.focus({ preventScroll: true });
    });
  }
  function chatRow(it) {
    switch (it.t) {
      case 'divider': {
        const [kicker, title] = it.label.split(' · ');
        return h('header', { class: 'chapter' },
          title && text('small', '', kicker), text('h2', '', title || kicker));
      }
      case 'widget': case 'use': return marker(it.w);
      case 'summary': return marker('summary');
      case 'me': return h('div', { class: 'student' }, text('small', '', 'Student'), text('p', '', it.text));
      case 'act': case 'skip': return text('p', 'action', it.t === 'skip' ? 'Skipped ' + it.text : it.text);
      case 'thinking':
        return h('div', { class: 'thinking' }, text('small', 'byline', 'Chatbot'),
          h('p', {}, text('b', '', 'Thinking'), h('span', { class: 'pulse', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'))),
          text('p', '', 'This can take half a minute. The Widget still works while you wait.'));
      case 'bot': {
        const body = h('p', { html: it.html });
        for (const word of body.querySelectorAll('b')) word.className =
          word.textContent === 'owes' ? 'debt-word' : word.textContent === 'left for Maya' ? 'equity-word' : 'owns-word';
        // Link the hint directly to the matching blue holding, without relying on colour alone.
        if (body.textContent.includes('blue block')) body.innerHTML = body.innerHTML.replace('blue block', '<b class="equity-word">blue block</b>');
        return h('article', { class: 'chatbot' }, text('small', 'byline', 'Chatbot'), body,
          it.source && h('a', { class: 'source', href: 'https://www.sec.gov/edgar/browse/?CIK=829224&owner=exclude&forms=10-K',
            target: '_blank', rel: 'noopener', text: it.source + ' ↗' }),
          it.save && noteButton(it.id, body.textContent),
          it.go && (Look.moment === 9 ? text('span','history-go',it.go + ' ✓') : control(it.go + ' →', 'solid', () => Look.go(9))));
      }
    }
  }

  const sides = [{ key: 'left', title: 'Owns' }, { key: 'right', title: "Owes + what's left" }];
  function diagram(def, values, id, isNew) {
    const sheet = h('div', { class: 'sheet', 'data-build-part': 'amounts' });
    const caption = h('div', { class: 'totals' });
    const plot = h('div', { class: 'plot' });
    const legend = h('div', { class: 'ledgers' });
    const model = () => def.model(values);
    const columns = sides.map(({ key, title }) => {
      const sum = h('strong', { class: 'sum', 'data-side': key });
      caption.append(h('div', {}, text('small', '', title), sum));
      const col = h('div', { class: 'column', 'aria-hidden': 'true' });
      const list = h('dl');
      const parts = model()[key].map(p => {
        const block = h('div', { class: 'block ' + p.k, title: p.label, 'data-part': p.k });
        const v = h('dd');
        col.append(block);
        list.append(h('div', {}, h('dt', {}, h('i', { class: 'swatch ' + p.k }), p.label), v));
        return { block, v };
      });
      plot.append(col); legend.append(list);
      return { key, sum, parts };
    });
    caption.append(h('span', { class: 'equals', 'aria-hidden': 'true', text: '=' }));
    const rows = h('div', { class: 'controls', 'data-build-part': 'controls' });
    const inputs = new Map();
    const driver = def.controls[0];
    const grip = h('span', {class:'grip', 'aria-hidden':'true'}, text('span', '', id === 'lesson' ? '↕ Bank loan' : '↕ Years of use'));
    const ticks = h('div', {class:'ticks','aria-hidden':'true'}, [4,3,2,1].map(n=>text('span','', (def.max * n / 4000) + 'k')));
    plot.append(ticks,grip);
    const draw = (roll = false) => {
      const data = model();
      for (const { key, sum, parts } of columns) {
        const value = number(data[key].reduce((all, p) => all + p.v, 0));
        if (roll && value !== sum.textContent && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
          sum.getAnimations().forEach(a => a.cancel());
          sum.animate([{transform: 'translateY(.1em)'}, {transform: 'translateY(0)'}], {duration: 160, easing: 'ease-out'});
        }
        sum.textContent = value;
        data[key].forEach((p, i) => {
          parts[i].block.style.height = (100 * p.v / def.max) + '%';
          parts[i].v.textContent = number(p.v);
        });
      }
      const total = data.right.reduce((sum, part) => sum + part.v, 0);
      grip.style.bottom = (100 * total / def.max) + '%';
      for (const c of def.controls) {
        const {input, output} = inputs.get(c.key);
        input.value = values[c.key]; output.textContent = number(values[c.key]);
        input.setAttribute('aria-valuetext', number(values[c.key]));
        input.style.setProperty('--fill', (100 * (values[c.key] - c.min) / (c.max - c.min)) + '%');
      }
    };
    for (const c of def.controls) {
      const input = h('input', {type:'range', id: 'paper-' + c.key, min:c.min, max:c.max, step:c.step, value:values[c.key], 'aria-label':c.label});
      const output = h('output', {for:'paper-' + c.key});
      const pointed = stage.point?.key === c.key && stage.point.w === id;
      rows.append(h('label', {class: 'adjust' + (pointed ? ' pointed' : '')},
        h('span', {}, c.label, pointed && text('em', '', 'The Chatbot is pointing here')), input, output));
      inputs.set(c.key, {input, output});
      input.oninput = () => { values[c.key] = Number(input.value); draw(true); };
    }
    // A second way to operate the same controls. Up increases the height of the grabbed block.
    function draggable(block, c) {
      const key = c.key;
      block.classList.add('grabbable');
      block.addEventListener('pointerdown', e => {
        if (e.button !== 0) return;
        const start = e.clientY, initial = values[key];
        const unit = plot.clientHeight / def.max * (key === 'years' ? -1000 : 1);
        block.setPointerCapture(e.pointerId);
        block.onpointermove = ev => {
          values[key] = Math.min(c.max, Math.max(c.min, initial + c.step * Math.round((start - ev.clientY) / (unit * c.step))));
          draw(true);
        };
        block.onlostpointercapture = () => { block.onpointermove = null; };
      });
    }
    draggable(grip, driver);
    for (const block of plot.querySelectorAll('.block')) {
      const part = block.dataset.part;
      const key = id === 'built' ? 'years' : ['machine', 'owes'].includes(part) ? 'loan' : 'own';
      if ((id === 'built' && !['machine', 'equity'].includes(part)) || (id === 'lesson' && part === 'cart')) continue;
      draggable(block, def.controls.find(c => c.key === key));
    }
    sheet.append(caption, plot, legend);
    if (isNew) sheet.classList.add('assemble');
    draw();
    return [sheet, rows];
  }

  function question() {
    return h('section', {class: 'question'}, text('small', '', 'Test intuition'), text('p', '', testIntuition.q),
      h('div', {class: 'answers'}, testIntuition.answers.map((answer, i) => {
        const incorrect = i === wrong && ['wrong','right'].includes(stage.ti);
        const correct = i === testIntuition.right && stage.ti === 'right';
        return control([text('span', 'letter', String.fromCharCode(65 + i)),
          h('span', {}, answer, incorrect && text('b', 'status', 'Not this one'), correct && text('b', 'status', 'Right ✓'))],
          incorrect ? 'incorrect' : correct ? 'correct' : '', () => {
            if (i === testIntuition.right) Look.go(8);
            else {
              nextPick = i;
              if (Look.moment === 7) { wrong = i; drawWidget(); drawChat(); }
              else Look.go(7);
            }
          }, {disabled: incorrect || stage.ti === 'right'});
      })));
  }

  function summary() {
    const field = h('input', {type:'text', placeholder:'Add a line of your own (optional)', 'aria-label':'Add a line of your own (optional)', value:noteLine,
      oninput:e => {noteLine = e.target.value;}});
    return [h('ol', {class:'keepers'}, P.keep.map(k => text('li','',k))),
      saved.has('summary') && (noteEditing
        ? h('form', {class:'strip', onsubmit:e=>{e.preventDefault(); noteEditing=false; drawWidget();}}, field, h('button',{type:'submit',class:'outline',text:'Done'}))
        : control(noteLine || 'Add a line of your own', 'edit-line', () => {noteEditing=true; drawWidget(); $('.strip input').focus();})),
      control(finished ? 'Lesson finished ✓' : 'Finish · Next: ' + lesson.next + ' →', 'finish', () => { finished=true; drawWidget(); }, {disabled:finished})];
  }

  function drawWidget(animate = false) {
    const tabButtons = $('.tabs');
    tabButtons.replaceChildren();
    tabButtons.hidden = openTabs.length < 2;
    if (!tabButtons.hidden) {
      tabButtons.setAttribute('role','tablist'); tabButtons.setAttribute('aria-label','Widgets');
      for (const id of openTabs) {
        const btn = control(id === 'lesson' ? "The Lesson’s Widget" : id === 'built' ? 'Built for you · ' + widgetLabel(id) : 'What to keep',
          'tab', () => {active=id;drawWidget(true); $('#tab-' + id).focus();},
          {id:'tab-'+id, role:'tab', 'aria-selected':String(active===id),'aria-controls':'paper-panel',tabindex:active===id?'0':'-1'});
        btn.onkeydown = e => {
          if (['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) {
            e.preventDefault();
            const step = e.key === 'ArrowLeft' ? -1 : 1;
            const target = e.key === 'Home' ? openTabs[0] : e.key === 'End' ? openTabs.at(-1) : openTabs[(openTabs.indexOf(id)+step+openTabs.length)%openTabs.length];
            $('#tab-' + target).click();
          }
        };
        tabButtons.append(btn);
      }
    }
    const page = $('.page');
    page.id = 'paper-panel';
    if (!tabButtons.hidden) {page.setAttribute('role','tabpanel'); page.setAttribute('aria-labelledby','tab-'+active);}
    else {page.removeAttribute('role'); page.removeAttribute('aria-labelledby');}
    const showQuestion = !!stage.ti && active === 'lesson';
    page.className = 'page' + (showQuestion ? ' testing' : '') + (active === 'summary' ? ' summary' : '');
    const badge = stage.changed?.w === active ? 'The Chatbot set ' + stage.changed.what : null;
    const label = active === 'lesson' ? "The Lesson’s Widget" : active === 'built' ? 'Built for you' : 'Lesson 1 · Notes';
    const note = noteButton(active,titleOf(active));
    note.dataset.buildPart = 'controls';
    if (tabButtons.hidden) {
      page.replaceChildren(h('div', {class:'folio'}, text('small','',label), note));
    } else {
      tabButtons.parentElement.querySelector('.tabs-note')?.remove();
      const wrap = h('div',{class:'tabs-note'},note);
      tabButtons.after(wrap);
      page.replaceChildren();
    }
    if (tabButtons.hidden) tabButtons.parentElement.querySelector('.tabs-note')?.remove();
    const heading = h('h2',{text:titleOf(active),tabindex:'-1'});
    const pane = page.parentElement;
    pane.onscroll = null; pane.scrollTop = 0;
    if (showQuestion) {
      const jump = control('Test intuition ↓', 'jump', () => {
        if (pane.scrollTop > 5) pane.scrollTop = 0;
        else page.querySelector('.question').scrollIntoView({block:'end'});
      });
      page.append(h('div',{class:'question-nav'},heading,jump));
      pane.onscroll = () => {jump.textContent = pane.scrollTop > 5 ? 'Widget ↑' : 'Test intuition ↓';};
    } else page.append(heading);
    if (active === 'summary') page.append(...summary().filter(Boolean));
    else {
      if (badge) page.append(text('span','badge', badge));
      page.append(...diagram(defs[active],vals[active],active,animate));
      if (showQuestion) page.append(question());
    }
  }

  function drawChat(previous = null) {
    const box = $('.stream');
    const upto = moments[Look.moment-1].upto;
    const items = stream.slice(0, upto);
    const old = previous ? moments[previous-1].upto : upto;
    box.replaceChildren(...items.flatMap((it, i) => {
      if (it.t === 'thinking' && i !== items.length - 1) return [];
      let item = it;
      if (it.id === 'a2' && wrong !== 0 && wrong != null) item = {...it, text:'You picked “' + testIntuition.answers[wrong] + '”'};
      const row = chatRow(item);
      if (i >= old) row.classList.add('arrival');
      return row;
    }));
    const anchor = () => { if (Look.moment > 1) box.scrollTop = box.scrollHeight; else box.scrollTop = 0; };
    anchor(); document.fonts.ready.then(anchor);
  }
  function render(moment, previous) {
    const last = active, lastValues = vals;
    stage = moments[moment - 1].stage; active = stage.focus; openTabs = [...stage.open];
    vals = {lesson:{...stage.lesson}, built:{...stage.built}};
    wrong = moment === 7 ? (nextPick ?? stage.wrong) : moment === 8 ? (wrong ?? stage.wrong) : null; nextPick = null;
    if (moment === 9) {saved.set('summary','What to keep'); noteEditing=true; finished=false;}
    drawChat(previous); drawWidget(!!previous && active !== last); progress(); updateCount();
    if (previous && last === active && defs[active] && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // The Chatbot changes the holding in place. Animate each part from its former baseline.
      const oldData = defs[active].model(lastValues[active]), data = defs[active].model(vals[active]);
      const unit = $('.plot').clientHeight / defs[active].max;
      for (const {key} of sides) {
        let distance = 0;
        data[key].forEach((part, i) => {
          const before = oldData[key][i].v;
          if (part.v > 0 && (before !== part.v || distance)) {
            $('.block.' + part.k).animate([{transform:'translateY(' + (distance * unit) + 'px) scaleY(' + (before / part.v) + ')'}, {transform:'none'}], {duration:290,easing:'cubic-bezier(.22,.75,.24,1)'});
          }
          distance += part.v - before;
        });
      }
    }
    $('.message input').value=''; $('.send').disabled=moment===9;
  }
  $('.compose').onsubmit = e => { e.preventDefault(); if (Look.moment < 9) Look.go(Look.moment + 1); };
  $('.stuck').onclick = () => Look.go(6);
  $('#notes').onclick = () => {
    const notes = initialNotes.map(v => text('li','',v));
    for (const [key, value] of saved) notes.push(h('li',{},value,key==='summary' && noteLine && text('p','',noteLine)));
    $('#notebook ul').replaceChildren(...notes); $('#notebook').showModal();
  };
  Look.onMoment(render);
  render(Look.moment, null);
})();

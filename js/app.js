(function () {
  var EL = Interpret.EL;
  var CYCLE = Interpret.CYCLE;
  var YEARS = 5;

  var CITIES = [
    ['서울', 126.98], ['부산', 129.08], ['대구', 128.60], ['인천', 126.70], ['광주', 126.85],
    ['대전', 127.38], ['울산', 129.31], ['세종', 127.29], ['수원', 127.03], ['성남', 127.13],
    ['고양', 126.83], ['용인', 127.18], ['춘천', 127.73], ['원주', 127.92], ['강릉', 128.90],
    ['청주', 127.49], ['천안', 127.15], ['전주', 127.15], ['군산', 126.74], ['목포', 126.39],
    ['여수', 127.66], ['순천', 127.49], ['포항', 129.37], ['경주', 129.22], ['안동', 128.73],
    ['구미', 128.34], ['창원', 128.68], ['진주', 128.08], ['김해', 128.89], ['제주', 126.53],
    ['서귀포', 126.56], ['평양', 125.75], ['기타·해외 (서울 기준)', 126.98]
  ];

  var $ = function (id) { return document.getElementById(id); };
  var form = $('form');

  function option(sel, value, text) {
    var o = document.createElement('option');
    o.value = value; o.textContent = text;
    sel.appendChild(o);
  }

  function initSelects() {
    var now = new Date().getFullYear();
    for (var y = now; y >= 1920; y--) option($('year'), y, y + '년');
    for (var m = 1; m <= 12; m++) option($('month'), m, m + '월');
    $('year').value = 1995;
    fillDays();
    CITIES.forEach(function (c, i) { option($('city'), i, c[0]); });
  }

  function fillDays() {
    var sel = $('day');
    var prev = Number(sel.value) || 1;
    var lunar = form.cal.value === 'lunar';
    var max = lunar ? 30 : new Date(Number($('year').value), Number($('month').value), 0).getDate();
    sel.innerHTML = '';
    for (var d = 1; d <= max; d++) option(sel, d, d + '일');
    sel.value = Math.min(prev, max);
  }

  function readForm() {
    var unknown = $('timeUnknown').checked;
    var t = $('time').value.split(':');
    return {
      name: $('name').value.trim(),
      gender: form.gender.value,
      cal: form.cal.value,
      leap: $('leap').checked,
      year: Number($('year').value),
      month: Number($('month').value),
      day: Number($('day').value),
      timeKnown: !unknown,
      hour: unknown ? 12 : Number(t[0]),
      minute: unknown ? 0 : Number(t[1]),
      city: Number($('city').value)
    };
  }

  function writeForm(v) {
    $('name').value = v.name || '';
    form.gender.value = v.gender;
    form.cal.value = v.cal;
    $('leap').checked = v.leap;
    $('leapWrap').hidden = v.cal !== 'lunar';
    $('year').value = v.year;
    $('month').value = v.month;
    fillDays();
    $('day').value = v.day;
    $('timeUnknown').checked = !v.timeKnown;
    $('time').disabled = !v.timeKnown;
    if (v.timeKnown) $('time').value = pad(v.hour) + ':' + pad(v.minute);
    $('city').value = v.city;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function toHash(v) {
    var p = new URLSearchParams({
      g: v.gender || 'x', c: v.cal === 'lunar' ? (v.leap ? 'L' : 'l') : 's',
      d: v.year + pad(v.month) + pad(v.day),
      t: v.timeKnown ? pad(v.hour) + pad(v.minute) : 'x',
      p: v.city
    });
    if (v.name) p.set('n', v.name);
    return '#' + p.toString();
  }

  function fromHash(hash) {
    var p = new URLSearchParams(hash.replace(/^#/, ''));
    var d = p.get('d');
    if (!d || !/^\d{8}$/.test(d)) return null;
    var t = p.get('t') || 'x';
    var c = p.get('c') || 's';
    return {
      name: p.get('n') || '',
      gender: p.get('g') === 'x' ? '' : (p.get('g') || ''),
      cal: c === 's' ? 'solar' : 'lunar',
      leap: c === 'L',
      year: Number(d.slice(0, 4)), month: Number(d.slice(4, 6)), day: Number(d.slice(6, 8)),
      timeKnown: t !== 'x',
      hour: t === 'x' ? 12 : Number(t.slice(0, 2)),
      minute: t === 'x' ? 0 : Number(t.slice(2, 4)),
      city: Math.min(Number(p.get('p')) || 0, CITIES.length - 1)
    };
  }

  function compute(v) {
    var solar = { year: v.year, month: v.month, day: v.day };
    if (v.cal === 'lunar') solar = Saju.lunarToSolar(v.year, v.month, v.day, v.leap);
    var chart = Saju.calculate({
      year: solar.year, month: solar.month, day: solar.day,
      hour: v.hour, minute: v.minute, timeKnown: v.timeKnown,
      longitude: CITIES[v.city][1]
    });
    return {
      solar: solar,
      chart: chart,
      personality: Interpret.personality(chart),
      yearly: Interpret.yearly(chart, new Date().getFullYear(), YEARS, v.gender)
    };
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function stars(n) {
    var s = el('span', 'stars');
    s.setAttribute('aria-label', '5점 중 ' + n + '점');
    for (var i = 1; i <= 5; i++) s.appendChild(el('span', i <= n ? '' : 'off', '★'));
    return s;
  }

  function render(v, r) {
    var chart = r.chart, p = r.personality, me = chart.dayMaster;
    var total = chart.chars.length;

    $('rName').textContent = (v.name ? v.name + '님은 ' : '당신은 ') + EL[me].label + '(' + EL[me].name + ')의 기운으로 태어났어요';
    $('rImage').textContent = EL[me].emoji + ' ' + p.image;
    var tag = [];
    if (p.excess.length) tag.push(p.excess.map(function (x) { return EL[x.element].label; }).join('·') + ' 기운이 강하고');
    if (p.lacking.length) tag.push(p.lacking.map(function (x) { return EL[x.element].label; }).join('·') + ' 기운이 없는 사주');
    else tag.push(tag.length ? '나머지 기운은 고르게 갖춘 사주' : '다섯 기운을 고르게 갖춘 사주');
    $('rTagline').textContent = tag.join(' ');

    var bars = $('bars'); bars.innerHTML = '';
    CYCLE.forEach(function (e) {
      var n = chart.elements[e];
      var row = el('div', 'bar' + (e === me ? ' me' : ''));
      row.appendChild(el('span', 'bar-name', EL[e].emoji + ' ' + EL[e].name));
      var track = el('div', 'bar-track'), fill = el('div', 'bar-fill');
      fill.style.background = 'var(--' + e + ')';
      fill.style.width = '0%';
      track.appendChild(fill); row.appendChild(track);
      row.appendChild(el('span', 'bar-val' + (n >= 3 ? ' over' : n === 0 ? ' zero' : ''), n + '개' + (n >= 3 ? ' 강' : n === 0 ? ' 없음' : '')));
      bars.appendChild(row);
      requestAnimationFrame(function () { requestAnimationFrame(function () { fill.style.width = (n / total * 100) + '%'; }); });
    });

    var calc = $('rCalc'); calc.innerHTML = '';
    var c = chart.corrections;
    if (v.cal === 'lunar') calc.appendChild(el('li', null, '음력 ' + v.year + '.' + v.month + '.' + v.day + (v.leap ? '(윤달)' : '') + ' → 양력 ' + r.solar.year + '.' + r.solar.month + '.' + r.solar.day));
    if (c.dst) calc.appendChild(el('li', null, '서머타임 기간 출생: 1시간을 빼서 계산했어요.'));
    if (c.standardOffset === 510) calc.appendChild(el('li', null, '당시 표준시(동경 127.5°) 기준으로 계산했어요.'));
    if (v.timeKnown) calc.appendChild(el('li', null, CITIES[v.city][0] + ' 기준 실제 태양 시각: ' + c.trueSolarTime + ' (표준시 대비 ' + (c.trueSolarMinutes > 0 ? '+' : '') + c.trueSolarMinutes + '분)'));
    else calc.appendChild(el('li', null, '태어난 시간을 몰라 여섯 글자로 계산했어요.'));
    calc.appendChild(el('li', null, '해와 달의 기준은 절기(입춘 등)의 정확한 시각으로 나눴어요.'));
    calc.appendChild(el('li', null, '밤 11시~자정 출생은 일주를 당일로 보는 야자시 방식이에요.'));

    var kw = $('keywords'); kw.innerHTML = '';
    p.keywords.forEach(function (k) { kw.appendChild(el('span', 'chip', '#' + k)); });
    $('pSummary').textContent = p.summary;
    $('pStrengths').textContent = p.strengths;
    $('pWeaknesses').textContent = p.weaknesses;
    $('pEnv').textContent = p.environment;

    var bal = $('pBalance'); bal.innerHTML = '';
    p.excess.forEach(function (x) {
      var b = el('div', 'balance'); b.style.borderLeftColor = 'var(--' + x.element + ')';
      b.appendChild(el('p', null, EL[x.element].emoji + ' ' + x.text));
      bal.appendChild(b);
    });
    p.lacking.forEach(function (x) {
      var b = el('div', 'balance'); b.style.borderLeftColor = 'var(--' + x.element + ')';
      b.appendChild(el('p', null, EL[x.element].emoji + ' ' + x.text));
      b.appendChild(el('p', 'tip', '💡 ' + x.tip));
      bal.appendChild(b);
    });

    var tabs = $('yearTabs'); tabs.innerHTML = '';
    r.yearly.forEach(function (y, i) {
      var t = el('button', 'tab', y.year + '년');
      t.type = 'button';
      t.setAttribute('role', 'tab');
      t.addEventListener('click', function () { selectYear(r.yearly, i); });
      tabs.appendChild(t);
    });
    selectYear(r.yearly, 0);

    $('result').hidden = false;
    form.hidden = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function selectYear(list, idx) {
    Array.prototype.forEach.call($('yearTabs').children, function (t, i) { t.setAttribute('aria-selected', i === idx); });
    var y = list[idx];
    var body = $('yearBody'); body.innerHTML = '';
    var head = el('div', 'year-head');
    head.appendChild(el('strong', null, y.year + '년 · ' + y.title));
    body.appendChild(head);
    var chips = el('div', 'chips');
    y.elements.forEach(function (e) {
      var ch = el('span', 'chip el', EL[e].emoji + ' ' + EL[e].label);
      ch.style.background = 'var(--' + e + ')';
      chips.appendChild(ch);
    });
    body.appendChild(chips);
    [['💰 재물운', y.wealth], ['💪 건강운', y.health], ['❤️ 연애운', y.love]].forEach(function (f) {
      var box = el('div', 'fortune');
      var h = el('div', 'fortune-head');
      h.appendChild(el('span', null, f[0]));
      h.appendChild(stars(f[1].score));
      box.appendChild(h);
      box.appendChild(el('p', null, f[1].text));
      body.appendChild(box);
    });
    var note = el('p', 'hint', '건강운은 생활 습관 참고용이며 의학적 조언이 아닙니다.');
    body.appendChild(note);
  }

  function showError(msg) {
    $('error').textContent = msg;
    $('error').hidden = !msg;
  }

  function run(v) {
    try {
      var r = compute(v);
      showError('');
      history.replaceState(null, '', toHash(v));
      render(v, r);
    } catch (e) {
      console.error(e);
      showError(v.cal === 'lunar' ? '존재하지 않는 음력 날짜예요. 윤달 여부와 날짜를 확인해 주세요.' : '날짜를 확인해 주세요.');
      form.hidden = false;
      $('result').hidden = true;
    }
  }

  function toast(msg) {
    $('toast').textContent = msg;
    $('toast').hidden = false;
    setTimeout(function () { $('toast').hidden = true; }, 2500);
  }

  // 이벤트
  initSelects();
  $('year').addEventListener('change', fillDays);
  $('month').addEventListener('change', fillDays);
  Array.prototype.forEach.call(form.cal, function (r) {
    r.addEventListener('change', function () {
      $('leapWrap').hidden = form.cal.value !== 'lunar';
      fillDays();
    });
  });
  $('timeUnknown').addEventListener('change', function () { $('time').disabled = this.checked; });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    run(readForm());
  });

  $('again').addEventListener('click', function () {
    $('result').hidden = true;
    form.hidden = false;
    history.replaceState(null, '', location.pathname);
    window.scrollTo({ top: 0 });
  });

  $('share').addEventListener('click', function () {
    var url = location.href;
    var data = { title: '오행 사주', text: $('rName').textContent + ' — ' + $('rImage').textContent, url: url };
    if (navigator.share) {
      navigator.share(data).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () { toast('링크를 복사했어요.'); });
    } else {
      toast('주소창의 링크를 복사해 공유하세요.');
    }
  });

  var initial = fromHash(location.hash);
  if (initial) { writeForm(initial); run(initial); }
})();

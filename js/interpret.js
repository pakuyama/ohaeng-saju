// 해석: 오행 분포 → 성격 분석, 연도별 재물·건강·연애 운세
// 화면에는 천간·지지·십신 용어를 쓰지 않고 오행과 쉬운 문장만 내보낸다.
;(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./saju.js'));
  } else {
    root.Interpret = factory(root.Saju);
  }
})(this, function (Saju) {
  var CYCLE = ['wood', 'fire', 'earth', 'metal', 'water'];

  var EL = {
    wood: { name: '목', label: '나무', color: '푸른', emoji: '🌳' },
    fire: { name: '화', label: '불', color: '붉은', emoji: '🔥' },
    earth: { name: '토', label: '흙', color: '노란', emoji: '⛰️' },
    metal: { name: '금', label: '쇠', color: '흰', emoji: '⚔️' },
    water: { name: '수', label: '물', color: '검은', emoji: '💧' }
  };

  var ANIMAL = { 子: '쥐', 丑: '소', 寅: '호랑이', 卯: '토끼', 辰: '용', 巳: '뱀', 午: '말', 未: '양', 申: '원숭이', 酉: '닭', 戌: '개', 亥: '돼지' };

  // 나와 다른 오행의 관계
  function relation(me, other) {
    var d = (CYCLE.indexOf(other) - CYCLE.indexOf(me) + 5) % 5;
    return ['peer', 'output', 'wealth', 'officer', 'resource'][d];
  }

  function elementOf(me, rel) {
    var d = ['peer', 'output', 'wealth', 'officer', 'resource'].indexOf(rel);
    return CYCLE[(CYCLE.indexOf(me) + d) % 5];
  }

  // 일간의 힘: 나를 돕는 기운(같은 오행, 나를 낳는 오행)의 비중. 월지는 2배 가중.
  function strength(chart) {
    var support = 0, total = 0;
    chart.chars.forEach(function (c) {
      if (c.pillar === 'day' && c.pos === 'stem') return;
      var w = c.pillar === 'month' && c.pos === 'branch' ? 2 : 1;
      var r = relation(chart.dayMaster, c.element);
      total += w;
      if (r === 'peer' || r === 'resource') support += w;
    });
    return support / total;
  }

  // ---------- 성격 ----------

  var DAY_IMAGE = {
    wood: ['곧게 뻗은 큰 나무', '바람에 유연한 꽃과 풀'],
    fire: ['세상을 비추는 태양', '어둠을 밝히는 촛불'],
    earth: ['든든한 큰 산', '곡식을 기르는 너른 들판'],
    metal: ['단단한 바위와 무쇠', '갈고닦은 보석'],
    water: ['넓고 깊은 바다', '만물을 적시는 이슬비']
  };

  var DAY_TEXT = {
    wood: {
      keywords: ['성장', '추진력', '인정'],
      summary: '위로 자라려는 나무처럼 목표를 세우고 꾸준히 나아가는 사람입니다. 새로운 일을 시작하는 힘이 좋고, 사람을 아끼는 따뜻한 마음이 있습니다.',
      strengths: '계획을 세우고 밀고 나가는 힘, 어려운 사람을 그냥 지나치지 못하는 인정, 배우려는 의지가 강합니다.',
      weaknesses: '한번 정한 방향을 잘 바꾸지 않아 고집스럽게 보일 수 있고, 일이 막히면 답답함을 크게 느낍니다.',
      environment: '성장 단계가 눈에 보이는 일, 교육·기획·창업처럼 무언가를 키워 가는 환경에서 빛납니다.'
    },
    fire: {
      keywords: ['열정', '표현력', '밝음'],
      summary: '불처럼 밝고 따뜻해서 어디서든 분위기를 살리는 사람입니다. 감정 표현이 솔직하고 사람들 앞에 서는 일을 두려워하지 않습니다.',
      strengths: '빠른 판단과 실행, 사람을 끌어당기는 매력, 아이디어를 말과 글로 풀어내는 표현력이 뛰어납니다.',
      weaknesses: '마음이 빨리 달아오르는 만큼 식는 것도 빨라 끝마무리가 약할 수 있고, 감정이 얼굴에 그대로 드러납니다.',
      environment: '사람을 만나고 무언가를 알리는 일, 홍보·방송·영업·강의처럼 무대가 있는 환경이 잘 맞습니다.'
    },
    earth: {
      keywords: ['신뢰', '포용력', '안정'],
      summary: '흙처럼 묵직하고 믿음직해서 주변 사람들이 기대는 사람입니다. 쉽게 흔들리지 않고 맡은 일을 끝까지 책임집니다.',
      strengths: '약속을 지키는 신뢰감, 서로 다른 사람들을 이어 주는 중재 능력, 꾸준함과 인내심이 강점입니다.',
      weaknesses: '변화를 받아들이는 데 시간이 걸리고, 속마음을 잘 드러내지 않아 답답하다는 말을 들을 수 있습니다.',
      environment: '안정적으로 쌓아 가는 일, 관리·부동산·행정·상담처럼 사람과 자원을 지키는 환경에 강합니다.'
    },
    metal: {
      keywords: ['결단력', '원칙', '의리'],
      summary: '쇠처럼 단단하고 맺고 끊음이 분명한 사람입니다. 옳고 그름에 대한 기준이 확실하고, 한번 맺은 인연에는 의리를 지킵니다.',
      strengths: '빠른 결단, 일을 깔끔하게 정리하는 능력, 압박 속에서도 흔들리지 않는 강단이 있습니다.',
      weaknesses: '말이 직설적이라 의도치 않게 상처를 줄 수 있고, 기준이 높아 스스로와 남에게 엄격해지기 쉽습니다.',
      environment: '명확한 규칙과 성과가 있는 일, 금융·법·기술·품질관리처럼 정확함이 필요한 환경이 맞습니다.'
    },
    water: {
      keywords: ['지혜', '유연함', '통찰'],
      summary: '물처럼 어디든 스며들고 깊이 생각하는 사람입니다. 상황을 읽는 눈이 밝고, 겉보다 속이 훨씬 깊습니다.',
      strengths: '배운 것을 빠르게 흡수하는 머리, 상황에 맞춰 바꾸는 적응력, 남의 마음을 헤아리는 통찰력이 있습니다.',
      weaknesses: '생각이 많아 결정을 미루거나 걱정이 커질 수 있고, 속내를 쉽게 보여 주지 않습니다.',
      environment: '정보와 아이디어를 다루는 일, 연구·기획·IT·유통처럼 흐름을 읽어야 하는 환경에서 강합니다.'
    }
  };

  var EXCESS_TEXT = {
    wood: '나무 기운이 많아 하고 싶은 일이 많고 추진력이 강합니다. 다만 고집이 세지거나 여러 일을 벌여 놓기 쉬우니 우선순위를 정하는 습관이 도움이 됩니다.',
    fire: '불 기운이 많아 에너지가 넘치고 표현이 화끈합니다. 다만 성급해지거나 쉽게 지칠 수 있으니 한 템포 쉬어 가는 연습이 필요합니다.',
    earth: '흙 기운이 많아 신중하고 믿음직합니다. 다만 생각이 굳어지거나 걱정이 쌓이기 쉬우니 가끔은 가볍게 움직여 보는 것이 좋습니다.',
    metal: '쇠 기운이 많아 판단이 날카롭고 기준이 분명합니다. 다만 냉정해 보이거나 완벽을 지나치게 추구할 수 있으니 여유를 갖는 것이 좋습니다.',
    water: '물 기운이 많아 생각이 깊고 감수성이 풍부합니다. 다만 고민이 길어지거나 감정에 휩쓸리기 쉬우니 작은 일부터 바로 실행해 보세요.'
  };

  var LACK_TEXT = {
    wood: { text: '나무 기운이 없어 새 일을 시작하는 데 망설임이 생길 수 있습니다.', tip: '초록색 소품, 식물 키우기, 아침 산책처럼 시작과 성장을 느끼는 활동이 기운을 채워 줍니다.' },
    fire: { text: '불 기운이 없어 열정을 겉으로 드러내는 데 서툴 수 있습니다.', tip: '붉은색·주황색 포인트, 햇볕 쬐기, 사람들 앞에서 이야기해 보는 경험이 도움이 됩니다.' },
    earth: { text: '흙 기운이 없어 생활 리듬이 흔들리거나 한곳에 뿌리내리기 어려울 수 있습니다.', tip: '규칙적인 식사와 수면, 노란색·베이지 계열, 정리 정돈 습관이 중심을 잡아 줍니다.' },
    metal: { text: '쇠 기운이 없어 맺고 끊는 결정이 어렵게 느껴질 수 있습니다.', tip: '흰색·금속 소품, 할 일 목록 정리, 기한을 정해 결정하는 연습이 도움이 됩니다.' },
    water: { text: '물 기운이 없어 쉬지 않고 달리다 지치기 쉽습니다.', tip: '충분한 물 마시기, 검은색·남색 계열, 명상이나 독서처럼 혼자 생각을 정리하는 시간이 필요합니다.' }
  };

  function personality(chart) {
    var dm = chart.dayMaster;
    var base = DAY_TEXT[dm];
    var s = strength(chart);
    var excess = CYCLE.filter(function (e) { return chart.elements[e] >= 3; });
    var lacking = CYCLE.filter(function (e) { return chart.elements[e] === 0; });

    var keywords = base.keywords.slice();
    if (excess.length && excess[0] !== dm) keywords.push(DAY_TEXT[excess[0]].keywords[0]);

    var balance;
    if (s >= 0.6) balance = '나를 돕는 기운이 강해 주관이 뚜렷하고 스스로 길을 개척하는 힘이 있습니다.';
    else if (s <= 0.35) balance = '주변 기운이 강한 편이라 혼자보다 좋은 사람들과 함께할 때 더 큰 힘을 냅니다.';
    else balance = '나를 돕는 기운과 바깥 기운이 고르게 섞여 있어 상황에 맞게 균형을 잡을 줄 압니다.';

    return {
      image: DAY_IMAGE[dm][chart.dayMasterYang ? 0 : 1],
      keywords: keywords,
      summary: base.summary + ' ' + balance,
      strengths: base.strengths,
      weaknesses: base.weaknesses,
      environment: base.environment,
      excess: excess.map(function (e) { return { element: e, text: EXCESS_TEXT[e] }; }),
      lacking: lacking.map(function (e) { return { element: e, text: LACK_TEXT[e].text, tip: LACK_TEXT[e].tip }; })
    };
  }

  // ---------- 연도별 운세 ----------
  // 각 운세는 판단 근거(notes)를 코드로 모은 뒤, 시제(now/past)에 맞는 문장으로 조립한다.

  var COMBINE = ['子丑', '寅亥', '卯戌', '辰酉', '巳申', '午未'];
  var CLASH = ['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥'];
  function pairIn(list, a, b) { return list.indexOf(a + b) >= 0 || list.indexOf(b + a) >= 0; }

  function clamp(x) { return Math.max(1, Math.min(5, Math.round(x))); }

  var WEALTH_TEXT = {
    'wealth+': {
      now: '돈의 기운이 직접 들어오는 해입니다. 그동안 준비한 일이 수입으로 이어지기 좋습니다.',
      past: '돈의 기운이 직접 들어온 해였어요. 수입이 늘거나 준비하던 일이 돈으로 이어졌을 수 있어요.'
    },
    'wealth-': {
      now: '돈이 들어올 기회는 보이지만 감당해야 할 일도 함께 커집니다. 욕심보다 실속을 챙기세요.',
      past: '돈이 오갈 기회는 많았지만 그만큼 부담도 컸던 해예요. 벌어도 남는 게 적다고 느꼈을 수 있어요.'
    },
    'output+': {
      now: '재능과 아이디어가 돈이 되는 흐름입니다. 부업이나 새 프로젝트를 시작해 보기 좋습니다.',
      past: '재능과 아이디어가 빛을 본 해였어요. 새 일이나 부업을 시작했다면 성과가 있었을 거예요.'
    },
    'output-': {
      now: '일은 많은데 손에 남는 것이 적을 수 있습니다. 체력과 시간을 아끼며 선택과 집중을 하세요.',
      past: '바쁘게 움직였지만 손에 남는 것은 적었을 수 있어요.'
    },
    'peer+': {
      now: '경쟁자가 많아지고 나가는 돈이 늘 수 있습니다. 보증, 동업, 큰 투자는 신중하게 결정하세요.',
      past: '예상치 못한 지출이나 경쟁으로 돈이 새어 나갔을 수 있어요. 돈을 빌려주거나 함께 투자한 일로 신경 쓸 일이 있었을지도 몰라요.'
    },
    'peer-': {
      now: '주변 사람의 도움으로 기회가 생깁니다. 함께하는 일에서 수익이 나기 쉽습니다.',
      past: '주변 사람 덕분에 기회를 얻었던 해예요. 누군가와 함께한 일이 도움이 됐을 거예요.'
    },
    'resource+': {
      now: '돈보다 공부와 준비에 마음이 가는 해입니다. 지출을 줄이고 자기계발에 투자하면 다음 해에 결실을 봅니다.',
      past: '돈보다 공부, 자격증, 이직 준비처럼 미래를 위한 일에 마음이 갔던 해예요.'
    },
    'resource-': {
      now: '든든한 지원군이 생기는 해입니다. 자격증, 문서, 계약과 관련된 일에서 이득을 볼 수 있습니다.',
      past: '든든한 지원을 받았던 해예요. 계약, 문서, 시험과 관련해 좋은 결과가 있었을 수 있어요.'
    },
    'officer+': {
      now: '책임과 자리가 커지면서 수입도 안정됩니다. 직장 안에서 인정받기 좋은 해입니다.',
      past: '책임이 커지면서 인정받았던 해예요. 승진, 취업, 자리 이동 같은 변화가 있었을 수 있어요.'
    },
    'officer-': {
      now: '일의 압박이 커질 수 있습니다. 무리한 확장보다 지금 가진 것을 지키는 데 집중하세요.',
      past: '일과 책임의 압박이 컸던 해예요. 돈보다 버티는 것이 더 중요했다고 느꼈을 수 있어요.'
    }
  };
  var WEALTH_TAIL = {
    now: ['올해는 돈을 불리기보다 지키는 것이 우선입니다.', '큰돈이 오가는 결정은 한 번 더 점검하세요.', '지출 관리를 꼼꼼히 하면 무난히 지나갑니다.', '흐름이 좋으니 계획한 일을 적극적으로 추진해 보세요.', '재물 흐름이 아주 좋은 해입니다. 들어온 돈을 잘 모아 두세요.'],
    past: ['재물 면에서는 지키기 바빴던 해예요.', '돈 문제로 고민한 순간이 있었을 거예요.', '재물은 큰 굴곡 없이 지나간 해예요.', '재물 흐름이 좋은 편이었어요.', '돌아보면 재물운이 손꼽히게 좋았던 해예요.']
  };

  function wealthFortune(chart, yr, strong) {
    var score = 3, seen = {}, notes = [];
    [yr.stemElement, yr.branchElement].forEach(function (e) {
      var r = relation(chart.dayMaster, e);
      if (r === 'wealth') score += strong ? 1 : 0.25;
      else if (r === 'output') score += strong ? 0.5 : -0.25;
      else if (r === 'peer') score += strong ? -1 : 0.5;
      else if (r === 'resource') score += strong ? -0.5 : 0.25;
      else if (r === 'officer') score += strong ? 0.25 : -0.5;
      if (!seen[r]) { seen[r] = true; notes.push(r + (strong ? '+' : '-')); }
    });
    var wealthEl = elementOf(chart.dayMaster, 'wealth');
    if (seen.wealth && chart.elements[wealthEl] === 0) score += 0.5;
    return { score: clamp(score), notes: notes };
  }

  var HEALTH_TEXT = {
    fill: { now: '부족했던 기운이 채워져 몸과 마음의 균형이 좋아지는 해입니다.', past: '부족했던 기운이 채워져 컨디션이 좋았던 해예요.' },
    over: { now: '이미 강한 {el} 기운이 더 세지는 해라 한쪽으로 무리가 가기 쉽습니다.', past: '이미 강한 {el} 기운이 더 세져서 몸 한쪽에 무리가 갔을 수 있어요.' },
    pressure: { now: '일과 책임의 압박이 커져 스트레스가 쌓일 수 있습니다.', past: '일과 책임의 압박으로 스트레스가 많았던 해예요.' },
    drain: { now: '에너지를 많이 쓰는 해라 쉬는 시간을 일부러 챙겨야 합니다.', past: '에너지를 많이 써서 쉽게 지쳤을 수 있어요.' },
    clash: { now: '생활 환경에 변화가 생기기 쉬워 컨디션이 흔들릴 수 있으니 이동할 때 안전에 유의하세요.', past: '이사, 이직처럼 생활 환경이 바뀌면서 컨디션이 흔들렸을 수 있어요.' },
    good: { now: '전반적으로 활력이 좋은 해입니다.', past: '전반적으로 활력이 좋았던 해예요.' },
    plain: { now: '큰 무리는 없지만 기본 관리가 중요한 해입니다.', past: '건강은 큰 탈 없이 지나간 해예요.' }
  };

  var HEALTH_TIP = {
    wood: { now: '목·어깨 근육이 쉽게 뭉치고 눈이 피로해질 수 있습니다. 틈틈이 스트레칭하고 화면 보는 시간을 줄이세요.', past: '이 무렵 목·어깨 결림이나 눈 피로를 자주 느꼈을 수 있어요.' },
    fire: { now: '마음이 들뜨고 잠이 얕아지기 쉽습니다. 카페인을 줄이고 일정한 시간에 잠자리에 드세요.', past: '이 무렵 잠을 설치거나 마음이 들떠 쉽게 예민해졌을 수 있어요.' },
    earth: { now: '식사 시간이 불규칙해지면 속이 더부룩해지기 쉽습니다. 과식을 피하고 규칙적으로 드세요.', past: '이 무렵 식사가 불규칙하거나 속이 불편한 날이 많았을 수 있어요.' },
    metal: { now: '건조한 환경에 약해질 수 있습니다. 실내 습도와 보습에 신경 쓰고 가벼운 유산소 운동으로 호흡을 틔우세요.', past: '이 무렵 피부나 호흡기가 건조함에 예민했을 수 있어요.' },
    water: { now: '몸이 차가워지고 쉽게 지칠 수 있습니다. 물을 충분히 마시고 하체를 따뜻하게 하며 과로를 피하세요.', past: '이 무렵 몸이 차고 쉽게 지쳤을 수 있어요.' }
  };

  function healthFortune(chart, yr, strong) {
    var score = 4, focus = null, notes = [];
    function note(k) { if (notes.indexOf(k) < 0) notes.push(k); }
    [yr.stemElement, yr.branchElement].forEach(function (e) {
      var r = relation(chart.dayMaster, e);
      if (chart.elements[e] >= 3) { score -= 1; focus = focus || e; note('over'); }
      else if (chart.elements[e] === 0) { score += 0.5; note('fill'); }
      if (!strong && r === 'officer') { score -= 0.5; note('pressure'); }
      if (!strong && r === 'output') { score -= 0.5; note('drain'); }
      if (!strong && r === 'resource') score += 0.5;
    });
    if (pairIn(CLASH, yr.branch, chart.dayBranch)) { score -= 0.5; note('clash'); }
    score = clamp(score);

    if (!focus) {
      var controlled = CYCLE[(CYCLE.indexOf(yr.stemElement) + 2) % 5];
      focus = chart.elements[controlled] <= 1 ? controlled : chart.dayMaster;
    }
    if (!notes.length) notes.push(score >= 4 ? 'good' : 'plain');
    return { score: score, focus: focus, notes: notes };
  }

  var LOVE_TEXT = {
    hit: { now: '이성과의 인연을 부르는 기운이 들어오는 해입니다. 새로운 만남의 기회가 자주 찾아옵니다.', past: '이성과의 인연이 들어온 해였어요. 새로운 사람을 만나거나 고백을 주고받았을 수 있어요.' },
    combine: { now: '마음이 잘 맞는 사람과 관계가 깊어지기 좋아 연인이라면 다음 단계를 생각해 볼 만합니다.', past: '누군가와 마음이 깊어졌던 해예요. 연애를 시작했거나 관계가 한 단계 진전됐을 수 있어요.' },
    charm: { now: '매력이 돋보여 주변의 관심을 받기 쉽습니다.', past: '매력이 돋보여 주변의 관심을 많이 받았던 해예요.' },
    rival: { now: '좋아하는 사람을 두고 경쟁하거나, 친구 관계가 연애에 영향을 줄 수 있습니다.', past: '연애에 경쟁자가 있었거나, 친구 관계가 연애에 영향을 줬을 수 있어요.' },
    clash: { now: '관계에 변화가 생기기 쉬운 해입니다. 오해가 생기면 미루지 말고 바로 대화로 푸세요.', past: '관계에 변화가 컸던 해예요. 이별이나 다툼, 혹은 관계를 새로 정리한 일이 있었을 수 있어요.' },
    calm: { now: '연애운이 크게 출렁이지 않는 잔잔한 해입니다. 지금의 관계를 차분히 다지기 좋습니다.', past: '연애는 큰 변화 없이 잔잔하게 흘러간 해예요.' },
    go: { now: '마음이 가는 사람이 있다면 먼저 다가가 보세요.', past: '' },
    slow: { now: '조급하게 결정하기보다 상대를 천천히 알아 가는 것이 좋습니다.', past: '' }
  };

  function loveFortune(chart, yr, gender) {
    var targets = gender === 'male' ? ['wealth'] : gender === 'female' ? ['officer'] : ['wealth', 'officer'];
    var score = 3, hit = false, rival = false;
    [yr.stemElement, yr.branchElement].forEach(function (e) {
      var r = relation(chart.dayMaster, e);
      if (targets.indexOf(r) >= 0) { score += gender ? 1 : 0.75; hit = true; }
      if (r === 'peer') { score -= 0.5; rival = true; }
      if (r === 'output' && gender === 'female') score += 0.25;
    });
    var combine = pairIn(COMBINE, yr.branch, chart.dayBranch);
    var clash = pairIn(CLASH, yr.branch, chart.dayBranch);
    var charm = '子午卯酉'.indexOf(yr.branch) >= 0;
    if (combine) score += 1;
    if (clash) score -= 0.5;
    if (charm) score += 0.5;
    score = clamp(score);

    var notes = [];
    if (hit) notes.push('hit');
    if (combine) notes.push('combine');
    if (charm) notes.push('charm');
    if (rival) notes.push('rival');
    if (clash) notes.push('clash');
    if (!notes.length) notes.push('calm');
    if (score >= 4 && !combine) notes.push('go');
    if (score <= 2) notes.push('slow');
    return { score: score, notes: notes };
  }

  function wealthText(f, tense) {
    var t = f.notes.map(function (k) { return WEALTH_TEXT[k][tense]; });
    t.push(WEALTH_TAIL[tense][f.score - 1]);
    return t.join(' ');
  }

  function healthText(f, tense) {
    var t = f.notes.map(function (k) { return HEALTH_TEXT[k][tense].replace('{el}', EL[f.focus].label); });
    // 지난 해는 컨디션이 좋았던 해에 굳이 불편했던 부위를 덧붙이지 않는다
    if (tense === 'now' || f.score <= 3) t.push(HEALTH_TIP[f.focus][tense]);
    return t.join(' ');
  }

  function loveText(f, tense) {
    return f.notes.map(function (k) { return LOVE_TEXT[k][tense]; }).filter(Boolean).join(' ');
  }

  // 근거의 방향: 좋은 일(+1) / 힘든 일(-1)
  var POLARITY = {
    wealth: { 'wealth+': 1, 'output+': 1, 'peer-': 1, 'resource-': 1, 'officer+': 1, 'wealth-': -1, 'output-': -1, 'peer+': -1, 'resource+': -1, 'officer-': -1 },
    health: { fill: 1, good: 1, over: -1, pressure: -1, drain: -1, clash: -1 },
    love: { hit: 1, combine: 1, charm: 1, rival: -1, clash: -1 }
  };
  var PAST_TEXT = {
    wealth: function (k) { return WEALTH_TEXT[k].past; },
    health: function (k, f) { return HEALTH_TEXT[k].past.replace('{el}', EL[f.focus].label); },
    love: function (k) { return LOVE_TEXT[k].past; }
  };

  // 한 줄 요약: 평균(3점)에서 가장 멀리 떨어진 영역에서, 점수 방향과 맞는 근거를 고른다
  function highlight(w, h, l) {
    var list = [{ key: 'wealth', f: w }, { key: 'health', f: h }, { key: 'love', f: l }];
    list.sort(function (a, b) { return Math.abs(b.f.score - 3) - Math.abs(a.f.score - 3); });
    var top = list[0];
    var dir = top.f.score > 3 ? 1 : top.f.score < 3 ? -1 : 0;
    var pick = top.f.notes.filter(function (k) { return dir === 0 || POLARITY[top.key][k] === dir; })[0];
    var text = pick ? PAST_TEXT[top.key](pick, top.f) : top.key === 'wealth' ? WEALTH_TAIL.past[top.f.score - 1] : PAST_TEXT[top.key](top.f.notes[0], top.f);
    return { key: top.key, good: dir, text: text };
  }

  function fortuneYear(chart, y, strong, gender, tense) {
    var yr = Saju.yearGanZhi(y);
    var w = wealthFortune(chart, yr, strong);
    var h = healthFortune(chart, yr, strong);
    var l = loveFortune(chart, yr, gender);
    var out = {
      year: y,
      title: EL[yr.stemElement].color + ' ' + ANIMAL[yr.branch] + '의 해',
      elements: [yr.stemElement, yr.branchElement],
      wealth: { score: w.score, text: wealthText(w, tense) },
      health: { score: h.score, focus: h.focus, text: healthText(h, tense) },
      love: { score: l.score, text: loveText(l, tense) }
    };
    if (tense === 'past') out.highlight = highlight(w, h, l);
    return out;
  }

  function yearly(chart, fromYear, count, gender) {
    var strong = strength(chart) >= 0.5;
    var out = [];
    for (var y = fromYear; y < fromYear + count; y++) out.push(fortuneYear(chart, y, strong, gender, 'now'));
    return out;
  }

  // 지난 해 돌아보기: 최근 연도부터 거꾸로, 만 minAge세 이후만
  function past(chart, currentYear, count, gender, birthYear, minAge) {
    var strong = strength(chart) >= 0.5;
    var from = Math.max(currentYear - count, birthYear + minAge);
    var out = [];
    for (var y = currentYear - 1; y >= from; y--) {
      var f = fortuneYear(chart, y, strong, gender, 'past');
      f.age = y - birthYear;
      out.push(f);
    }
    return out;
  }

  // 영역별 가장 좋았던 해(4점 이상)와 힘들었던 해(2점 이하)
  function pastSummary(list) {
    var res = {};
    ['wealth', 'health', 'love'].forEach(function (k) {
      var best = null, worst = null;
      list.forEach(function (y) {
        if (!best || y[k].score > best[k].score) best = y;
        if (!worst || y[k].score < worst[k].score) worst = y;
      });
      res[k] = {
        best: best && best[k].score >= 4 ? best.year : null,
        worst: worst && worst[k].score <= 2 ? worst.year : null
      };
    });
    return res;
  }

  return { EL: EL, CYCLE: CYCLE, personality: personality, yearly: yearly, past: past, pastSummary: pastSummary, strength: strength };
});

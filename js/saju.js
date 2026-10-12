// 만세력 계산: 사주 여덟 글자 → 오행 분포
// 보정: 서머타임, 표준자오선 변경(127°30′ 시기), 진태양시(경도 + 균시차), 야자시
;(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('../vendor/lunar.js'));
  } else {
    root.Saju = factory(root);
  }
})(this, function (lib) {
  var Solar = lib.Solar;
  var Lunar = lib.Lunar;

  var HOUR = 3600 * 1000;
  var MIN = 60 * 1000;

  var STEM_ELEMENT = { 甲: 'wood', 乙: 'wood', 丙: 'fire', 丁: 'fire', 戊: 'earth', 己: 'earth', 庚: 'metal', 辛: 'metal', 壬: 'water', 癸: 'water' };
  var BRANCH_ELEMENT = { 寅: 'wood', 卯: 'wood', 巳: 'fire', 午: 'fire', 辰: 'earth', 戌: 'earth', 丑: 'earth', 未: 'earth', 申: 'metal', 酉: 'metal', 亥: 'water', 子: 'water' };
  var STEM_YANG = { 甲: true, 丙: true, 戊: true, 庚: true, 壬: true, 乙: false, 丁: false, 己: false, 辛: false, 癸: false };
  var STEMS = '甲乙丙丁戊己庚辛壬癸';
  var BRANCHES = '子丑寅卯辰巳午未申酉戌亥';

  // 한국 서머타임 (tzdb Asia/Seoul 기준, 날짜 단위 근사) [시작일, 종료일)
  var DST = [
    ['1948-06-01', '1948-09-13'], ['1949-04-03', '1949-09-11'], ['1950-04-01', '1950-09-10'],
    ['1951-05-06', '1951-09-09'], ['1955-05-05', '1955-09-09'], ['1956-05-20', '1956-09-30'],
    ['1957-05-05', '1957-09-22'], ['1958-05-04', '1958-09-21'], ['1959-05-03', '1959-09-20'],
    ['1960-05-01', '1960-09-18'], ['1987-05-10', '1987-10-11'], ['1988-05-08', '1988-10-09']
  ];

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(y, m, d) { return y + '-' + pad(m) + '-' + pad(d); }

  function isDst(dateStr) {
    for (var i = 0; i < DST.length; i++) {
      if (dateStr >= DST[i][0] && dateStr < DST[i][1]) return true;
    }
    return false;
  }

  // 당시 표준시의 UTC 오프셋(분)
  function standardOffsetMinutes(dateStr) {
    if (dateStr >= '1908-04-01' && dateStr < '1912-01-01') return 510;
    if (dateStr >= '1954-03-21' && dateStr < '1961-08-10') return 510;
    return 540;
  }

  // 균시차(분)
  function equationOfTime(utcMs) {
    var d = new Date(utcMs);
    var start = Date.UTC(d.getUTCFullYear(), 0, 1);
    var n = Math.floor((utcMs - start) / (24 * HOUR)) + 1;
    var b = 2 * Math.PI * (n - 81) / 364;
    return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  }

  function solarFromMs(ms) {
    var d = new Date(ms);
    return Solar.fromYmdHms(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
  }

  function lunarToSolar(y, m, d, leap) {
    var s = Lunar.fromYmd(y, leap ? -m : m, d).getSolar();
    return { year: s.getYear(), month: s.getMonth(), day: s.getDay() };
  }

  /**
   * input: { year, month, day, hour, minute, timeKnown, longitude }  (양력, 출생지 시계 기준)
   */
  function calculate(input) {
    var dateStr = ymd(input.year, input.month, input.day);
    var hour = input.timeKnown ? input.hour : 12;
    var minute = input.timeKnown ? input.minute : 0;
    var dst = isDst(dateStr);
    var offset = standardOffsetMinutes(dateStr);
    var utcMs = Date.UTC(input.year, input.month - 1, input.day, hour, minute) - (dst ? HOUR : 0) - offset * MIN;

    // 연주·월주: 절입 시각 비교 (라이브러리 절기표는 UTC+8 기준)
    var ecYM = solarFromMs(utcMs + 8 * HOUR).getLunar().getEightChar();

    // 일주·시주: 출생지 진태양시
    var eot = equationOfTime(utcMs);
    var trueSolarMs = utcMs + input.longitude * 4 * MIN + eot * MIN;
    var ecDT = solarFromMs(input.timeKnown ? trueSolarMs : Date.UTC(input.year, input.month - 1, input.day, 12, 0)).getLunar().getEightChar();
    ecDT.setSect(2); // 야자시: 23시 이후는 일주를 당일로 유지

    var pillars = {
      year: ecYM.getYear(),
      month: ecYM.getMonth(),
      day: ecDT.getDay(),
      hour: input.timeKnown ? ecDT.getTime() : null
    };

    var chars = [];
    ['year', 'month', 'day', 'hour'].forEach(function (k) {
      if (!pillars[k]) return;
      chars.push({ pillar: k, pos: 'stem', ch: pillars[k][0], element: STEM_ELEMENT[pillars[k][0]] });
      chars.push({ pillar: k, pos: 'branch', ch: pillars[k][1], element: BRANCH_ELEMENT[pillars[k][1]] });
    });

    var counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    chars.forEach(function (c) { counts[c.element]++; });

    var tsd = new Date(trueSolarMs);
    return {
      pillars: pillars,
      chars: chars,
      elements: counts,
      dayMaster: STEM_ELEMENT[pillars.day[0]],
      dayMasterYang: STEM_YANG[pillars.day[0]],
      dayBranch: pillars.day[1],
      monthBranchElement: BRANCH_ELEMENT[pillars.month[1]],
      corrections: {
        dst: dst,
        standardOffset: offset,
        trueSolarMinutes: input.timeKnown ? Math.round((trueSolarMs - (utcMs + offset * MIN)) / MIN) : null,
        trueSolarTime: input.timeKnown ? pad(tsd.getUTCHours()) + ':' + pad(tsd.getUTCMinutes()) : null
      }
    };
  }

  // 해당 연도(입춘 기준 한 해)의 간지
  function yearGanZhi(year) {
    var i = ((year - 4) % 60 + 60) % 60;
    var stem = STEMS[i % 10];
    var branch = BRANCHES[i % 12];
    return { stem: stem, branch: branch, stemElement: STEM_ELEMENT[stem], branchElement: BRANCH_ELEMENT[branch] };
  }

  return {
    calculate: calculate,
    lunarToSolar: lunarToSolar,
    yearGanZhi: yearGanZhi,
    STEM_ELEMENT: STEM_ELEMENT,
    BRANCH_ELEMENT: BRANCH_ELEMENT
  };
});

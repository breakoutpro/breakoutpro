// Shared FIXTURE helpers for the Smart Alerts tests. Every candle and quote below is made
// by a fixed formula: this is MOCK data for unit tests, not provider data, and nothing here
// verifies a real provider.
var IST = 19800000, DAY = 86400000;
export function dayIdx(y, m, d){ return Math.round(Date.UTC(y, m - 1, d) / DAY); }
export function istMs(y, m, d, hh, mm){ return Date.UTC(y, m - 1, d, hh, mm) - IST; }
export function tradingDays(endDayIdx, n){          // n weekdays ending at endDayIdx (no holidays in Oct 5-16 2026)
  var out = [], d = endDayIdx;
  while(out.length < n){ var w = (d + 4) % 7; if(w != 0 && w != 6) out.unshift(d); d--; }
  return out;
}
export var T0 = dayIdx(2026, 10, 13);                 // Tue 13 Oct 2026, a normal trading day

// price(dayNo, barNo) -> { o,h,l,c,v } ; returns raw provider-shaped candles for FULL sessions
// of `days`, plus bars of `today` up to (and including) the bar that starts at/before nowMs.
export function makeFrame(days, tfMin, fn, today, nowMs){
  var out = [];
  var all = days.slice(); if(today != null) all.push(today);
  all.forEach(function(day, di){
    var open = day * DAY - IST + 555 * 60000, close = day * DAY - IST + 930 * 60000;
    var k = 0;
    for(var s = open; s < close; s += tfMin * 60000, k++){
      if(day == today && s > nowMs) break;
      var b = fn(di, k, day == today);
      out.push({ time:Math.floor(s / 1000), open:b.o, high:b.h, low:b.l, close:b.c, volume:b.v });
    }
  });
  return out;
}
export function flat(price, vol){ return function(di, k){ return { o:price, h:price + 0.5, l:price - 0.5, c:price, v:vol }; }; }
export function frameOf(candles){ return { ok:true, candles:candles }; }

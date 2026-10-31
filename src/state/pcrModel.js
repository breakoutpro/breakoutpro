// BreakoutPro - pcrModel.js
// Freshness wording for the Home OI PCR value. Pure. A value is only ever one the option-chain service
// returned (or one this browser stored from an earlier real response); nothing is estimated.
//   entry: { pcr, stale, updated (ms or null), fromStore }
//   open : NSE session is open now
// Result: { label, stamp } where label is Live / Delayed / Last EOD.
// Rules: no backtick, no triple-equals, ASCII only.

var IST_MS = 19800000;
var M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function p2(n){ return n < 10 ? "0" + n : String(n); }
function parts(ms){ var d = new Date(ms + IST_MS); return { key:d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate(), hh:d.getUTCHours(), mm:d.getUTCMinutes(), d:d.getUTCDate(), mo:d.getUTCMonth() }; }

export function pcrFreshness(entry, open, now){
  if(!entry || typeof entry.pcr != "number" || !isFinite(entry.pcr)) return null;
  var ts = typeof entry.updated == "number" && isFinite(entry.updated) ? entry.updated : null;
  var stamp = "";
  if(ts != null){
    var a = parts(ts), b = parts(now);
    stamp = "as of " + p2(a.hh) + ":" + p2(a.mm) + " IST" + (a.key != b.key ? ", " + a.d + " " + M[a.mo] : "");
  }
  var label;
  if(!open) label = "Last EOD";
  else if(entry.fromStore || entry.stale) label = "Delayed";
  else label = "Live";
  return { label:label, stamp:stamp };
}

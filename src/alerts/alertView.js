// BreakoutPro - alerts/alertView.js
// Pure presentation helpers for the Smart Alerts screen (filters, labels, status text keys).
// No React, no storage, no network: unit-tested. Direction colors come from the theme only for
// UP/DOWN market meaning; everything else is neutral/blue.
// Rules: no backtick, no triple-equals, ASCII only.

import { RULE_TYPES, GROUPS, groupOf } from "./alertRules.js";

export var FILTERS = ["all"].concat(GROUPS);       // all, candle, action, volume, level

export var FILTER_KEYS = { all:"sa.f.all", candle:"sa.f.candle", action:"sa.f.action", volume:"sa.f.volume", level:"sa.f.level" };

export function groupOfEvent(ev){
  if(!ev) return null;
  if(ev.event == "candle") return "candle";
  return groupOf(ev.event);
}
export function filterRules(rules, filter){
  if(!filter || filter == "all") return (rules || []).slice();
  return (rules || []).filter(function(r){ return groupOf(r.type) == filter; });
}
export function filterHistory(history, filter){
  if(!filter || filter == "all") return (history || []).slice();
  return (history || []).filter(function(h){ return groupOfEvent(h) == filter; });
}

// "up" | "down" | "neutral" for a rule definition (what the rule is looking for)
export function ruleDirection(rule){
  var d = RULE_TYPES[rule && rule.type] ? RULE_TYPES[rule.type].dir : null;
  return d == "up" ? "up" : (d == "down" ? "down" : "neutral");
}
export function eventDirection(ev){
  return ev && (ev.direction == "up" || ev.direction == "down") ? ev.direction : "neutral";
}

// i18n key explaining a rule's current state. Always returns a key that exists in the packs.
export function statusKey(st){
  if(!st) return "sa.status.pending";
  var s = st.status, r = st.reason;
  if(s == "disabled") return "sa.status.disabled";
  if(s == "triggered") return "sa.status.triggered";
  if(s == "cooldown") return "sa.status.cooldown";
  if(s == "market_closed") return r ? "sa.why." + r : "sa.status.market_closed";
  if(s == "stale") return r == "bars_stale" ? "sa.why.bars_stale" : "sa.why.quote_stale";
  if(s == "unavailable" || s == "error") return r ? "sa.why." + r : "sa.status.unavailable";
  if(s == "waiting") return r ? "sa.why." + r : "sa.status.waiting";
  return "sa.status.pending";
}
// short chip text key
export function statusChipKey(st){
  if(!st) return "sa.status.pending";
  var s = st.status;
  if(s == "waiting" || s == "triggered" || s == "cooldown" || s == "disabled" || s == "stale" || s == "market_closed" || s == "unavailable") return "sa.status." + s;
  return "sa.status.unavailable";
}

export function ruleParamText(rule){
  var p = (rule && rule.params) || {};
  if(rule.type == "price_above") return ">= " + Number(p.value).toFixed(2);
  if(rule.type == "price_below") return "<= " + Number(p.value).toFixed(2);
  if(rule.type == "pct_up") return p.pct + "%";
  if(rule.type == "pct_down") return p.pct + "%";
  if(rule.type == "volume_spike") return p.mult + "x";
  if(rule.type == "price_up_volume" || rule.type == "price_down_volume") return p.mult + "x, " + p.minMovePct + "%";
  if(rule.type == "gann_near") return p.anchorPrice + " / " + p.scale + " / " + p.nearPct + "%";
  if(rule.type == "gann_close" || rule.type == "gann_any") return (p.kind == "high" ? "v " : "^ ") + p.anchorPrice + " / " + p.scale;
  if(rule.type == "candle") return (p.patterns || []).length + "";
  return "";
}

// Seconds since a timestamp, shown as a coarse label key + number
export function ageLabel(now, ms){
  if(typeof ms != "number") return { unit:"none", n:0 };
  var s = Math.max(0, Math.round((now - ms) / 1000));
  if(s < 90) return { unit:"s", n:s };
  var m = Math.round(s / 60);
  if(m < 90) return { unit:"m", n:m };
  var h = Math.round(m / 60);
  if(h < 48) return { unit:"h", n:h };
  return { unit:"d", n:Math.round(h / 24) };
}

// Symbols that may appear in the rule form: only watchlist (+ enabled indices).
export function formSymbols(watchlist, indices){
  var out = (watchlist || []).slice();
  indices = indices || {};
  if(indices.NIFTY && out.indexOf("NIFTY") < 0) out.push("NIFTY");
  if(indices.BANKNIFTY && out.indexOf("BANKNIFTY") < 0) out.push("BANKNIFTY");
  return out;
}

// BreakoutPro - alerts/alertMessage.js
// Turns an engine event into localized text (push title/body, in-app reason, voice phrase).
// Pure: no React, no storage. Shared by the server sender and the Smart Alerts screen.
// Market terms and symbols stay English. This is an educational signal, never advice.
// Rules: no backtick, no triple-equals, ASCII only.

import { alertText, normLang } from "./alertLang.js";
import { istLabel } from "./alertEngine.js";

export function symbolLabel(sym){
  if(sym == "BANKNIFTY") return "BANK NIFTY";
  return String(sym || "");
}
export function fmtPrice(n){
  if(typeof n != "number" || !isFinite(n)) return "-";
  return n.toFixed(2);
}
function r(n, d){ return typeof n == "number" && isFinite(n) ? n.toFixed(d) : "-"; }

function titleVars(ev, lang){
  var rs = ev.reason || {};
  return {
    sym: symbolLabel(ev.symbol), tf: ev.timeframe || "",
    level: fmtPrice(rs.level),
    pct: r(Math.abs(rs.pct != undefined ? rs.pct : (rs.movePct || 0)), 2),
    ratio: r(rs.ratio, 1),
    pattern: rs.pattern ? alertText(lang, "pat." + rs.pattern, null, rs.pattern) : ""
  };
}

function reasonKey(ev){
  var c = ev.event, rs = ev.reason || {};
  if(c == "price_above" || c == "price_below") return rs.between ? "rs.between" : "rs.price";
  if(c == "pct_up" || c == "pct_down") return "rs.pct";
  if(c == "breakout") return "rs.break_up";
  if(c == "breakdown") return "rs.break_down";
  if(c == "candle") return "rs.candle";
  return "rs.volume";
}

export function freshLabel(lang, fr){
  if(!fr) return "";
  if(fr.state == "live") return alertText(lang, "fr.live");
  if(fr.state == "delayed"){
    var mins = fr.lagMin != undefined ? fr.lagMin : (fr.ageSec != undefined ? Math.round(fr.ageSec / 60) : null);
    return mins ? alertText(lang, "fr.delayed_min", { n:Math.max(1, Math.round(mins)) }) : alertText(lang, "fr.delayed");
  }
  return alertText(lang, "fr.stale");
}

export function directionKey(dir){
  return dir == "up" ? "dir.up" : (dir == "down" ? "dir.down" : "dir.neutral");
}

// Returns { title, reason, body, voice, directionLabel, fresh, timeLabel, priceText }
export function buildMessage(ev, lang){
  var l = normLang(lang);
  var tv = titleVars(ev, l), rs = ev.reason || {};
  var title = alertText(l, "ev." + ev.event, tv, tv.sym + " " + ev.event);
  var rv = {
    price: fmtPrice(ev.price), level: fmtPrice(rs.level), seen: fmtPrice(rs.seen),
    pct: r(Math.abs(rs.pct || 0), 2), prev: fmtPrice(rs.prevClose), th: r(rs.threshold, 2),
    tf: ev.timeframe || "", close: fmtPrice(rs.close),
    volume: rs.volume != undefined ? String(Math.round(rs.volume)) : "-",
    baseline: rs.baseline != undefined ? String(Math.round(rs.baseline)) : "-",
    ratio: r(rs.ratio, 1), sessions: rs.sessions != undefined ? String(rs.sessions) : "-",
    move: r(Math.abs(rs.movePct || 0), 2)
  };
  var reason = alertText(l, reasonKey(ev), rv);
  if(ev.event == "price_up_volume" || ev.event == "price_down_volume") reason = reason + " " + alertText(l, "rs.move", rv);
  var fresh = freshLabel(l, ev.freshness);
  var timeLabel = ev.eventTime ? istLabel(ev.eventTime) : "";
  var src = ev.freshness && ev.freshness.source == "yahoo" ? "Yahoo Finance" : "";
  var body = reason + " " + fmtPrice(ev.price) + " | " + (ev.timeframe || "") + " | " + fresh + (src ? " | " + src : "") + (timeLabel ? " | " + timeLabel : "");
  var voice = alertText(l, "vo." + ev.event, tv, title);
  return {
    title: title, reason: reason, body: body, voice: voice,
    directionLabel: alertText(l, directionKey(ev.direction)),
    fresh: fresh, timeLabel: timeLabel, priceText: fmtPrice(ev.price)
  };
}

export function eduNote(lang){ return alertText(lang, "push.edu"); }

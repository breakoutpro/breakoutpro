// BreakoutPro - src/market/marketClient.js
// Browser side of the unified market-data layer. Every screen that needs a price reads it from
// HERE; nothing fetches quotes on its own. One shared store, one request per refresh for all symbols
// that any mounted screen asked for, shared across components, with back-off on failure.
//
//  - Requests go to /api/market?action=snapshot (server caches and de-duplicates upstream calls).
//  - The label is re-derived on the client clock from the quote's own timestamp and delay, so a
//    LIVE label can never outlive the data that earned it.
//  - Failures keep the last good quote visible but its label degrades with age (STALE), and a
//    symbol that never resolved is UNAVAILABLE. No price is ever invented or carried across symbols.
// Rules: no backtick, no triple-equals, ASCII only.

import { classifyQuote, canonicalSymbol, STATUS } from "./marketData.js";

export var CLIENT = { CHUNK:150, MIN_GAP_MS:8000, OPEN_POLL_MS:15000, CLOSED_POLL_MS:120000, TIMEOUT_MS:10000, BACKOFF:[3000, 8000, 20000, 60000] };

// Pure: re-label a stored quote against the current clock.
export function relabel(q, now){
  if(!q || q.price == null) return q;
  var fr = classifyQuote({ asOf:q.asOf, now:now, delayedBySec:q.delayedBySec });
  return Object.assign({}, q, { status:fr.status, statusReason:fr.reason, ageSec:fr.ageSec, closed:fr.closed });
}

function chunk(list, n){ var out = []; for(var i = 0; i < list.length; i += n) out.push(list.slice(i, i + n)); return out; }

// deps: { fetchImpl, now, setTimeoutImpl } - injectable for tests.
export function createQuoteStore(deps){
  deps = deps || {};
  var getNow = deps.now || function(){ return Date.now(); };
  var f = deps.fetchImpl || (typeof fetch != "undefined" ? fetch.bind(typeof window != "undefined" ? window : undefined) : null);
  var quotes = {};            // symbol -> normalized quote from the server
  var wanted = {};            // symbol -> number of subscribers asking for it
  var listeners = [];
  var info = { status:"idle", lastOkAt:null, lastTriedAt:null, failures:0, session:null };
  var inflight = null;

  function emit(){ listeners.slice().forEach(function(l){ try{ l(); }catch(e){} }); }

  function refresh(opts){
    opts = opts || {};
    var now = getNow();
    var syms = Object.keys(wanted);
    if(!syms.length || !f) return Promise.resolve();
    if(inflight) return inflight;
    if(!opts.force && info.lastTriedAt != null && now - info.lastTriedAt < CLIENT.MIN_GAP_MS) return Promise.resolve();
    info.lastTriedAt = now;
    if(info.status == "idle") info.status = "loading";
    var asked = syms.slice();
    var parts = chunk(syms.slice().sort(), CLIENT.CHUNK);
    inflight = Promise.all(parts.map(function(part){
      var url = "/api/market?action=snapshot&symbols=" + encodeURIComponent(part.join(","));
      var ctrl = null, timer = null;
      try{ ctrl = new AbortController(); }catch(e){ ctrl = null; }
      if(ctrl) timer = setTimeout(function(){ try{ ctrl.abort(); }catch(e){} }, CLIENT.TIMEOUT_MS);
      return Promise.resolve().then(function(){ return f(url, ctrl ? { signal:ctrl.signal } : undefined); }).then(function(r){
        if(timer) clearTimeout(timer);
        return Promise.resolve(r.json()).then(function(j){ return { ok:!!(j && j.ok && j.data && j.data.quotes), data:j && j.data }; }, function(){ return { ok:false }; });
      }, function(){ if(timer) clearTimeout(timer); return { ok:false }; });
    })).then(function(results){
      var anyOk = false;
      results.forEach(function(r){
        if(!r.ok) return;
        anyOk = true;
        Object.keys(r.data.quotes).forEach(function(k){
          var q = r.data.quotes[k];
          // An UNAVAILABLE answer never overwrites an older real quote: that one keeps degrading by age.
          if(q && q.price != null) quotes[k] = q;
          else if(!quotes[k]) quotes[k] = q;
        });
        if(r.data.session) info.session = r.data.session;
      });
      if(anyOk){ info.status = "ok"; info.lastOkAt = getNow(); info.failures = 0; }
      else { info.failures++; info.status = info.lastOkAt != null ? "stale" : "unavailable"; }
      inflight = null;
      emit();
      // A screen may have subscribed to more symbols while this request was in flight: fetch those now.
      if(anyOk && Object.keys(wanted).some(function(k){ return asked.indexOf(k) < 0; })) refresh({ force:true });
    }, function(){ inflight = null; info.failures++; info.status = info.lastOkAt != null ? "stale" : "unavailable"; emit(); });
    return inflight;
  }

  function nextDelay(){
    if(info.failures > 0) return CLIENT.BACKOFF[Math.min(info.failures - 1, CLIENT.BACKOFF.length - 1)];
    return info.session == "OPEN" || info.session == null ? CLIENT.OPEN_POLL_MS : CLIENT.CLOSED_POLL_MS;
  }

  return {
    // symbols: app symbols. Returns an unsubscribe function.
    subscribe: function(symbols, listener){
      var list = (symbols || []).map(canonicalSymbol).filter(Boolean);
      list.forEach(function(s){ wanted[s] = (wanted[s] || 0) + 1; });
      if(listener) listeners.push(listener);
      // Deferred one tick so every screen that mounts in the same render shares ONE request.
      Promise.resolve().then(function(){ refresh(); });
      return function(){
        list.forEach(function(s){ wanted[s] = (wanted[s] || 1) - 1; if(wanted[s] <= 0) delete wanted[s]; });
        if(listener){ var i = listeners.indexOf(listener); if(i >= 0) listeners.splice(i, 1); }
      };
    },
    refresh: refresh,
    nextDelay: nextDelay,
    // Labelled quotes for symbols, against the current clock. Missing symbol -> an explicit UNAVAILABLE row.
    read: function(symbols){
      var now = getNow(), out = {};
      (symbols || []).forEach(function(sym){
        var key = canonicalSymbol(sym);
        var q = key ? quotes[key] : null;
        out[sym] = q ? relabel(q, now) : { symbol:key || sym, price:null, status:STATUS.UNAVAILABLE, statusReason:"no_quote" };
      });
      return out;
    },
    info: function(){ return Object.assign({}, info); },
    _reset: function(){ quotes = {}; wanted = {}; listeners = []; inflight = null; info = { status:"idle", lastOkAt:null, lastTriedAt:null, failures:0, session:null }; }
  };
}

export var sharedStore = createQuoteStore();

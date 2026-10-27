import { useState, useEffect, useRef, useCallback } from "react";
import { callAlerts, fetchStatus, enrollDevice, getDevice, sessionToken } from "./alertsClient";
import { pushSupported, permissionState, subscribePush, unsubscribePush, currentSubscription } from "./pushClient";
import { cleanWatchlist } from "./alertRules";
import { useLang } from "../i18n/translations";
import { useWatchlist } from "../hooks/useWatchlist";

// BreakoutPro - useSmartAlertsPro
// Loads server status + the owner's rules/history, keeps the server copy of the watchlist and
// language in step with the app, manages the push subscription, and reports NEW alert events
// (from the server's own scheduled/real evaluation) to the caller. Nothing here generates alerts.
// Polling: only the stored state (no provider calls), once a minute, only while this screen is
// mounted and the page is visible.
// Rules: no backtick, no triple-equals, ASCII only.

var POLL_MS = 60000;

function sameList(a, b){
  if(a.length != b.length) return false;
  for(var i = 0; i < a.length; i++){ if(a[i] != b[i]) return false; }
  return true;
}

export function useSmartAlertsPro(onNewEvents){
  var lang = useLang();
  var wl = useWatchlist();
  var s1 = useState({ phase:"loading", srv:null, data:null });
  var st = s1[0], setSt = s1[1];
  var s2 = useState(permissionState());
  var perm = s2[0], setPerm = s2[1];
  var s3 = useState(null);
  var browserSub = s3[0], setBrowserSub = s3[1];
  var s4 = useState(null);
  var busy = s4[0], setBusy = s4[1];
  var s5 = useState(null);
  var msg = s5[0], setMsg = s5[1];
  var seen = useRef(null);
  var cb = useRef(onNewEvents);
  cb.current = onNewEvents;
  var wlClean = cleanWatchlist(wl.list);
  var wlKey = wlClean.join(",");

  var applyGet = useCallback(function(res, srv){
    if(!res.ok){
      if(res.status == 401) return setSt(function(p){ return { phase:"needs_enroll", srv:srv || p.srv, data:null }; });
      return setSt(function(p){ return { phase:(res.status == 503 ? "unconfigured" : "error"), srv:srv || p.srv, data:p.data }; });
    }
    var ids = (res.json.history || []).map(function(h){ return h.id; });
    if(seen.current == null){ seen.current = {}; ids.forEach(function(i){ seen.current[i] = 1; }); }
    else {
      var fresh = (res.json.history || []).filter(function(h){ return !seen.current[h.id]; });
      fresh.forEach(function(h){ seen.current[h.id] = 1; });
      if(fresh.length && cb.current){ try{ cb.current(fresh); }catch(e){} }
    }
    setSt(function(p){ return { phase:"ready", srv:srv || p.srv, data:res.json }; });
  }, []);

  var refresh = useCallback(function(){
    return fetchStatus().then(function(sr){
      var srv = sr.ok ? sr.json : null;
      if(!srv) return setSt(function(p){ return { phase:"error", srv:null, data:p.data }; });
      if(!srv.storage) return setSt({ phase:"unconfigured", srv:srv, data:null });
      if(!getDevice()) return setSt({ phase:"needs_enroll", srv:srv, data:null });
      return callAlerts("get", {}).then(function(res){ applyGet(res, srv); });
    });
  }, [applyGet]);

  // first load
  useEffect(function(){ refresh(); }, []);

  // keep the browser permission and subscription state current
  useEffect(function(){
    setPerm(permissionState());
    currentSubscription().then(function(sub){ setBrowserSub(!!sub); });
  }, [st.phase]);

  // re-register the existing browser subscription with the server (covers rotation and restores)
  useEffect(function(){
    if(st.phase != "ready" || !st.srv || !st.srv.push) return;
    if(permissionState() != "granted") return;
    currentSubscription().then(function(sub){
      if(sub) callAlerts("subscribe", { subscription: sub.toJSON() });
    });
  }, [st.phase]);

  // watchlist + language -> server (server validates and is the source for monitoring)
  useEffect(function(){
    if(st.phase != "ready" || !st.data) return;
    var doc = st.data.doc || {};
    var serverList = cleanWatchlist(doc.watchlist || []);
    var body = {};
    if(!sameList(serverList, wlClean)) body.watchlist = wlClean;
    if((doc.lang || "en") != lang) body.lang = lang;
    if(!body.watchlist && !body.lang) return;
    callAlerts("saveSettings", body).then(function(res){
      if(res.ok) setSt(function(p){ return p.data ? { phase:p.phase, srv:p.srv, data:Object.assign({}, p.data, { doc:res.json.doc }) } : p; });
    });
  }, [st.phase, wlKey, lang, st.data ? (st.data.doc || {}).updatedAt : 0]);

  // poll stored state while visible
  useEffect(function(){
    if(st.phase != "ready") return;
    var id = setInterval(function(){
      try{ if(document.hidden) return; }catch(e){}
      callAlerts("get", {}).then(function(res){ applyGet(res, null); });
    }, POLL_MS);
    function onVis(){ try{ if(!document.hidden) callAlerts("get", {}).then(function(res){ applyGet(res, null); }); }catch(e){} }
    try{ document.addEventListener("visibilitychange", onVis); }catch(e){}
    return function(){ clearInterval(id); try{ document.removeEventListener("visibilitychange", onVis); }catch(e){} };
  }, [st.phase]);

  // the service worker tells us the push subscription was rotated
  useEffect(function(){
    function onMsg(ev){
      if(ev && ev.data && ev.data.type == "bp-resubscribe"){
        currentSubscription().then(function(sub){ if(sub && getDevice()) callAlerts("subscribe", { subscription: sub.toJSON() }); setBrowserSub(!!sub); });
      }
    }
    try{ if(navigator.serviceWorker) navigator.serviceWorker.addEventListener("message", onMsg); }catch(e){}
    return function(){ try{ if(navigator.serviceWorker) navigator.serviceWorker.removeEventListener("message", onMsg); }catch(e){} };
  }, []);

  function note(kind, key){ setMsg({ kind:kind, key:key, at:Date.now() }); }
  function replaceDoc(doc){ setSt(function(p){ return p.data ? { phase:p.phase, srv:p.srv, data:Object.assign({}, p.data, { doc:doc }) } : p; }); }

  var enableBackground = useCallback(function(code){
    setBusy("enable"); setMsg(null);
    var vapid = st.srv && st.srv.vapidPublicKey;
    var sub = null;
    // permission first, straight from the tap, so the browser accepts the prompt
    return (st.srv && st.srv.push && pushSupported() ? subscribePush(vapid) : Promise.resolve({ ok:false, reason: st.srv && st.srv.push ? "unsupported" : "no_keys" })).then(function(pr){
      sub = pr.ok ? pr.subscription : null;
      setPerm(permissionState());
      var need = getDevice() ? Promise.resolve({ ok:true }) : (function(){
        var auth = code ? { code:code } : (sessionToken() ? { token:sessionToken() } : null);
        if(!auth) return Promise.resolve({ ok:false, reason:"need_code" });
        return enrollDevice(auth, lang);
      })();
      return need.then(function(er){
        if(!er.ok){ setBusy(null); note("error", er.reason == "need_code" ? "sa.bg.need_code" : "sa.bg.code_bad"); return { ok:false, reason:er.reason }; }
        var p = sub ? callAlerts("subscribe", { subscription: sub }) : Promise.resolve({ ok:true });
        return p.then(function(){ return refresh(); }).then(function(){
          setBusy(null);
          if(pr.reason == "denied") note("error", "sa.perm.denied");
          else if(pr.reason == "unsupported") note("error", "sa.perm.unsupported");
          else if(pr.reason == "no_keys") note("error", "sa.st.vapid");
          return { ok:true, push:pr.ok };
        });
      });
    });
  }, [st.srv, lang, refresh]);

  var disableBackground = useCallback(function(){
    setBusy("disable");
    return unsubscribePush().then(function(r){
      var p = r.endpoint ? callAlerts("unsubscribe", { endpoint:r.endpoint }) : Promise.resolve({ ok:true });
      return p.then(function(){ setBrowserSub(false); setBusy(null); return refresh(); });
    });
  }, [refresh]);

  var deleteServerData = useCallback(function(){
    setBusy("delete");
    return unsubscribePush().then(function(r){
      return callAlerts("unenroll", {}).then(function(res){
        setBusy(null);
        seen.current = null;
        if(res.ok){ try{ localStorage.removeItem("bp_alerts_device"); }catch(e){} note("ok", "sa.bg.deleted"); }
        return refresh();
      });
    });
  }, [refresh]);

  var saveRule = useCallback(function(rule){
    setBusy("rule");
    return callAlerts("saveRule", { rule:rule }).then(function(res){
      setBusy(null);
      if(res.ok){ replaceDoc(res.json.doc); note("ok", "sa.form.saved"); }
      return res;
    });
  }, []);
  var toggleRule = useCallback(function(id, enabled){
    return callAlerts("toggleRule", { id:id, enabled:enabled }).then(function(res){ if(res.ok) replaceDoc(res.json.doc); return res; });
  }, []);
  var deleteRule = useCallback(function(id){
    return callAlerts("deleteRule", { id:id }).then(function(res){ if(res.ok) replaceDoc(res.json.doc); return res; });
  }, []);
  var setIndices = useCallback(function(ind){
    return callAlerts("saveSettings", { indices:ind }).then(function(res){ if(res.ok) replaceDoc(res.json.doc); return res; });
  }, []);
  var sendTest = useCallback(function(){
    setBusy("test");
    return callAlerts("test", {}).then(function(res){
      setBusy(null);
      note(res.ok ? "ok" : "error", res.ok ? "sa.bg.test_sent" : "sa.bg.test_failed");
      return refresh();
    });
  }, [refresh]);
  var checkNow = useCallback(function(){
    setBusy("check");
    return callAlerts("checkNow", {}).then(function(){ setBusy(null); return refresh(); });
  }, [refresh]);
  var clearHistory = useCallback(function(){
    return callAlerts("clearHistory", {}).then(function(){ return refresh(); });
  }, [refresh]);

  return {
    phase: st.phase, srv: st.srv, data: st.data, perm: perm, browserSub: browserSub, busy: busy, msg: msg, lang: lang,
    watchlist: wlClean, pushCapable: pushSupported(),
    refresh: refresh, enableBackground: enableBackground, disableBackground: disableBackground, deleteServerData: deleteServerData,
    saveRule: saveRule, toggleRule: toggleRule, deleteRule: deleteRule, setIndices: setIndices,
    sendTest: sendTest, checkNow: checkNow, clearHistory: clearHistory
  };
}

export default useSmartAlertsPro;

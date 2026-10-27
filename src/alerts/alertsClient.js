// BreakoutPro - alerts/alertsClient.js
// Browser side of /api/alerts. The device credential is stored in this browser only and is sent
// in a header (never in a URL). A 401 clears it so the screen asks to enable again.
// Nothing here fabricates data: when the server cannot be reached the caller gets ok:false.
// Rules: no backtick, no triple-equals, ASCII only.

var BASE = "/api/alerts";
var KEY = "bp_alerts_device";

export function getDevice(){
  try{ var v = localStorage.getItem(KEY); return v && v.length == 43 ? v : null; }catch(e){ return null; }
}
function setDevice(s){ try{ localStorage.setItem(KEY, s); }catch(e){} }
export function clearDevice(){ try{ localStorage.removeItem(KEY); }catch(e){} }
export function sessionToken(){ try{ return sessionStorage.getItem("bp_session") || ""; }catch(e){ return ""; } }

function parse(r){
  return r.json().then(function(j){ return { ok: !!(j && j.ok), status: r.status, json: j || {} }; }, function(){ return { ok:false, status:r.status, json:{ reason:"bad_response" } }; });
}

export function callAlerts(action, body, opts){
  opts = opts || {};
  var headers = { "Content-Type": "application/json" };
  var dev = opts.noDevice ? null : getDevice();
  if(dev) headers["X-BP-Device"] = dev;
  return fetch(BASE + "?action=" + encodeURIComponent(action), { method:"POST", headers:headers, body:JSON.stringify(body || {}) })
    .then(function(r){
      return parse(r).then(function(res){
        if(res.status == 401 && dev && action != "enroll") clearDevice();
        return res;
      });
    }, function(){ return { ok:false, status:0, json:{ reason:"network" } }; });
}

export function fetchStatus(){
  return fetch(BASE + "?action=status", { method:"GET" }).then(parse, function(){ return { ok:false, status:0, json:{ reason:"network" } }; });
}

// auth: { code } or { token }. Resolves { ok, reason }. The secret is saved here, never returned.
export function enrollDevice(auth, lang){
  var body = { lang: lang || "en" };
  if(auth && auth.code) body.code = auth.code;
  else if(auth && auth.token) body.token = auth.token;
  return callAlerts("enroll", body, { noDevice:true }).then(function(res){
    if(res.ok && res.json.secret){ setDevice(res.json.secret); return { ok:true }; }
    return { ok:false, reason: res.json.reason || "failed" };
  });
}

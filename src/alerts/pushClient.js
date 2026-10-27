// BreakoutPro - alerts/pushClient.js
// Browser Web Push helpers. The permission prompt is only ever requested from a user tap.
// Rules: no backtick, no triple-equals, ASCII only.

export function pushSupported(){
  try{
    return typeof navigator != "undefined" && "serviceWorker" in navigator && typeof window != "undefined" && "PushManager" in window && "Notification" in window;
  }catch(e){ return false; }
}
export function permissionState(){
  try{ return typeof Notification != "undefined" ? Notification.permission : "unsupported"; }catch(e){ return "unsupported"; }
}
export function keyToBytes(b64){
  var s = String(b64).replace(/-/g, "+").replace(/_/g, "/");
  while(s.length % 4 != 0) s += "=";
  var raw = atob(s), out = new Uint8Array(raw.length);
  for(var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
function ready(){
  return navigator.serviceWorker.ready;
}
export function currentSubscription(){
  if(!pushSupported()) return Promise.resolve(null);
  return ready().then(function(reg){ return reg.pushManager.getSubscription(); }).catch(function(){ return null; });
}
// Returns { ok, reason, subscription } ; reason: unsupported | denied | dismissed | failed
export function subscribePush(vapidPublicKey){
  if(!pushSupported()) return Promise.resolve({ ok:false, reason:"unsupported" });
  if(!vapidPublicKey) return Promise.resolve({ ok:false, reason:"failed" });
  return Notification.requestPermission().then(function(p){
    if(p == "denied") return { ok:false, reason:"denied" };
    if(p != "granted") return { ok:false, reason:"dismissed" };
    return ready().then(function(reg){
      return reg.pushManager.getSubscription().then(function(existing){
        if(existing) return existing;
        return reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey:keyToBytes(vapidPublicKey) });
      });
    }).then(function(sub){ return { ok:true, subscription:sub.toJSON() }; });
  }).catch(function(){ return { ok:false, reason:"failed" }; });
}
export function unsubscribePush(){
  return currentSubscription().then(function(sub){
    if(!sub) return { ok:true, endpoint:null };
    var ep = sub.endpoint;
    return sub.unsubscribe().then(function(){ return { ok:true, endpoint:ep }; }, function(){ return { ok:false, endpoint:ep }; });
  });
}

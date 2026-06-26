// BreakoutPro - i18n/translations.js
// Lightweight translation system. getLang/setLang persist choice; t(key) translates.
// Premium languages gated behind trial/subscription. Rules: no backtick, no triple-equals, ASCII.

export var LANGUAGES = [
  {code:"en", native:"English",   name:"English",   free:true},
  {code:"te", native:"\u0C24\u0C46\u0C32\u0C41\u0C17\u0C41", name:"Telugu",  free:false},
  {code:"hi", native:"\u0939\u093F\u0928\u094D\u0926\u0940", name:"Hindi",   free:false},
  {code:"kn", native:"\u0C95\u0CA8\u0CCD\u0CA8\u0CA1", name:"Kannada", free:false},
  {code:"ta", native:"\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD", name:"Tamil",    free:false},
  {code:"ml", native:"\u0D2E\u0D32\u0D2F\u0D3E\u0D33\u0D02", name:"Malayalam",free:false},
  {code:"gu", native:"\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0", name:"Gujarati",free:false},
  {code:"mr", native:"\u092E\u0930\u093E\u0920\u0940", name:"Marathi",  free:false},
  {code:"bn", native:"\u09AC\u09BE\u0982\u09B2\u09BE", name:"Bengali",  free:false},
  {code:"pa", native:"\u0A2A\u0A70\u0A1C\u0A3E\u0A2C\u0A40", name:"Punjabi",  free:false},
  {code:"or", native:"\u0B13\u0B21\u0B3C\u0B3F\u0B06", name:"Odia",     free:false},
  {code:"as", native:"\u0985\u09B8\u09AE\u09C0\u09AF\u09BC\u09BE", name:"Assamese",free:false}
];

export function getLang(){
  try{ return localStorage.getItem("bp_lang")||"en"; }catch(e){ return "en"; }
}
export function setLang(code){
  try{ localStorage.setItem("bp_lang",code); }catch(e){}
}

// Translation strings. Add keys as the app grows.
// Languages not yet filled fall back to English automatically.
var STR = {
  en:{
    home:"Home", markets:"Markets", learn:"Learn", alerts:"Alerts", more:"More",
    market_brief:"AI Market Brief", live_indices:"Live Indices",
    pattern_alerts:"Pattern Alerts", market_intel:"Market Intelligence",
    options_intel:"Options Intelligence", ai_option_analysis:"AI Option Analysis",
    top_news:"Top News", learn_invest:"Learn & Invest", quick_tools:"Quick Tools",
    view_all:"View All", view_full:"View Full", details:"Details",
    watchlist:"Watchlist", settings:"Settings", language:"Language",
    not_advice:"Educational Market Intelligence Only. Not Investment Advice."
  },
  te:{
    home:"\u0C39\u0C4B\u0C2E\u0C4D", markets:"\u0C2E\u0C3E\u0C30\u0C4D\u0C15\u0C46\u0C1F\u0C4D\u0C32\u0C41", learn:"\u0C28\u0C47\u0C30\u0C4D\u0C1A\u0C41", alerts:"\u0C05\u0C32\u0C30\u0C4D\u0C1F\u0C4D\u0C32\u0C41", more:"\u0C2E\u0C30\u0C3F\u0C28\u0C4D\u0C28\u0C3F",
    market_brief:"AI \u0C2E\u0C3E\u0C30\u0C4D\u0C15\u0C46\u0C1F\u0C4D \u0C2C\u0C4D\u0C30\u0C40\u0C2B\u0C4D", live_indices:"\u0C32\u0C48\u0C35\u0C4D \u0C07\u0C28\u0C4D\u0C21\u0C46\u0C15\u0C4D\u0C38\u0C4D\u200C\u0C32\u0C41",
    pattern_alerts:"\u0C2A\u0C4D\u0C2F\u0C3E\u0C1F\u0C30\u0C4D\u0C28\u0C4D \u0C05\u0C32\u0C30\u0C4D\u0C1F\u0C4D\u0C32\u0C41", market_intel:"\u0C2E\u0C3E\u0C30\u0C4D\u0C15\u0C46\u0C1F\u0C4D \u0C07\u0C02\u0C1F\u0C46\u0C32\u0C3F\u0C1C\u0C46\u0C28\u0C4D\u0C38\u0C4D",
    options_intel:"\u0C06\u0C2A\u0C4D\u0C37\u0C28\u0C4D\u0C38\u0C4D \u0C07\u0C02\u0C1F\u0C46\u0C32\u0C3F\u0C1C\u0C46\u0C28\u0C4D\u0C38\u0C4D", ai_option_analysis:"AI \u0C06\u0C2A\u0C4D\u0C37\u0C28\u0C4D \u0C35\u0C3F\u0C36\u0C4D\u0C32\u0C47\u0C37\u0C23",
    top_news:"\u0C1F\u0C3E\u0C2A\u0C4D \u0C35\u0C3E\u0C30\u0C4D\u0C24\u0C32\u0C41", learn_invest:"\u0C28\u0C47\u0C30\u0C4D\u0C1A\u0C41 & \u0C2A\u0C46\u0C1F\u0C4D\u0C1F\u0C41\u0C2C\u0C21\u0C3F", quick_tools:"\u0C15\u0C4D\u0C35\u0C3F\u0C15\u0C4D \u0C1F\u0C42\u0C32\u0C4D\u0C38\u0C4D",
    view_all:"\u0C05\u0C28\u0C4D\u0C28\u0C40 \u0C1A\u0C42\u0C21\u0C41", view_full:"\u0C2A\u0C42\u0C30\u0C4D\u0C24\u0C3F\u0C17\u0C3E \u0C1A\u0C42\u0C21\u0C41", details:"\u0C35\u0C3F\u0C35\u0C30\u0C3E\u0C32\u0C41",
    watchlist:"\u0C35\u0C3E\u0C1A\u0C4D\u200C\u0C32\u0C3F\u0C38\u0C4D\u0C1F\u0C4D", settings:"\u0C38\u0C46\u0C1F\u0C4D\u0C1F\u0C3F\u0C02\u0C17\u0C4D\u0C38\u0C4D", language:"\u0C2D\u0C3E\u0C37",
    not_advice:"\u0C15\u0C47\u0C35\u0C32\u0C02 \u0C35\u0C3F\u0C26\u0C4D\u0C2F\u0C3E \u0C2E\u0C3E\u0C30\u0C4D\u0C15\u0C46\u0C1F\u0C4D \u0C07\u0C02\u0C1F\u0C46\u0C32\u0C3F\u0C1C\u0C46\u0C28\u0C4D\u0C38\u0C4D. \u0C2A\u0C46\u0C1F\u0C4D\u0C1F\u0C41\u0C2C\u0C21\u0C3F \u0C38\u0C32\u0C39\u0C3E \u0C15\u0C3E\u0C26\u0C41."
  }
};

// Translate a key. Falls back to English, then to the key itself.
export function t(key){
  var lang=getLang();
  if(STR[lang] && STR[lang][key]!=undefined) return STR[lang][key];
  if(STR.en[key]!=undefined) return STR.en[key];
  return key;
}

// Shared access check used across the whole app for premium gating.
// Admin (8790124010) and premium users get everything. New users get a 7-day trial.
export function hasAccess(){
  try{
    var sess=JSON.parse(localStorage.getItem("bp_sess")||"{}");
    if(sess && (sess.isAdmin || sess.isPrem)) return true;
    if(sess && sess.trialStart){
      var sevenDays=7*24*60*60*1000;
      if(Date.now() < (sess.trialStart + sevenDays)) return true;
    }
    if(localStorage.getItem("bp_premium")=="1") return true;
    return false;
  }catch(e){ return false; }
}

// Is the logged-in user the admin?
export function isAdmin(){
  try{
    var sess=JSON.parse(localStorage.getItem("bp_sess")||"{}");
    return !!(sess && sess.isAdmin);
  }catch(e){ return false; }
}

// BreakoutPro - i18n/translations.js
// TECHNICAL LANGUAGE RULE: trading/financial terminology ALWAYS stays English
// (Theta, Gamma, PCR, Max Pain, Options Intelligence, etc). Only explanations,
// navigation words, and UI helper text translate to the selected language.
// Rules: no backtick, no triple-equals, ASCII only.

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
  return "en"; // ENGLISH-ONLY private beta: locked to English
}
export function setLang(code){
  try{ localStorage.setItem("bp_lang","en"); }catch(e){} // locked to English
}

// TERMINOLOGY - always English in every language. Never translate these.
// (Kept as a set so t() returns them unchanged regardless of language.)
var TERMS = {
  options_intel:"Options Intelligence",
  market_intel:"Market Intelligence",
  ai_option_analysis:"AI Option Analysis",
  pattern_alerts:"Pattern Alerts",
  market_brief:"AI Market Brief",
  live_indices:"Live Indices",
  option_chain:"Option Chain",
  greeks:"Greeks"
};

// UI / navigation / helper words and explanations - these translate.
var STR = {
  en:{
    home:"Home", markets:"Markets", learn:"Learn", alerts:"Alerts", more:"More",
    top_news:"Top News", learn_invest:"Learn & Invest", quick_tools:"Quick Tools",
    view_all:"View All", view_full:"View Full", details:"Details",
    watchlist:"Watchlist", settings:"Settings", language:"Language",
    tap_insight:"Tap any metric for AI insight.",
    not_advice:"Educational Market Intelligence Only. Not Investment Advice.",
    meaning:"Meaning",
    lbl_what:"WHAT IT MEANS", lbl_why:"WHY IT MATTERS", lbl_now:"CURRENT INTERPRETATION",
    lbl_beginner:"BEGINNER", lbl_advanced:"ADVANCED", lbl_history:"HISTORICAL BEHAVIOR", lbl_risk:"RISK FACTORS"
  },
  te:{
    home:"\u0C39\u0C4B\u0C2E\u0C4D", markets:"\u0C2E\u0C3E\u0C30\u0C4D\u0C15\u0C46\u0C1F\u0C4D\u0C32\u0C41", learn:"\u0C28\u0C47\u0C30\u0C4D\u0C1A\u0C41", alerts:"\u0C05\u0C32\u0C30\u0C4D\u0C1F\u0C4D\u0C32\u0C41", more:"\u0C2E\u0C30\u0C3F\u0C28\u0C4D\u0C28\u0C3F",
    top_news:"\u0C1F\u0C3E\u0C2A\u0C4D \u0C35\u0C3E\u0C30\u0C4D\u0C24\u0C32\u0C41", learn_invest:"\u0C28\u0C47\u0C30\u0C4D\u0C1A\u0C41 & \u0C2A\u0C46\u0C1F\u0C4D\u0C1F\u0C41\u0C2C\u0C21\u0C3F", quick_tools:"\u0C15\u0C4D\u0C35\u0C3F\u0C15\u0C4D \u0C1F\u0C42\u0C32\u0C4D\u0C38\u0C4D",
    view_all:"\u0C05\u0C28\u0C4D\u0C28\u0C40 \u0C1A\u0C42\u0C21\u0C41", view_full:"\u0C2A\u0C42\u0C30\u0C4D\u0C24\u0C3F\u0C17\u0C3E \u0C1A\u0C42\u0C21\u0C41", details:"\u0C35\u0C3F\u0C35\u0C30\u0C3E\u0C32\u0C41",
    watchlist:"\u0C35\u0C3E\u0C1A\u0C4D\u200C\u0C32\u0C3F\u0C38\u0C4D\u0C1F\u0C4D", settings:"\u0C38\u0C46\u0C1F\u0C4D\u0C1F\u0C3F\u0C02\u0C17\u0C4D\u0C38\u0C4D", language:"\u0C2D\u0C3E\u0C37",
    tap_insight:"AI \u0C35\u0C3F\u0C36\u0C4D\u0C32\u0C47\u0C37\u0C23 \u0C15\u0C4B\u0C38\u0C02 \u0C0F \u0C2E\u0C46\u0C1F\u0C4D\u0C30\u0C3F\u0C15\u0C4D \u0C2A\u0C48\u0C28\u0C48\u0C28\u0C3E \u0C28\u0C4A\u0C15\u0C4D\u0C15\u0C02\u0C21\u0C3F.",
    not_advice:"\u0C15\u0C47\u0C35\u0C32\u0C02 \u0C35\u0C3F\u0C26\u0C4D\u0C2F\u0C3E \u0C2E\u0C3E\u0C30\u0C4D\u0C15\u0C46\u0C1F\u0C4D \u0C07\u0C02\u0C1F\u0C46\u0C32\u0C3F\u0C1C\u0C46\u0C28\u0C4D\u0C38\u0C4D. \u0C2A\u0C46\u0C1F\u0C4D\u0C1F\u0C41\u0C2C\u0C21\u0C3F \u0C38\u0C32\u0C39\u0C3E \u0C15\u0C3E\u0C26\u0C41.",
    meaning:"\u0C05\u0C30\u0C4D\u0C25\u0C02",
    lbl_what:"\u0C05\u0C30\u0C4D\u0C25\u0C02", lbl_why:"\u0C0E\u0C02\u0C26\u0C41\u0C15\u0C41 \u0C2E\u0C41\u0C16\u0C4D\u0C2F\u0C02", lbl_now:"\u0C2A\u0C4D\u0C30\u0C38\u0C4D\u0C24\u0C41\u0C24 \u0C05\u0C30\u0C4D\u0C25\u0C02",
    lbl_beginner:"\u0C2A\u0C4D\u0C30\u0C3E\u0C30\u0C02\u0C2D\u0C3F\u0C15\u0C41\u0C32\u0C15\u0C41", lbl_advanced:"\u0C05\u0C21\u0C4D\u0C35\u0C3E\u0C28\u0C4D\u0C38\u0C4D\u0C21\u0C4D", lbl_history:"\u0C17\u0C24 \u0C2A\u0C4D\u0C30\u0C35\u0C30\u0C4D\u0C24\u0C28", lbl_risk:"\u0C30\u0C3F\u0C38\u0C4D\u0C15\u0C4D \u0C15\u0C3E\u0C30\u0C15\u0C3E\u0C32\u0C41"
  },
  hi:{
    home:"\u0939\u094B\u092E", markets:"\u092C\u093E\u095B\u093E\u0930", learn:"\u0938\u0940\u0916\u0947\u0902", alerts:"\u0905\u0932\u0930\u094D\u091F", more:"\u0914\u0930",
    top_news:"\u091F\u0949\u092A \u0916\u092C\u0930\u0947\u0902", learn_invest:"\u0938\u0940\u0916\u0947\u0902 \u0914\u0930 \u0928\u093F\u0935\u0947\u0936", quick_tools:"\u0915\u094D\u0935\u093F\u0915 \u091F\u0942\u0932\u094D\u0938",
    view_all:"\u0938\u092D\u0940 \u0926\u0947\u0916\u0947\u0902", view_full:"\u092A\u0942\u0930\u093E \u0926\u0947\u0916\u0947\u0902", details:"\u0935\u093F\u0935\u0930\u0923",
    watchlist:"\u0935\u0949\u091A\u0932\u093F\u0938\u094D\u091F", settings:"\u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938", language:"\u092D\u093E\u0937\u093E",
    tap_insight:"AI \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u0915\u0947 \u0932\u093F\u090F \u0915\u093F\u0938\u0940 \u092D\u0940 \u092E\u0947\u091F\u094D\u0930\u093F\u0915 \u092A\u0930 \u091F\u0948\u092A \u0915\u0930\u0947\u0902\u0964",
    not_advice:"\u0915\u0947\u0935\u0932 \u0936\u0948\u0915\u094D\u0937\u093F\u0915 \u092E\u093E\u0930\u094D\u0915\u0947\u091F \u091C\u093E\u0928\u0915\u093E\u0930\u0940\u0964 \u0928\u093F\u0935\u0947\u0936 \u0938\u0932\u093E\u0939 \u0928\u0939\u0940\u0902\u0964",
    meaning:"\u0905\u0930\u094D\u0925",
    lbl_what:"\u0905\u0930\u094D\u0925", lbl_why:"\u092F\u0939 \u0915\u094D\u092F\u094B\u0902 \u092E\u093E\u092F\u0928\u0947 \u0930\u0916\u0924\u093E \u0939\u0948", lbl_now:"\u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u0935\u094D\u092F\u093E\u0916\u094D\u092F\u093E",
    lbl_beginner:"\u0936\u0941\u0930\u0941\u0906\u0924\u0940", lbl_advanced:"\u090F\u0921\u0935\u093E\u0902\u0938\u094D\u0921", lbl_history:"\u090C\u0924\u093F\u0939\u093E\u0938\u093F\u0915 \u0935\u094D\u092F\u0935\u0939\u093E\u0930", lbl_risk:"\u091C\u094B\u0916\u093F\u092E \u0915\u093E\u0930\u0915"
  }
};

// Translate a key. Terminology returns English always. Others use selected language,
// falling back to English, then to the key.
export function t(key){
  // ENGLISH-ONLY (private beta): always return English, ignore any selected language.
  if(TERMS[key]!=undefined) return TERMS[key];
  if(STR.en[key]!=undefined) return STR.en[key];
  return key;
}

// Shared access check for premium gating. Admin and premium unlock everything.
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

export function isAdmin(){
  try{
    var sess=JSON.parse(localStorage.getItem("bp_sess")||"{}");
    return !!(sess && sess.isAdmin);
  }catch(e){ return false; }
}

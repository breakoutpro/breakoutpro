var TRANSLATIONS = {
  en: {
    home:"Home", markets:"Markets", scan:"Scan", learn:"Learn", ai:"AI", more:"More",
    goodMorning:"Good Morning", goodAfternoon:"Good Afternoon", goodEvening:"Good Evening", goodNight:"Good Night",
    marketOpen:"Market Open", marketClosed:"Market Closed", preMarket:"Pre-Market", mcxLive:"MCX Live",
    aiSummary:"AI Summary", aiBriefing:"AI Market Briefing", getBriefing:"Get Briefing",
    breakingNews:"Breaking News", todayEvents:"Today Events", marketMood:"Market Mood",
    fearGreed:"Fear and Greed", aiConfidence:"AI Confidence", globalCues:"Global Cues",
    todayWatchlist:"Today AI Watchlist", topGainers:"Top Gainers", topLosers:"Top Losers",
    sectorStrength:"Sector Strength", quickAccess:"Quick Access", watchlist:"Watchlist",
    liveAlerts:"Live Alerts", scanning:"Scanning Markets", bullish:"Bullish", bearish:"Bearish",
    settings:"Settings", language:"Language", logout:"Logout", confidence:"Confidence",
    riskLevel:"Risk Level", low:"Low", medium:"Medium", high:"High",
    disclaimer:"This is AI-generated market analysis for educational purposes only. It is not investment advice. Please do your own research before trading.",
    patternDetected:"pattern detected", breakoutDetected:"Breakout detected", volumeSpike:"Volume Spike detected",
    morningPulse:"Morning Pulse", overview:"Overview", global:"Global", stocks:"Stocks", analysis:"Analysis",
    support:"Support", resistance:"Resistance", trend:"Trend", chart:"Chart", zones:"Zones", pattern:"Pattern",
  },
  hi: {
    home:"होम", markets:"मार्केट्स", scan:"स्कैन", learn:"सीखें", ai:"एआई", more:"और",
    goodMorning:"सुप्रभात", goodAfternoon:"शुभ दोपहर", goodEvening:"शुभ संध्या", goodNight:"शुभ रात्रि",
    marketOpen:"मार्केट खुला है", marketClosed:"मार्केट बंद है", preMarket:"प्री-मार्केट", mcxLive:"MCX लाइव",
    aiSummary:"एआई सारांश", aiBriefing:"एआई मार्केट ब्रीफिंग", getBriefing:"ब्रीफिंग प्राप्त करें",
    breakingNews:"ताज़ा खबर", todayEvents:"आज की घटनाएं", marketMood:"मार्केट मूड",
    fearGreed:"डर और लालच", aiConfidence:"एआई कॉन्फिडेंस", globalCues:"ग्लोबल संकेत",
    todayWatchlist:"आज की एआई वॉचलिस्ट", topGainers:"टॉप गेनर्स", topLosers:"टॉप लूज़र्स",
    sectorStrength:"सेक्टर स्ट्रेंथ", quickAccess:"क्विक एक्सेस", watchlist:"वॉचलिस्ट",
    liveAlerts:"लाइव अलर्ट्स", scanning:"मार्केट स्कैन हो रहा है", bullish:"तेज़ी", bearish:"मंदी",
    settings:"सेटिंग्स", language:"भाषा", logout:"लॉगआउट", confidence:"कॉन्फिडेंस",
    riskLevel:"रिस्क लेवल", low:"कम", medium:"मध्यम", high:"उच्च",
    disclaimer:"यह केवल शैक्षणिक उद्देश्यों के लिए एआई द्वारा जनरेट किया गया मार्केट एनालिसिस है। यह निवेश सलाह नहीं है। ट्रेडिंग से पहले अपना खुद का रिसर्च करें।",
    patternDetected:"पैटर्न मिला", breakoutDetected:"ब्रेकआउट मिला", volumeSpike:"वॉल्यूम स्पाइक मिला",
    morningPulse:"मॉर्निंग पल्स", overview:"ओवरव्यू", global:"ग्लोबल", stocks:"स्टॉक्स", analysis:"एनालिसिस",
    support:"Support", resistance:"Resistance", trend:"ट्रेंड", chart:"चार्ट", zones:"ज़ोन्स", pattern:"पैटर्न",
  },
  te: {
    home:"హోమ్", markets:"మార్కెట్స్", scan:"స్కాన్", learn:"నేర్చుకో", ai:"AI", more:"మరిన్ని",
    goodMorning:"శుభోదయం", goodAfternoon:"శుభ మధ్యాహ్నం", goodEvening:"శుభ సాయంత్రం", goodNight:"శుభ రాత్రి",
    marketOpen:"మార్కెట్ ఓపెన్", marketClosed:"మార్కెట్ క్లోజ్", preMarket:"ప్రీ-మార్కెట్", mcxLive:"MCX లైవ్",
    aiSummary:"AI సారాంశం", aiBriefing:"AI మార్కెట్ బ్రీఫింగ్", getBriefing:"బ్రీఫింగ్ పొందండి",
    breakingNews:"బ్రేకింగ్ న్యూస్", todayEvents:"నేటి ఈవెంట్స్", marketMood:"మార్కెట్ మూడ్",
    fearGreed:"భయం మరియు లోభం", aiConfidence:"AI కాన్ఫిడెన్స్", globalCues:"గ్లోబల్ సంకేతాలు",
    todayWatchlist:"నేటి AI వాచ్‌లిస్ట్", topGainers:"టాప్ గెయినర్స్", topLosers:"టాప్ లూజర్స్",
    sectorStrength:"సెక్టార్ స్ట్రెంగ్త్", quickAccess:"క్విక్ యాక్సెస్", watchlist:"వాచ్‌లిస్ట్",
    liveAlerts:"లైవ్ అలర్ట్స్", scanning:"మార్కెట్లను స్కాన్ చేస్తోంది", bullish:"బుల్లిష్", bearish:"బేరిష్",
    settings:"సెట్టింగ్స్", language:"భాష", logout:"లాగౌట్", confidence:"కాన్ఫిడెన్స్",
    riskLevel:"రిస్క్ లెవల్", low:"తక్కువ", medium:"మధ్యస్థం", high:"ఎక్కువ",
    disclaimer:"ఇది విద్యా ప్రయోజనాల కోసం మాత్రమే AI-జనరేటెడ్ మార్కెట్ విశ్లేషణ. ఇది పెట్టుబడి సలహా కాదు. ట్రేడింగ్ చేసే ముందు మీ స్వంత పరిశోధన చేయండి.",
    patternDetected:"పాటర్న్ గుర్తించబడింది", breakoutDetected:"బ్రేకౌట్ గుర్తించబడింది", volumeSpike:"వాల్యూమ్ స్పైక్ గుర్తించబడింది",
    morningPulse:"మార్నింగ్ పల్స్", overview:"ఓవర్‌వ్యూ", global:"గ్లోబల్", stocks:"స్టాక్స్", analysis:"విశ్లేషణ",
    support:"Support", resistance:"Resistance", trend:"ట్రెండ్", chart:"చార్ట్", zones:"జోన్స్", pattern:"పాటర్న్",
  },
  gu: {
    home:"હોમ", markets:"માર્કેટ્સ", scan:"સ્કેન", learn:"શીખો", ai:"AI", more:"વધુ",
    goodMorning:"સુપ્રભાત", goodAfternoon:"શુભ બપોર", goodEvening:"શુભ સાંજ", goodNight:"શુભ રાત્રિ",
    marketOpen:"માર્કેટ ખુલ્લું છે", marketClosed:"માર્કેટ બંધ છે", preMarket:"પ્રી-માર્કેટ", mcxLive:"MCX લાઈવ",
    aiSummary:"AI સારાંશ", aiBriefing:"AI માર્કેટ બ્રીફિંગ", getBriefing:"બ્રીફિંગ મેળવો",
    breakingNews:"બ્રેકિંગ ન્યૂઝ", todayEvents:"આજની ઘટનાઓ", marketMood:"માર્કેટ મૂડ",
    fearGreed:"ડર અને લોભ", aiConfidence:"AI કોન્ફિડન્સ", globalCues:"ગ્લોબલ સંકેતો",
    todayWatchlist:"આજની AI વોચલિસ્ટ", topGainers:"ટોપ ગેઇનર્સ", topLosers:"ટોપ લુઝર્સ",
    sectorStrength:"સેક્ટર સ્ટ્રેન્થ", quickAccess:"ક્વિક એક્સેસ", watchlist:"વોચલિસ્ટ",
    liveAlerts:"લાઈવ અલર્ટ્સ", scanning:"માર્કેટ સ્કેન થઈ રહ્યું છે", bullish:"બુલિશ", bearish:"બેરિશ",
    settings:"સેટિંગ્સ", language:"ભાષા", logout:"લોગઆઉટ", confidence:"કોન્ફિડન્સ",
    riskLevel:"રિસ્ક લેવલ", low:"ઓછું", medium:"મધ્યમ", high:"વધારે",
    disclaimer:"આ ફક્ત શૈક્ષણિક હેતુઓ માટે AI-જનરેટેડ માર્કેટ વિશ્લેષણ છે. તે રોકાણ સલાહ નથી. ટ્રેડિંગ પહેલાં તમારું પોતાનું રિસર્ચ કરો.",
    patternDetected:"પેટર્ન મળ્યો", breakoutDetected:"બ્રેકઆઉટ મળ્યો", volumeSpike:"વોલ્યુમ સ્પાઈક મળ્યો",
    morningPulse:"મોર્નિંગ પલ્સ", overview:"ઓવરવ્યૂ", global:"ગ્લોબલ", stocks:"સ્ટોક્સ", analysis:"વિશ્લેષણ",
    support:"Support", resistance:"Resistance", trend:"ટ્રેન્ડ", chart:"ચાર્ટ", zones:"ઝોન્સ", pattern:"પેટર્ન",
  },
  mr: {
    home:"होम", markets:"मार्केट्स", scan:"स्कॅन", learn:"शिका", ai:"AI", more:"अधिक",
    goodMorning:"शुभ सकाळ", goodAfternoon:"शुभ दुपार", goodEvening:"शुभ संध्याकाळ", goodNight:"शुभ रात्री",
    marketOpen:"मार्केट उघडे आहे", marketClosed:"मार्केट बंद आहे", preMarket:"प्री-मार्केट", mcxLive:"MCX लाइव्ह",
    aiSummary:"AI सारांश", aiBriefing:"AI मार्केट ब्रीफिंग", getBriefing:"ब्रीफिंग मिळवा",
    breakingNews:"ब्रेकिंग न्यूज", todayEvents:"आजच्या घटना", marketMood:"मार्केट मूड",
    fearGreed:"भीती आणि लोभ", aiConfidence:"AI कॉन्फिडन्स", globalCues:"ग्लोबल संकेत",
    todayWatchlist:"आजची AI वॉचलिस्ट", topGainers:"टॉप गेनर्स", topLosers:"टॉप लूझर्स",
    sectorStrength:"सेक्टर स्ट्रेंथ", quickAccess:"क्विक अॅक्सेस", watchlist:"वॉचलिस्ट",
    liveAlerts:"लाइव्ह अलर्ट्स", scanning:"मार्केट स्कॅन होत आहे", bullish:"बुलिश", bearish:"बेअरिश",
    settings:"सेटिंग्ज", language:"भाषा", logout:"लॉगआउट", confidence:"कॉन्फिडन्स",
    riskLevel:"रिस्क लेव्हल", low:"कमी", medium:"मध्यम", high:"जास्त",
    disclaimer:"हे केवळ शैक्षणिक उद्देशांसाठी AI-जनरेटेड मार्केट विश्लेषण आहे. ही गुंतवणूक सल्ला नाही. ट्रेडिंगपूर्वी स्वतःचे संशोधन करा.",
    patternDetected:"पॅटर्न आढळला", breakoutDetected:"ब्रेकआउट आढळला", volumeSpike:"व्हॉल्यूम स्पाइक आढळला",
    morningPulse:"मॉर्निंग पल्स", overview:"ओव्हरव्ह्यू", global:"ग्लोबल", stocks:"स्टॉक्स", analysis:"विश्लेषण",
    support:"Support", resistance:"Resistance", trend:"ट्रेंड", chart:"चार्ट", zones:"झोन्स", pattern:"पॅटर्न",
  },
};

var LANGUAGES = [
  {code:"en",label:"English",   native:"English",  flag:"EN"},
  {code:"hi",label:"Hindi",     native:"हिन्दी",    flag:"HI"},
  {code:"te",label:"Telugu",    native:"తెలుగు",    flag:"TE"},
  {code:"gu",label:"Gujarati",  native:"ગુજરાતી",   flag:"GU"},
  {code:"mr",label:"Marathi",   native:"मराठी",     flag:"MR"},
];

function getLang() {
  try { return localStorage.getItem("bp_lang") || "en"; } catch(e) { return "en"; }
}

function setLang(code) {
  try { localStorage.setItem("bp_lang", code); } catch(e) {}
}

function t(key, lang) {
  var l = lang || getLang();
  var dict = TRANSLATIONS[l] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || key;
}

export { TRANSLATIONS, LANGUAGES, getLang, setLang, t };
    

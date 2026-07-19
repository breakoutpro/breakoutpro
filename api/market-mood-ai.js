// BreakoutPro - api/market-mood-ai.js
// Server-side AI synthesis for Market Mood. Uses GROQ_API_KEY (server-only, never returned).
// AI writes ONLY structured commentary text. It NEVER sets the numeric score or invents data.
// Rules: no backtick, no ===, ASCII.

function readBody(req){
  return new Promise(function(resolve){
    if(req.body){ resolve(typeof req.body=="string"?safeParse(req.body):req.body); return; }
    var d=""; req.on("data",function(c){ d+=c; }); req.on("end",function(){ resolve(safeParse(d)); });
  });
}
function safeParse(s){ try{ return JSON.parse(s||"{}"); }catch(e){ return {}; } }

export default async function handler(req, res){
  if(req.method != "POST"){ return res.status(405).json({ ok:false, reason:"method" }); }
  var KEY = process.env.GROQ_API_KEY || "";
  if(!KEY){ return res.status(200).json({ ok:false, reason:"ai_unavailable" }); }

  var body = await readBody(req);
  var mood = body.mood || {};       // deterministic score result (read-only for AI)
  var data = body.data || {};       // normalized market data
  var session = body.session || "";

  // Build a strict, grounded prompt. AI must not change numbers or invent data.
  var facts = [];
  if(mood.score!=null) facts.push("Deterministic score: " + mood.score + " (" + mood.label + "), stage: " + mood.stage + ", confidence: " + mood.confidence);
  if(mood.evidence){ for(var k in mood.evidence){ if(mood.evidence.hasOwnProperty(k)) facts.push(k + ": " + mood.evidence[k]); } }
  if(data.context3d && data.context3d.return3dPct!=null) facts.push("3-day return: " + data.context3d.return3dPct + "%");
  if(mood.unavailableComponents && mood.unavailableComponents.length) facts.push("Unavailable (do not discuss as if known): " + mood.unavailableComponents.join(", "));
  facts.push("Session: " + session);

  var sys = "You are an educational Indian market analyst for the Breakout Pro app. "
    + "Use ONLY the provided facts. Do NOT invent prices, levels, news, FII/DII, or sector data. "
    + "Do NOT change or restate a different numeric score. Do NOT guarantee direction or gap-up/gap-down. "
    + "Use probabilistic, educational language. Never say buy/sell/target/stoploss. "
    + "Return STRICT JSON only with keys: now, whatChanged, threeDayContext, keyDrivers (array of short strings), watchNext, riskNote. "
    + "Keep each field concise (one sentence, keyDrivers max 5 items). No markdown, no extra keys.";

  var user = "Facts:\n" + facts.join("\n") + "\n\nReturn the JSON now.";

  try{
    var r = await fetch("https://api.groq.com/openai/v1/chat/completions",{
      method:"POST",
      headers:{ "Content-Type":"application/json", "Authorization":"Bearer "+KEY },
      body: JSON.stringify({
        model:"llama-3.3-70b-versatile",
        messages:[{ role:"system", content:sys }, { role:"user", content:user }],
        temperature:0.5, max_tokens:600
      })
    });
    var d = await r.json();
    var txt = d && d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content;
    if(!txt){ return res.status(200).json({ ok:false, reason:"no_response" }); }
    // Parse the AI JSON safely; strip any code fences.
    var fence = String.fromCharCode(96,96,96); // three backticks, avoids literal backtick in source
    var clean = String(txt).split(fence+"json").join("").split(fence).join("").trim();
    var parsed; try{ parsed = JSON.parse(clean); }catch(e){ parsed = null; }
    if(!parsed){ return res.status(200).json({ ok:false, reason:"parse_error" }); }
    // Whitelist only allowed fields (AI cannot inject a score).
    var out = {
      now: str(parsed.now),
      whatChanged: str(parsed.whatChanged),
      threeDayContext: str(parsed.threeDayContext),
      keyDrivers: Array.isArray(parsed.keyDrivers) ? parsed.keyDrivers.slice(0,5).map(str) : [],
      watchNext: str(parsed.watchNext),
      riskNote: str(parsed.riskNote)
    };
    return res.status(200).json({ ok:true, ai:out });
  }catch(err){
    return res.status(200).json({ ok:false, reason:"error" });
  }
}
function str(x){ return (x==null)?"":String(x).slice(0,240); }

// BreakoutPro - api/ai.js
// Server-side Groq proxy. The Groq key lives ONLY on the server (GROQ_API_KEY, no VITE_ prefix)
// and is never returned to the browser. Client posts messages; server calls Groq.
// Rules: no backtick, no triple-equals, ASCII.

function readBody(req){
  return new Promise(function(resolve){
    if(req.body){ resolve(typeof req.body=="string"?safeParse(req.body):req.body); return; }
    var data=""; req.on("data",function(c){ data+=c; }); req.on("end",function(){ resolve(safeParse(data)); });
  });
}
function safeParse(s){ try{ return JSON.parse(s||"{}"); }catch(e){ return {}; } }

export default async function handler(req, res){
  if(req.method != "POST"){ return res.status(405).json({ ok:false, reason:"method" }); }

  var KEY = process.env.GROQ_API_KEY || "";
  if(!KEY){ return res.status(200).json({ ok:false, reason:"ai_unavailable" }); } // fail closed, generic

  var body = await readBody(req);
  var messages = Array.isArray(body.messages) ? body.messages : null;
  var model = typeof body.model=="string" ? body.model : "llama-3.3-70b-versatile";
  var maxTokens = Math.min(parseInt(body.max_tokens||800,10)||800, 2000);
  if(!messages || !messages.length){ return res.status(200).json({ ok:false, reason:"bad_request" }); }

  try{
    var r = await fetch("https://api.groq.com/openai/v1/chat/completions",{
      method:"POST",
      headers:{ "Content-Type":"application/json", "Authorization":"Bearer "+KEY },
      body: JSON.stringify({ model:model, messages:messages, temperature:0.7, max_tokens:maxTokens })
    });
    var d = await r.json();
    var txt = d && d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content;
    if(!txt){ return res.status(200).json({ ok:false, reason:"no_response" }); }
    return res.status(200).json({ ok:true, text:txt });
  }catch(err){
    // generic error, never leak key or internals
    return res.status(200).json({ ok:false, reason:"error" });
  }
}

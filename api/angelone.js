export const config = { runtime: "edge" };

async function safeJson(r, label) {
  var text = await r.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(label + " returned non-JSON (status " + r.status + "): " + text.slice(0, 150));
  }
}

var scripCache = { data: null, timestamp: 0 };

async function getScripMaster() {
  var now = Date.now();
  if (scripCache.data && (now - scripCache.timestamp) < 86400000) {
    return scripCache.data;
  }
  var r = await fetch("https://margincalculator.angelone.in/OpenAPI_File/files/OpenAPIScripMaster.json", {
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw new Error("Failed to fetch scrip master (status " + r.status + ")");
  var all = await safeJson(r, "Scrip master");
  var nseEquity = all.filter(function(s) {
    return s.exch_seg == "NSE" && s.symbol && s.symbol.indexOf("-EQ") != -1;
  });
  var map = {};
  nseEquity.forEach(function(s) {
    var bareSymbol = s.symbol.replace("-EQ", "");
    map[bareSymbol] = s.token;
  });
  scripCache = { data: map, timestamp: now };
  return map;
}

function base32Decode(input) {
  var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  var clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  var bits = "";
  for (var i = 0; i < clean.length; i++) {
    var idx = alphabet.indexOf(clean[i]);
    if (idx == -1) continue;
    bits += idx.toString(2).padStart(5, "0");
  }
  var bytes = [];
  for (var j = 0; j + 8 <= bits.length; j += 8) {
    bytes.push(parseInt(bits.substring(j, j + 8), 2));
  }
  return new Uint8Array(bytes);
}

async function hmacSha1(keyBytes, msgBytes) {
  var key = await crypto.subtle.importKey(
    "raw", keyBytes, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]
  );
  var sig = await crypto.subtle.sign("HMAC", key, msgBytes);
  return new Uint8Array(sig);
}

async function generateTOTP(secretBase32) {
  var keyBytes = base32Decode(secretBase32);
  var counter = Math.floor(Date.now() / 1000 / 30);

  var counterBytes = new Uint8Array(8);
  for (var i = 7; i >= 0; i--) {
    counterBytes[i] = counter & 0xff;
    counter = Math.floor(counter / 256);
  }

  var hmac = await hmacSha1(keyBytes, counterBytes);
  var offset = hmac[hmac.length - 1] & 0x0f;
  var code = (
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff)
  ) % 1000000;

  return code.toString().padStart(6, "0");
}

async function loginToAngelOne() {
  var totp = await generateTOTP(process.env.ANGELONE_TOTP_SECRET);

  var r = await fetch("https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByPassword", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "X-UserType": "USER",
      "X-SourceID": "WEB",
      "X-ClientLocalIP": "127.0.0.1",
      "X-ClientPublicIP": "127.0.0.1",
      "X-MACAddress": "00:00:00:00:00:00",
      "X-PrivateKey": process.env.ANGELONE_API_KEY,
    },
    body: JSON.stringify({
      clientcode: process.env.ANGELONE_CLIENT_CODE,
      password: process.env.ANGELONE_MPIN,
      totp: totp,
    }),
  });

  var data = await safeJson(r, "Angel One login");
  if (!data.status || !data.data || !data.data.jwtToken) {
    throw new Error("Angel One login failed: " + (data.message || JSON.stringify(data)));
  }
  return data.data;
}

export default async function handler(req) {
  var url = new URL(req.url);
  var action = url.searchParams.get("action") || "quote";

  try {
    if (!process.env.ANGELONE_API_KEY || !process.env.ANGELONE_CLIENT_CODE || !process.env.ANGELONE_MPIN || !process.env.ANGELONE_TOTP_SECRET) {
      return new Response(JSON.stringify({ error: "Angel One credentials not configured" }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    var session = await loginToAngelOne();
    var jwtToken = session.jwtToken;

    if (action == "quote") {
      var symbolsParam = url.searchParams.get("symbols") || "";
      var symbols = symbolsParam.split(",").filter(Boolean);

      var scripMap = await getScripMaster();
      var tokens = [];
      var tokenToSymbol = {};
      symbols.forEach(function(sym) {
        var token = scripMap[sym];
        if (token) {
          tokens.push(token);
          tokenToSymbol[token] = sym;
        }
      });

      if (tokens.length == 0) {
        return new Response(JSON.stringify({ status: false, message: "No matching tokens found", data: { fetched: [] } }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      tokens = tokens.slice(0, 50);

      var quoteR = await fetch("https://apiconnect.angelone.in/rest/secure/angelbroking/market/v1/quote/", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + jwtToken,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-UserType": "USER",
          "X-SourceID": "WEB",
          "X-ClientLocalIP": "127.0.0.1",
          "X-ClientPublicIP": "127.0.0.1",
          "X-MACAddress": "00:00:00:00:00:00",
          "X-PrivateKey": process.env.ANGELONE_API_KEY,
        },
        body: JSON.stringify({
          mode: "FULL",
          exchangeTokens: { NSE: tokens },
        }),
      });

      var quoteData = await safeJson(quoteR, "Angel One quote");

      if (quoteData && quoteData.data && quoteData.data.fetched) {
        quoteData.data.fetched.forEach(function(item) {
          item.ourSymbol = tokenToSymbol[item.symbolToken] || null;
        });
      }

      return new Response(JSON.stringify(quoteData), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=10",
        },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}

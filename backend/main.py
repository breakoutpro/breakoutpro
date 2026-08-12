# BreakoutPro - FastAPI market-data backend (testing/private-beta only).
# Provider abstraction: MarketDataProvider (base) -> YFinanceProvider (temp).
# Swap only YFinanceProvider later for a paid/official provider - the API
# contract (GET /api/market-snapshot) never changes.

import time
from abc import ABC, abstractmethod
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET"])

SYMBOLS = {
    "NIFTY": "^NSEI",
    "BANKNIFTY": "^NSEBANK",
    "SENSEX": "^BSESN",
    "FINNIFTY": "NIFTY_FIN_SERVICE.NS",  # yfinance has no official ^FINNIFTY; see note below
    "VIX": "^INDIAVIX",
}

_cache = {"data": None, "at": 0}
CACHE_TTL = 15  # seconds - avoid hammering yfinance


class MarketDataProvider(ABC):
    @abstractmethod
    def get_indices(self):
        ...


class YFinanceProvider(MarketDataProvider):
    def get_indices(self):
        out = {}
        for key, sym in SYMBOLS.items():
            try:
                t = yf.Ticker(sym)
                info = t.fast_info
                price = getattr(info, "last_price", None)
                prev = getattr(info, "previous_close", None)
                if price is None:
                    out[key] = {"status": "unavailable", "price": None, "message": "Market data unavailable right now"}
                    continue
                change = (price - prev) if (prev is not None) else None
                change_pct = (change / prev * 100) if (change is not None and prev) else None
                out[key] = {
                    "price": price,
                    "previousClose": prev,
                    "change": change,
                    "changePercent": change_pct,
                    "status": "ok",
                }
            except Exception:
                out[key] = {"status": "unavailable", "price": None, "message": "Market data unavailable right now"}
        return out


provider: MarketDataProvider = YFinanceProvider()


@app.get("/api/market-snapshot")
def market_snapshot():
    now = time.time()
    if _cache["data"] and (now - _cache["at"]) < CACHE_TTL:
        return _cache["data"]
    indices = provider.get_indices()
    ok = any(v.get("status") == "ok" for v in indices.values())
    resp = {
        "status": "ok" if ok else "unavailable",
        "timestamp": int(now * 1000),
        "marketStatus": None,  # not derivable from yfinance quotes alone
        "indices": indices,
    }
    _cache["data"] = resp
    _cache["at"] = now
    return resp

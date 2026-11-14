import { useState, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { t, useLang } from "../i18n/translations";
import {
  SCALP_SYMS,
  SCALP_TIMEFRAMES,
  RISK_PRESETS,
  calcCPR,
  calcConfluence,
  calcPositionSize,
  generateLiveScannerFeed
} from "../state/scalperModel";

export default function ScalperMode(props){
  var theme = useTheme();
  useLang();

  var setTab = props.setTab || function(){};
  var onBack = props.onBack || function(){ setTab("home"); };

  var c = theme.c;
  var bg = c.bg;
  var card = c.card;
  var card2 = c.card2 || c.card;
  var border = c.border;
  var text1 = c.text1;
  var text2 = c.text2;
  var text3 = c.text3;
  var up = c.up;
  var down = c.down;
  var blue = c.blue;
  var blueSoft = c.blueSoft || "rgba(37,99,235,0.12)";
  var warn = c.warn || "#F59E42";

  var selSymState = useState(SCALP_SYMS[0]);
  var selSym = selSymState[0], setSelSym = selSymState[1];

  var tfState = useState(SCALP_TIMEFRAMES[0].id);
  var selTf = tfState[0], setSelTf = tfState[1];

  var riskState = useState(RISK_PRESETS[1]);
  var capitalRisk = riskState[0], setCapitalRisk = riskState[1];

  var soundState = useState(false);
  var soundOn = soundState[0], setSoundOn = soundState[1];

  var priceState = useState(SCALP_SYMS[0].base);
  var price = priceState[0], setPrice = priceState[1];

  var vwapState = useState(SCALP_SYMS[0].base * 0.9985);
  var vwap = vwapState[0], setVwap = vwapState[1];

  var ema9State = useState(SCALP_SYMS[0].base * 1.0012);
  var ema9 = ema9State[0], setEma9 = ema9State[1];

  var ema21State = useState(SCALP_SYMS[0].base * 0.9978);
  var ema21 = ema21State[0], setEma21 = ema21State[1];

  var rsiState = useState(58);
  var rsi = rsiState[0], setRsi = rsiState[1];

  var volMultState = useState(1.8);
  var volMult = volMultState[0], setVolMult = volMultState[1];

  var scannerFeed = useMemo(function(){
    return generateLiveScannerFeed();
  }, []);

  useEffect(function(){
    var base = selSym.base;
    setPrice(base);
    setVwap(base * 0.9985);
    setEma9(base * 1.0012);
    setEma21(base * 0.9978);
    setRsi(selSym.change >= 0 ? 58 : 42);
    setVolMult(selSym.change >= 0 ? 1.8 : 1.2);
  }, [selSym]);

  var cpr = useMemo(function(){
    var high = selSym.base * 1.006;
    var low = selSym.base * 0.994;
    return calcCPR(high, low, selSym.base);
  }, [selSym]);

  var conf = useMemo(function(){
    return calcConfluence({
      price: price,
      vwap: vwap,
      ema9: ema9,
      ema21: ema21,
      rsi: rsi,
      cpr: cpr,
      volumeMult: volMult
    });
  }, [price, vwap, ema9, ema21, rsi, cpr, volMult]);

  var posSize = useMemo(function(){
    return calcPositionSize(capitalRisk, conf.entry, conf.sl, selSym.lot);
  }, [capitalRisk, conf.entry, conf.sl, selSym.lot]);

  var sigColor = conf.signal == "STRONG_BUY" || conf.signal == "BUY" ? up : (conf.signal == "STRONG_SELL" || conf.signal == "SELL" ? down : blue);
  var sigBg = conf.signal == "STRONG_BUY" || conf.signal == "BUY" ? (c.bullSoft || "rgba(31,174,91,0.12)") : (conf.signal == "STRONG_SELL" || conf.signal == "SELL" ? (c.bearSoft || "rgba(242,107,107,0.12)") : blueSoft);

  var handleSelectScanner = useCallback(function(item){
    var matched = SCALP_SYMS.find(function(s){ return s.sym == item.sym; });
    if(matched){
      setSelSym(matched);
      if(item.tf) setSelTf(item.tf);
    }
  }, []);

  var toggleSound = useCallback(function(){
    setSoundOn(function(prev){ return !prev; });
  }, []);

  return (
    <div style={{ background:bg, minHeight:"100vh", fontFamily:"Inter,Arial,sans-serif", paddingBottom:48, color:text1 }}>

      {/* Top Header Bar */}
      <div style={{ background:card, borderBottom:"1px solid " + border, padding:"12px 16px", position:"sticky", top:0, zIndex:30 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button
              onClick={onBack}
              style={{
                background:"transparent",
                border:"1px solid " + border,
                borderRadius:8,
                padding:"6px 10px",
                color:text2,
                cursor:"pointer",
                fontSize:12,
                fontWeight:700
              }}
            >
              {"\u2190 " + (t("common.back") || "Back")}
            </button>
            <div>
              <div style={{ fontSize:17, fontWeight:900, color:text1, letterSpacing:0.2 }}>
                {"Scalper "}
                <span style={{ color:blue }}>{"Mode"}</span>
              </div>
              <div style={{ fontSize:10, color:text3, fontWeight:600 }}>
                {t("scalper.sub") || "Intraday rapid scalping intelligence & confluence signals"}
              </div>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button
              onClick={toggleSound}
              style={{
                background:soundOn ? blueSoft : card2,
                border:"1px solid " + (soundOn ? blue : border),
                borderRadius:8,
                padding:"6px 10px",
                color:soundOn ? blue : text3,
                fontSize:11,
                fontWeight:700,
                cursor:"pointer"
              }}
              title="Toggle Scalper Audio Alert"
            >
              {soundOn ? "\uD83D\uDD0A Audio ON" : "\uD83D\uDD07 Muted"}
            </button>
            <span style={{
              fontSize:10,
              fontWeight:800,
              padding:"4px 8px",
              borderRadius:6,
              background:blueSoft,
              color:blue,
              border:"1px solid " + border,
              letterSpacing:0.5
            }}>
              {"INTRADAY"}
            </span>
          </div>
        </div>

        {/* Timeframe selector bar */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:8 }}>
          <span style={{ fontSize:11, fontWeight:700, color:text3, marginRight:4 }}>
            {t("scalper.timeframe") || "Timeframe"}:
          </span>
          {SCALP_TIMEFRAMES.map(function(tf){
            var isAct = selTf == tf.id;
            return (
              <button
                key={tf.id}
                onClick={function(){ setSelTf(tf.id); }}
                style={{
                  background:isAct ? blue : card2,
                  color:isAct ? "#FFFFFF" : text2,
                  border:"1px solid " + (isAct ? blue : border),
                  borderRadius:6,
                  padding:"4px 10px",
                  fontSize:11,
                  fontWeight:isAct ? 800 : 600,
                  cursor:"pointer",
                  fontFamily:"inherit"
                }}
              >
                {tf.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding:"12px 16px", maxWidth:1100, margin:"0 auto" }}>

        {/* Instrument Selector Pill Ticker */}
        <div style={{
          display:"flex",
          gap:8,
          overflowX:"auto",
          paddingBottom:8,
          marginBottom:12,
          WebkitOverflowScrolling:"touch"
        }}>
          {SCALP_SYMS.map(function(s){
            var isAct = selSym.sym == s.sym;
            var isPositive = s.change >= 0;
            return (
              <button
                key={s.sym}
                onClick={function(){ setSelSym(s); }}
                style={{
                  background:isAct ? (c.blueSoft || "rgba(37,99,235,0.12)") : card,
                  border:"1px solid " + (isAct ? blue : border),
                  borderRadius:10,
                  padding:"8px 12px",
                  cursor:"pointer",
                  flexShrink:0,
                  textAlign:"left",
                  display:"flex",
                  flexDirection:"column",
                  gap:2
                }}
              >
                <div style={{ fontSize:12, fontWeight:isAct ? 800 : 700, color:isAct ? blue : text1 }}>
                  {s.sym}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11 }}>
                  <span style={{ fontFamily:"monospace", fontWeight:700, color:text2 }}>
                    {"Rs " + s.base.toLocaleString("en-IN")}
                  </span>
                  <span style={{
                    fontSize:10,
                    fontWeight:700,
                    color:isPositive ? up : down,
                    background:isPositive ? (c.bullSoft || "rgba(31,174,91,0.10)") : (c.bearSoft || "rgba(242,107,107,0.10)"),
                    padding:"1px 5px",
                    borderRadius:4
                  }}>
                    {(isPositive ? "+" : "") + s.change + "%"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Primary Signal Hero Card */}
        <div style={{
          background:card,
          border:"2px solid " + sigColor,
          borderRadius:16,
          padding:"16px",
          marginBottom:16,
          position:"relative",
          overflow:"hidden"
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:text3, letterSpacing:0.8, textTransform:"uppercase" }}>
                {t("scalper.signal") || "SCALPING SIGNAL"} {" \u2022 " + selSym.sym + " (" + selTf + ")"}
              </div>
              <div style={{ fontSize:26, fontWeight:900, color:sigColor, marginTop:2, letterSpacing:0.5 }}>
                {conf.signal.replace("_", " ")}
              </div>
              <div style={{ fontSize:12, fontWeight:600, color:text2, marginTop:2 }}>
                {conf.setupName}
              </div>
            </div>

            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10, color:text3, fontWeight:700 }}>
                {t("scalper.confluence") || "CONFLUENCE"}
              </div>
              <div style={{ fontSize:20, fontWeight:900, color:sigColor, fontFamily:"monospace" }}>
                {conf.confidence + "%"}
              </div>
              <div style={{ fontSize:10, fontWeight:700, color:text3 }}>
                {(conf.bullCount + conf.bearCount) + "/4 Confirmations"}
              </div>
            </div>
          </div>

          {/* Execution Targets Grid */}
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit, minmax(100px, 1fr))",
            gap:8,
            marginTop:12,
            paddingTop:12,
            borderTop:"1px solid " + border
          }}>
            <div style={{ background:card2, borderRadius:8, padding:"8px 10px", border:"1px solid " + border }}>
              <div style={{ fontSize:10, color:text3, fontWeight:700 }}>{t("scalper.entry") || "ENTRY"}</div>
              <div style={{ fontSize:13, fontWeight:800, color:text1, fontFamily:"monospace", marginTop:2 }}>
                {"Rs " + conf.entry.toLocaleString("en-IN")}
              </div>
            </div>

            <div style={{ background:card2, borderRadius:8, padding:"8px 10px", border:"1px solid " + border }}>
              <div style={{ fontSize:10, color:text3, fontWeight:700 }}>{t("scalper.target1") || "TARGET 1"}</div>
              <div style={{ fontSize:13, fontWeight:800, color:up, fontFamily:"monospace", marginTop:2 }}>
                {"Rs " + conf.target1.toLocaleString("en-IN")}
              </div>
            </div>

            <div style={{ background:card2, borderRadius:8, padding:"8px 10px", border:"1px solid " + border }}>
              <div style={{ fontSize:10, color:text3, fontWeight:700 }}>{t("scalper.target2") || "TARGET 2"}</div>
              <div style={{ fontSize:13, fontWeight:800, color:up, fontFamily:"monospace", marginTop:2 }}>
                {"Rs " + conf.target2.toLocaleString("en-IN")}
              </div>
            </div>

            <div style={{ background:card2, borderRadius:8, padding:"8px 10px", border:"1px solid " + border }}>
              <div style={{ fontSize:10, color:text3, fontWeight:700 }}>{t("scalper.stop_loss") || "STOP LOSS"}</div>
              <div style={{ fontSize:13, fontWeight:800, color:down, fontFamily:"monospace", marginTop:2 }}>
                {"Rs " + conf.sl.toLocaleString("en-IN")}
              </div>
            </div>

            <div style={{ background:card2, borderRadius:8, padding:"8px 10px", border:"1px solid " + border }}>
              <div style={{ fontSize:10, color:text3, fontWeight:700 }}>{t("scalper.rr_ratio") || "R : R"}</div>
              <div style={{ fontSize:13, fontWeight:800, color:blue, fontFamily:"monospace", marginTop:2 }}>
                {conf.rrRatio}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Pillar Confluence Checklist Grid */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:800, color:text1, marginBottom:8 }}>
            {t("scalper.pillars") || "4-Pillar Confluence Checklist"}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:10 }}>

            {/* Pillar 1: Trend (EMA 9/21) */}
            <div style={{ background:card, border:"1px solid " + border, borderRadius:12, padding:"12px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <span style={{ fontSize:11, fontWeight:700, color:text3 }}>PILLAR 1: TREND</span>
                <span style={{
                  fontSize:10,
                  fontWeight:800,
                  color:conf.pillars.trend.status == "BULL" ? up : (conf.pillars.trend.status == "BEAR" ? down : text3),
                  background:conf.pillars.trend.status == "BULL" ? (c.bullSoft || "rgba(31,174,91,0.12)") : (conf.pillars.trend.status == "BEAR" ? (c.bearSoft || "rgba(242,107,107,0.12)") : card2),
                  padding:"2px 6px",
                  borderRadius:4
                }}>
                  {conf.pillars.trend.status}
                </span>
              </div>
              <div style={{ fontSize:13, fontWeight:800, color:text1, marginBottom:4 }}>
                {"EMA 9 : Rs " + ema9.toFixed(1) + " / EMA 21 : Rs " + ema21.toFixed(1)}
              </div>
              <div style={{ fontSize:11, color:text2 }}>
                {conf.pillars.trend.detail}
              </div>
            </div>

            {/* Pillar 2: Institutional (VWAP) */}
            <div style={{ background:card, border:"1px solid " + border, borderRadius:12, padding:"12px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <span style={{ fontSize:11, fontWeight:700, color:text3 }}>PILLAR 2: INSTITUTIONAL BIAS</span>
                <span style={{
                  fontSize:10,
                  fontWeight:800,
                  color:conf.pillars.vwap.status == "BULL" ? up : (conf.pillars.vwap.status == "BEAR" ? down : text3),
                  background:conf.pillars.vwap.status == "BULL" ? (c.bullSoft || "rgba(31,174,91,0.12)") : (conf.pillars.vwap.status == "BEAR" ? (c.bearSoft || "rgba(242,107,107,0.12)") : card2),
                  padding:"2px 6px",
                  borderRadius:4
                }}>
                  {conf.pillars.vwap.status}
                </span>
              </div>
              <div style={{ fontSize:13, fontWeight:800, color:text1, marginBottom:4 }}>
                {"VWAP Level : Rs " + vwap.toFixed(1)}
              </div>
              <div style={{ fontSize:11, color:text2 }}>
                {conf.pillars.vwap.detail}
              </div>
            </div>

            {/* Pillar 3: CPR Levels */}
            <div style={{ background:card, border:"1px solid " + border, borderRadius:12, padding:"12px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <span style={{ fontSize:11, fontWeight:700, color:text3 }}>PILLAR 3: CPR PIVOTS</span>
                <span style={{
                  fontSize:10,
                  fontWeight:800,
                  color:blue,
                  background:blueSoft,
                  padding:"2px 6px",
                  borderRadius:4
                }}>
                  {cpr.widthType + " CPR"}
                </span>
              </div>
              <div style={{ display:"flex", gap:6, fontSize:11, fontWeight:700, marginBottom:4 }}>
                <span style={{ color:down }}>{"TC: " + cpr.tc.toFixed(0)}</span>
                <span style={{ color:text3 }}>{"\u2022"}</span>
                <span style={{ color:blue }}>{"P: " + cpr.pivot.toFixed(0)}</span>
                <span style={{ color:text3 }}>{"\u2022"}</span>
                <span style={{ color:up }}>{"BC: " + cpr.bc.toFixed(0)}</span>
              </div>
              <div style={{ fontSize:11, color:text2 }}>
                {conf.pillars.cpr.detail}
              </div>
            </div>

            {/* Pillar 4: Momentum & Volume */}
            <div style={{ background:card, border:"1px solid " + border, borderRadius:12, padding:"12px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <span style={{ fontSize:11, fontWeight:700, color:text3 }}>PILLAR 4: MOMENTUM & VOL</span>
                <span style={{
                  fontSize:10,
                  fontWeight:800,
                  color:conf.pillars.momentum.status == "BULL" ? up : (conf.pillars.momentum.status == "BEAR" ? down : text3),
                  background:conf.pillars.momentum.status == "BULL" ? (c.bullSoft || "rgba(31,174,91,0.12)") : (conf.pillars.momentum.status == "BEAR" ? (c.bearSoft || "rgba(242,107,107,0.12)") : card2),
                  padding:"2px 6px",
                  borderRadius:4
                }}>
                  {conf.pillars.momentum.status}
                </span>
              </div>
              <div style={{ fontSize:13, fontWeight:800, color:text1, marginBottom:4 }}>
                {"RSI (14) : " + rsi + " \u2022 Vol : " + volMult + "x avg"}
              </div>
              <div style={{ fontSize:11, color:text2 }}>
                {conf.pillars.momentum.detail}
              </div>
            </div>

          </div>
        </div>

        {/* Scalp Position & Risk Calculator */}
        <div style={{ background:card, border:"1px solid " + border, borderRadius:16, padding:"16px", marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:text1 }}>
                {t("scalper.risk_sizer") || "Scalp Position & Risk Calculator"}
              </div>
              <div style={{ fontSize:11, color:text3 }}>
                {"Calculate safe trade size for " + selSym.sym + " (Lot Size: " + selSym.lot + ")"}
              </div>
            </div>

            <div style={{ display:"flex", gap:4 }}>
              {RISK_PRESETS.map(function(r){
                var isAct = capitalRisk == r;
                return (
                  <button
                    key={r}
                    onClick={function(){ setCapitalRisk(r); }}
                    style={{
                      background:isAct ? blue : card2,
                      color:isAct ? "#FFFFFF" : text2,
                      border:"1px solid " + (isAct ? blue : border),
                      borderRadius:6,
                      padding:"4px 8px",
                      fontSize:10,
                      fontWeight:isAct ? 800 : 600,
                      cursor:"pointer"
                    }}
                  >
                    {"Rs " + r}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(130px, 1fr))", gap:8, paddingTop:6 }}>
            <div style={{ background:card2, borderRadius:8, padding:"8px 10px", border:"1px solid " + border }}>
              <div style={{ fontSize:10, color:text3, fontWeight:700 }}>RECOMMENDED SIZE</div>
              <div style={{ fontSize:14, fontWeight:900, color:blue, marginTop:2 }}>
                {selSym.lot > 1 ? (posSize.lots + " Lots (" + posSize.qty + " Qty)") : (posSize.qty + " Shares")}
              </div>
            </div>

            <div style={{ background:card2, borderRadius:8, padding:"8px 10px", border:"1px solid " + border }}>
              <div style={{ fontSize:10, color:text3, fontWeight:700 }}>RISK PER SHARE / PT</div>
              <div style={{ fontSize:14, fontWeight:900, color:text1, marginTop:2, fontFamily:"monospace" }}>
                {"Rs " + posSize.riskPerUnit}
              </div>
            </div>

            <div style={{ background:card2, borderRadius:8, padding:"8px 10px", border:"1px solid " + border }}>
              <div style={{ fontSize:10, color:text3, fontWeight:700 }}>MAX DRAWDOWN (SL)</div>
              <div style={{ fontSize:14, fontWeight:900, color:down, marginTop:2, fontFamily:"monospace" }}>
                {"-Rs " + posSize.actualRisk.toLocaleString("en-IN")}
              </div>
            </div>

            <div style={{ background:card2, borderRadius:8, padding:"8px 10px", border:"1px solid " + border }}>
              <div style={{ fontSize:10, color:text3, fontWeight:700 }}>TARGET REWARD (1.5x)</div>
              <div style={{ fontSize:14, fontWeight:900, color:up, marginTop:2, fontFamily:"monospace" }}>
                {"+Rs " + posSize.targetReward.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>

        {/* Live Scalper Scanner Radar Table */}
        <div style={{ background:card, border:"1px solid " + border, borderRadius:16, padding:"16px", marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:text1 }}>
                {t("scalper.scanner_title") || "Active Scalp Signals Scanner"}
              </div>
              <div style={{ fontSize:11, color:text3 }}>
                {"Real-time multi-instrument scalping alerts across tracked universe"}
              </div>
            </div>
            <span style={{ fontSize:10, fontWeight:700, color:blue, background:blueSoft, padding:"3px 8px", borderRadius:6 }}>
              {"AUTO-REFRESH 60s"}
            </span>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {scannerFeed.map(function(item, idx){
              var isBuy = item.signal.indexOf("BUY") >= 0;
              var isWait = item.signal == "WAIT";
              var itemColor = isBuy ? up : (isWait ? text3 : down);
              var isSelected = selSym.sym == item.sym;

              return (
                <div
                  key={item.sym + idx}
                  onClick={function(){ handleSelectScanner(item); }}
                  style={{
                    background:isSelected ? (c.blueSoft || "rgba(37,99,235,0.08)") : card2,
                    border:"1px solid " + (isSelected ? blue : border),
                    borderRadius:10,
                    padding:"10px 12px",
                    display:"flex",
                    justifyContent:"space-between",
                    alignItems:"center",
                    cursor:"pointer",
                    transition:"all 0.15s ease"
                  }}
                >
                  <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:12, fontWeight:800, color:text1 }}>{item.sym}</span>
                      <span style={{ fontSize:10, fontWeight:700, color:blue, background:card, padding:"1px 5px", borderRadius:4, border:"1px solid " + border }}>
                        {item.tf}
                      </span>
                      <span style={{ fontSize:10, color:text3 }}>{item.time}</span>
                    </div>
                    <div style={{ fontSize:11, color:text2 }}>{item.setup}</div>
                  </div>

                  <div style={{ textAlign:"right", display:"flex", alignItems:"center", gap:12 }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:900, color:itemColor }}>
                        {item.signal.replace("_", " ")}
                      </div>
                      <div style={{ fontSize:11, fontFamily:"monospace", fontWeight:700, color:text1 }}>
                        {"Rs " + item.price.toLocaleString("en-IN")}
                      </div>
                    </div>

                    <button
                      onClick={function(e){
                        e.stopPropagation();
                        handleSelectScanner(item);
                      }}
                      style={{
                        background:blue,
                        color:"#FFFFFF",
                        border:"none",
                        borderRadius:6,
                        padding:"5px 10px",
                        fontSize:10,
                        fontWeight:700,
                        cursor:"pointer"
                      }}
                    >
                      {"Inspect"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scalper Discipline Notice */}
        <div style={{
          background:card2,
          border:"1px solid " + border,
          borderRadius:12,
          padding:"12px 14px",
          display:"flex",
          alignItems:"center",
          gap:10
        }}>
          <span style={{ fontSize:16 }}>{"\u26A0\uFE0F"}</span>
          <div style={{ fontSize:11, color:text2, lineHeight:1.5 }}>
            <span style={{ fontWeight:800, color:warn }}>{"Scalper Discipline: "}</span>
            {t("scalper.disclaimer") || "Strict stop-loss adherence is mandatory. Never average a losing scalping position. Maximum 3 high-probability setups per trading session."}
          </div>
        </div>

      </div>
    </div>
  );
}

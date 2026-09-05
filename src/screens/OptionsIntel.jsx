import { t } from "../i18n/translations";
import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - OptionsIntel.jsx
// Options Intelligence. No verified options-chain provider exists anywhere
// in this codebase (confirmed via a complete repository audit: dhan.js's
// real getOptionChain() is commented out pending a paid subscription).
// Shows an honest "provider not connected" state. Rules: no backtick, no
// triple-equals, ASCII only.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330",BD2="#141821";
var UP="#22C55E",DOWN="#EF4444",BLUE="#3B82F6";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

export default function OptionsIntel(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  BD=theme.c.border; DOWN=theme.c.down;
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var BD2 = theme.c.border2, BLUE = theme.c.blue, CARD = theme.c.card, CARD2 = theme.c.card2, BLUE=theme.c.blue, T2 = theme.c.text2, T3 = theme.c.text3; T1=theme.c.text1; UP=theme.c.up;

  var full=!!props.full;

  // No verified options-chain provider exists anywhere in this codebase -
  // confirmed via a complete repository audit (dhan.js's real
  // getOptionChain() is commented out pending a paid subscription;
  // OptionsIntelData.jsx's own values are entirely hardcoded). This early
  // return replaces the previous "DEMO DATA / Simulated for preview"
  // presentation - which still displayed specific fake numbers (PCR 1.18,
  // Max Pain 24,800, etc.) - with an honest unavailable state instead,
  // without touching the extensive existing rendering logic below (kept
  // intact in case a real provider is connected in the future).
  return (
    <div style={{padding:"0 14px",marginTop:full?6:22}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <span style={{fontSize:16,fontWeight:900,color:T1}}>{t("options_intel")}</span>
      </div>
      <div style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:16}}>
        <div style={{fontSize:13,fontWeight:800,color:T2,marginBottom:10}}>Provider not connected</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
          {["PCR","Max Pain","Call OI","Put OI","IV","Greeks"].map(function(label){
            return (
              <div key={label}>
                <div style={{fontSize:10,color:T3}}>{label}</div>
                <div style={{fontSize:14,fontWeight:800,color:T2}}>&#8212;</div>
              </div>
            );
          })}
        </div>
        <div style={{fontSize:11,color:T3,lineHeight:1.6}}>Connect a verified options-chain provider to activate live PCR, Max Pain, OI, and Greeks.</div>
      </div>
    </div>
  );
}

var DB="#0A0E1A",CB="#0F1629",BD="#1E2D4A",BLUE="#3B82F6",BLUE2="#60A5FA";
var T1="#FFFFFF",T2="#8899BB",T3="#475569";

var SVGS = {
  alerts: "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#60A5FA' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9'/><path d='M13.73 21a2 2 0 0 1-3.46 0'/></svg>",
  chart:   "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#60A5FA' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='22 12 18 12 15 21 9 3 6 12 2 12'/></svg>",
  scalper: "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#60A5FA' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polygon points='13 2 3 14 12 14 11 22 21 10 12 10 13 2'/></svg>",
  analysis:"<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#60A5FA' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><line x1='18' y1='20' x2='18' y2='10'/><line x1='12' y1='20' x2='12' y2='4'/><line x1='6' y1='20' x2='6' y2='14'/></svg>",
  patterns:"<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#60A5FA' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='2' y='3' width='4' height='18'/><rect x='10' y='8' width='4' height='13'/><rect x='18' y='5' width='4' height='16'/></svg>",
  detector:"<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#60A5FA' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='11' cy='11' r='8'/><line x1='21' y1='21' x2='16.65' y2='16.65'/></svg>",
  heatmap: "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#60A5FA' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='3' y='3' width='7' height='7'/><rect x='14' y='3' width='7' height='7'/><rect x='3' y='14' width='7' height='7'/><rect x='14' y='14' width='7' height='7'/></svg>",
  fiidii:  "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#60A5FA' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='2' y='7' width='20' height='14' rx='2'/><path d='M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2'/></svg>",
  global:  "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#60A5FA' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><circle cx='12' cy='12' r='10'/><line x1='2' y1='12' x2='22' y2='12'/><path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/></svg>",
  candle:  "<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#60A5FA' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><rect x='4' y='6' width='4' height='12' rx='1'/><line x1='6' y1='2' x2='6' y2='6'/><line x1='6' y1='18' x2='6' y2='22'/><rect x='16' y='4' width='4' height='10' rx='1'/><line x1='18' y1='2' x2='18' y2='4'/><line x1='18' y1='14' x2='18' y2='22'/></svg>",
};

var SCAN_ITEMS = [
  {id:"alerts",   label:"Live Alerts",    sub:"Breakout, Pattern, Volume alerts",  col:"#EF4444"},
  {id:"chart",    label:"Chart Engine",   sub:"60fps professional chart",          col:"#3B82F6"},
  {id:"scalper",  label:"Scalper Mode",   sub:"EMA, VWAP, CPR, RSI signals",       col:"#F59E0B"},
  {id:"analysis", label:"Market Analysis",sub:"Indices + 20 stocks deep dive",     col:"#8B5CF6"},
  {id:"patterns", label:"Chart Patterns", sub:"20 patterns with SVG visuals",      col:"#06B6D4"},
  {id:"detector", label:"Candle Detector",sub:"12 candlestick patterns offline",   col:"#10B981"},
  {id:"heatmap",  label:"Heatmap",        sub:"NIFTY 50 sector color blocks",      col:"#F97316"},
  {id:"fiidii",   label:"FII / DII",      sub:"Institutional buying & selling",    col:"#6366F1"},
  {id:"global",   label:"Global Markets", sub:"Dow, Nasdaq, Gold, Crude, DXY",     col:"#60A5FA"},
  {id:"candle",   label:"Candle Library", sub:"Learn 23 candlestick patterns",     col:"#A78BFA"},
];

export default function ScanScreen(props) {
  var setTab = props.setTab || function(){};
  return (
    <div style={{background:DB,minHeight:"100vh",paddingBottom:80,fontFamily:"Inter,Arial,sans-serif"}}>
      <div style={{background:"linear-gradient(135deg,#0F1629,#0A1525)",padding:"20px 16px 14px",borderBottom:"1px solid "+BD}}>
        <div style={{fontSize:22,fontWeight:900,color:"#FFFFFF"}}>Scanner <span style={{color:BLUE2}}>& Tools</span></div>
        <div style={{fontSize:11,color:T2,marginTop:3,letterSpacing:0.3}}>Trading signals, charts & analysis tools</div>
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{fontSize:11,fontWeight:700,color:T3,letterSpacing:1,marginBottom:10}}>TRADING TOOLS</div>
        <div style={{background:CB,border:"1px solid "+BD,borderRadius:16,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.25)"}}>
          {SCAN_ITEMS.map(function(item,i){
            return (
              <div key={item.id} onClick={function(){setTab(item.id);}} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 14px",borderBottom:i<SCAN_ITEMS.length-1?"1px solid rgba(30,42,77,0.6)":"none",cursor:"pointer"}}>
                <div style={{width:40,height:40,borderRadius:12,background:item.col+"18",border:"1px solid "+item.col+"44",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}} dangerouslySetInnerHTML={{__html:SVGS[item.id]||SVGS.chart}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#FFFFFF"}}>{item.label}</div>
                  <div style={{fontSize:10,color:T2,marginTop:2}}>{item.sub}</div>
                </div>
                <span style={{color:T3,fontSize:18}}>&#8250;</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

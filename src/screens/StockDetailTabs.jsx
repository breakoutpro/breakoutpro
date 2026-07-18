import { useTheme } from "../theme/ThemeProvider";
// BreakoutPro - StockDetailTabs.jsx
// Overview + Financials tab content. Pure black, green/red only for direction.
// Rules: no backtick, no triple-equals, ASCII only.

var CARD="#101318",CARD2="#0B0E13",BD="#1B2330";
var UP="#22C55E",DOWN="#EF4444",CYAN="#60A5FA",GOLD="#D4AF37";
var T1="#FFFFFF",T2="#A0A7B4",T3="#5B6472";

function Sec(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var T2 = theme.c.text2;

  return (
    <div style={{marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:800,color:T2,letterSpacing:0.6,marginBottom:9}}>{props.title}</div>
      {props.children}
    </div>
  );
}
function Card(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card;

  return <div style={{background:CARD,border:"1px solid "+BD,borderRadius:12,padding:props.p||13,marginBottom:props.mb||0}}>{props.children}</div>;
}

export function OverviewTab(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, T2 = theme.c.text2, T3 = theme.c.text3;

  var d=props.d;
  return (
    <div>
      <Sec title="WHAT DOES THE COMPANY DO">
        <Card><div style={{fontSize:12,color:T1,lineHeight:1.6}}>{d.about}</div></Card>
      </Sec>

      <Sec title="PRODUCTS AND SERVICES">
        <Card>
          {d.products.map(function(p,i){
            return <div key={i} style={{fontSize:11.5,color:T1,padding:"4px 0",borderBottom:i<d.products.length-1?"1px solid "+BD:"none"}}>&#8226;  {p}</div>;
          })}
        </Card>
      </Sec>

      <Sec title="KEY COMPETITORS">
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {d.competitors.map(function(c,i){
            return <span key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:8,padding:"6px 11px",fontSize:11,color:T1,fontWeight:600}}>{c}</span>;
          })}
        </div>
      </Sec>

      <Sec title="FUTURE GROWTH DRIVERS">
        <Card>
          {d.growth.map(function(g,i){
            return <div key={i} style={{fontSize:11.5,color:T1,padding:"4px 0",borderBottom:i<d.growth.length-1?"1px solid "+BD:"none"}}>&#8226;  {g}</div>;
          })}
        </Card>
      </Sec>

      <Sec title="LISTING HISTORY">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <Card><div style={{fontSize:9,color:T2}}>IPO Year</div><div style={{fontSize:14,fontWeight:800,color:T1,marginTop:3}}>{d.ipo.date}</div></Card>
          <Card><div style={{fontSize:9,color:T2}}>IPO Price</div><div style={{fontSize:14,fontWeight:800,color:T1,marginTop:3}}>{d.ipo.price?("Rs "+d.ipo.price):"N/A"}</div></Card>
        </div>
      </Sec>

      <Sec title="ALL TIME HIGH / LOW">
        <Card mb={8}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:9,color:T2}}>All Time High</div><div style={{fontSize:16,fontWeight:800,color:UP,fontFamily:"monospace"}}>Rs {d.ath.val.toLocaleString("en-IN")}</div></div>
            <div style={{fontSize:9,color:T3,textAlign:"right",maxWidth:130}}>{d.ath.date}<br/>{d.ath.why}</div>
          </div>
        </Card>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:9,color:T2}}>All Time Low</div><div style={{fontSize:16,fontWeight:800,color:DOWN,fontFamily:"monospace"}}>Rs {d.atl.val.toLocaleString("en-IN")}</div></div>
            <div style={{fontSize:9,color:T3,textAlign:"right",maxWidth:130}}>{d.atl.date}<br/>{d.atl.why}</div>
          </div>
        </Card>
      </Sec>

      <Sec title="PAST CRASHES AND RECOVERY">
        <Card>
          {d.crashes.map(function(c,i){
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<d.crashes.length-1?"1px solid "+BD:"none"}}>
                <div style={{fontSize:11,color:T1,fontWeight:600}}>{c.event}</div>
                <div style={{textAlign:"right"}}>
                  <span style={{fontSize:11,fontWeight:700,color:DOWN}}>{c.fall}</span>
                  <span style={{fontSize:9,color:T3,marginLeft:8}}>Rec: {c.recovery}</span>
                </div>
              </div>
            );
          })}
        </Card>
      </Sec>

      <Sec title="RETURN CALCULATOR  (if bought earlier)">
        <Card>
          {d.returns.map(function(r,i){
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<d.returns.length-1?"1px solid "+BD:"none"}}>
                <span style={{fontSize:11.5,color:T2}}>{r.period} ago</span>
                <span style={{fontSize:12,fontWeight:800,color:r.up?UP:DOWN,fontFamily:"monospace"}}>{r.val}</span>
              </div>
            );
          })}
        </Card>
      </Sec>
    </div>
  );
}

export function FinancialsTab(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system
  // Theme-sourced overrides - shadow the module-level hardcoded fallbacks above.
  var CARD = theme.c.card, T2 = theme.c.text2, T3 = theme.c.text3;

  var d=props.d;
  return (
    <div>
      <Sec title="KEY FUNDAMENTALS">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {d.fundamentals.map(function(f,i){
            return (
              <div key={i} style={{background:CARD,border:"1px solid "+BD,borderRadius:10,padding:"10px 11px"}}>
                <div style={{fontSize:9,color:T2}}>{f.label}</div>
                <div style={{fontSize:13,fontWeight:800,color:T1,marginTop:3}}>{f.val}</div>
              </div>
            );
          })}
        </div>
      </Sec>

      <Sec title="SHAREHOLDING PATTERN">
        <Card>
          {d.shareholding.map(function(s,i){
            return (
              <div key={i} style={{marginBottom:i<d.shareholding.length-1?10:0}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:11,color:T1,fontWeight:600}}>{s.label}</span>
                  <span style={{fontSize:11,color:T1,fontWeight:800}}>{s.val}%</span>
                </div>
                <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3}}>
                  <div style={{height:5,width:s.val+"%",background:CYAN,borderRadius:3,opacity:0.7}}></div>
                </div>
              </div>
            );
          })}
        </Card>
      </Sec>

      <Sec title="QUARTERLY RESULTS">
        <Card>
          <div style={{display:"flex",fontSize:8.5,color:T3,fontWeight:700,paddingBottom:6,borderBottom:"1px solid "+BD}}>
            <span style={{flex:1}}>QUARTER</span><span style={{width:60,textAlign:"right"}}>REVENUE</span><span style={{width:54,textAlign:"right"}}>PAT</span><span style={{width:44,textAlign:"right"}}>YoY</span>
          </div>
          {d.results.map(function(r,i){
            return (
              <div key={i} style={{display:"flex",fontSize:10.5,padding:"8px 0",borderBottom:i<d.results.length-1?"1px solid "+BD:"none",alignItems:"center"}}>
                <span style={{flex:1,color:T1,fontWeight:600}}>{r.q}</span>
                <span style={{width:60,textAlign:"right",color:T2,fontFamily:"monospace"}}>{r.rev}</span>
                <span style={{width:54,textAlign:"right",color:T1,fontFamily:"monospace",fontWeight:700}}>{r.pat}</span>
                <span style={{width:44,textAlign:"right",color:r.up?UP:DOWN,fontWeight:700}}>{r.yoy}</span>
              </div>
            );
          })}
        </Card>
      </Sec>

      <Sec title="NEWS REACTION HISTORY">
        <Card>
          {d.newsReaction.map(function(n,i){
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<d.newsReaction.length-1?"1px solid "+BD:"none"}}>
                <span style={{fontSize:11,color:T1}}>{n.event}</span>
                <span style={{fontSize:12,fontWeight:800,color:n.up?UP:DOWN}}>{n.reaction}</span>
              </div>
            );
          })}
        </Card>
      </Sec>
    </div>
  );
}

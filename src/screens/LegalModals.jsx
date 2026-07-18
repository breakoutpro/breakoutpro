import { CB, BD, T1, T2 } from "./settingsTheme";

import { useTheme } from "../theme/ThemeProvider";
var PRIVACY_TEXT = "Breakout Pro respects your privacy. We collect minimal data necessary to provide our services: your name and phone number for account creation, and app usage data to improve our educational content. We do not sell your personal data to third parties. Market data displayed is sourced from public APIs and may be delayed. Your watchlist and preferences are stored locally on your device. For questions about data handling, contact support through the app. By using Breakout Pro, you agree to this privacy approach.";

var SEBI_TEXT = "Breakout Pro is an educational platform only. We are NOT a SEBI registered investment advisor, research analyst, or portfolio manager. Nothing on this app constitutes buy or sell recommendations, investment advice, or a solicitation to trade. All AI-generated summaries, alerts, technical analysis, and market commentary are for educational and informational purposes only, generated using algorithmic patterns and publicly available data. Past performance shown is simulated and does not guarantee future results. Trading and investing in securities involves substantial risk of loss. Please consult a SEBI registered investment advisor before making any investment decisions. Breakout Pro and its creators are not liable for any financial losses incurred based on information from this app.";

export default function LegalModals(props){
  var theme = useTheme(); // reuses the existing ThemeProvider - no new theme system

  var showPrivacy = props.showPrivacy;
  var showSebi = props.showSebi;
  var onClosePrivacy = props.onClosePrivacy || function(){};
  var onCloseSebi = props.onCloseSebi || function(){};

  return (
    <div>
      {showPrivacy?(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:2000,display:"flex",alignItems:"flex-end"}} onClick={onClosePrivacy}>
          <div onClick={function(e){e.stopPropagation();}} style={{background:CB,borderTop:"1px solid "+BD,borderRadius:"20px 20px 0 0",width:"100%",maxHeight:"75vh",overflowY:"auto",padding:"16px 18px 30px"}}>
            <div style={{width:36,height:4,background:BD,borderRadius:2,margin:"0 auto 16px"}}></div>
            <div style={{fontSize:14,fontWeight:800,color:T1,marginBottom:12}}>Privacy Policy</div>
            <div style={{fontSize:11,color:T2,lineHeight:1.8}}>{PRIVACY_TEXT}</div>
            <button onClick={onClosePrivacy} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid "+BD,borderRadius:10,padding:"11px",color:T1,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:16}}>Close</button>
          </div>
        </div>
      ):null}

      {showSebi?(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:2000,display:"flex",alignItems:"flex-end"}} onClick={onCloseSebi}>
          <div onClick={function(e){e.stopPropagation();}} style={{background:CB,borderTop:"1px solid rgba(249,115,22,0.3)",borderRadius:"20px 20px 0 0",width:"100%",maxHeight:"75vh",overflowY:"auto",padding:"16px 18px 30px"}}>
            <div style={{width:36,height:4,background:BD,borderRadius:2,margin:"0 auto 16px"}}></div>
            <div style={{fontSize:14,fontWeight:800,color:theme.c.warn,marginBottom:12}}>SEBI Disclaimer</div>
            <div style={{fontSize:11,color:T2,lineHeight:1.8}}>{SEBI_TEXT}</div>
            <button onClick={onCloseSebi} style={{width:"100%",background:"rgba(249,115,22,0.1)",border:"1px solid rgba(249,115,22,0.3)",borderRadius:10,padding:"11px",color:theme.c.warn,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginTop:16}}>I Understand</button>
          </div>
        </div>
      ):null}
    </div>
  );
}

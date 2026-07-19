import { Component } from "react";
import { resolveTheme, loadThemeMode } from "../theme/tokens";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error && error.message ? error.message : "Something went wrong" };
  }

  componentDidCatch(error, info) {
    console.log("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      var c = resolveTheme(loadThemeMode()); // plain function, not a hook - safe in a class component
      var onGoHome = this.props.onGoHome || function(){};
      return (
        <div style={{background:c.bg,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{textAlign:"center",maxWidth:300}}>
            <div style={{fontSize:36,marginBottom:14}}>&#9888;</div>
            <div style={{fontSize:14,fontWeight:800,color:c.text1,marginBottom:8}}>Something went wrong</div>
            <div style={{fontSize:10,color:c.text2,marginBottom:14,lineHeight:1.6}}>This screen ran into an error. You can go back and try again.</div>
            <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:10,padding:"10px 12px",marginBottom:20,textAlign:"left"}}>
              <div style={{fontSize:8,color:c.down,fontWeight:700,marginBottom:4}}>ERROR DETAIL</div>
              <div style={{fontSize:9,color:c.text2,fontFamily:"monospace",wordBreak:"break-word"}}>{this.state.errorMsg}</div>
            </div>
            <button onClick={function(){window.location.reload();}} style={{background:c.blue,border:"none",borderRadius:10,padding:"11px 24px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Reload App</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

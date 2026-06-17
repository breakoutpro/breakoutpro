import { Component } from "react";

var DB = "#0A0E1A";
var CB = "#0F1629";
var BD = "#1E2D4A";
var R = "#EF4444";
var T1 = "#FFFFFF";
var T2 = "#8899BB";

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
      var onGoHome = this.props.onGoHome || function(){};
      return (
        <div style={{background:DB,minHeight:"100vh",fontFamily:"Inter,Arial,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
          <div style={{textAlign:"center",maxWidth:300}}>
            <div style={{fontSize:36,marginBottom:14}}>&#9888;</div>
            <div style={{fontSize:14,fontWeight:800,color:T1,marginBottom:8}}>Something went wrong</div>
            <div style={{fontSize:10,color:T2,marginBottom:20,lineHeight:1.6}}>This screen ran into an error. You can go back and try again.</div>
            <button onClick={function(){window.location.reload();}} style={{background:"linear-gradient(135deg,#3B82F6,#7C3AED)",border:"none",borderRadius:10,padding:"11px 24px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Reload App</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

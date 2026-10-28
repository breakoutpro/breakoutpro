import { useTheme } from "../../theme/ThemeProvider";
import HomeHub from "./HomeHub";

// BreakoutPro - EquityHomeLaptop.jsx
// Home for this tier: the shared HomeHub (hero + six feature cards). The market
// ticker is rendered once by App.jsx for desktop tiers, so nothing is added here
// and this layout starts no data request of its own.
// Rules: no backtick, no triple-equals, ASCII only.
export default function EquityHomeLaptop(props){
  var theme = useTheme();
  var setTab = props.setTab || function(){};
  return (
    <div style={{background:theme.c.bg,width:"100%",boxSizing:"border-box",fontFamily:"'Inter',Arial,sans-serif",color:theme.c.text1,overflowX:"hidden"}}>
      <HomeHub cols={3} size="lg" setTab={setTab}/>
    </div>
  );
}

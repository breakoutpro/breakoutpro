import { useTheme } from "../../theme/ThemeProvider";
import HomeHub from "./HomeHub";

// BreakoutPro - EquityHomeDesktop.jsx
// Home for this tier: the shared HomeHub dashboard (index cards, strips, four feature cards, calculator). The market
// ticker is rendered once by App.jsx for desktop tiers, so nothing is added here
// and this layout starts no data request of its own. The market boxes use the
// shared payload App passes as props.mm (the slim strip is not shown here, so there
// is one set of quotes on screen, not two).
// Rules: no backtick, no triple-equals, ASCII only.
export default function EquityHomeDesktop(props){
  var theme = useTheme();
  var setTab = props.setTab || function(){};
  return (
    <div style={{background:theme.c.bg,width:"100%",boxSizing:"border-box",fontFamily:"'Inter',Arial,sans-serif",color:theme.c.text1,overflowX:"hidden"}}>
      <HomeHub size="lg" mm={props.mm} setTab={setTab} onOpenIndex={props.onOpenIndex} liveNews={props.liveNews}/>
    </div>
  );
}

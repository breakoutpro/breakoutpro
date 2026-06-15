import { useState, useEffect } from "react";
import EquityHome from "./EquityHome";
import CommodityHome from "./CommodityHome";
import GlobalHome from "./GlobalHome";

function getSession() {
  var mins = new Date().getHours()*60 + new Date().getMinutes();
  if (mins >= 9*60+15 && mins < 15*60+30) return "equity";
  if (mins >= 15*60+30 || mins < 2*60) return "commodity";
  return "global";
}

export default function HomeScreen(props) {
  var [session, setSession] = useState(getSession());

  useEffect(function(){
    var t = setInterval(function(){
      var newSess = getSession();
      if (newSess != session) {
        setSession(newSess);
        // Send notification on session change
        if (typeof Notification != "undefined" && Notification.permission == "granted") {
          try {
            if (newSess == "commodity") {
              new Notification("BreakoutPro", {body: "Equity Closed - MCX Commodity Dashboard Activated", icon:"/favicon.ico"});
            } else if (newSess == "global") {
              new Notification("BreakoutPro", {body: "Global Markets Active - Check Tomorrow Setup", icon:"/favicon.ico"});
            } else {
              new Notification("BreakoutPro", {body: "NSE Market Open - AI Equity Dashboard Live", icon:"/favicon.ico"});
            }
          } catch(e) {}
        }
      }
    }, 30000);
    return function(){clearInterval(t);};
  }, [session]);

  if (session == "equity") return <EquityHome {...props}/>;
  if (session == "commodity") return <CommodityHome {...props}/>;
  return <GlobalHome {...props}/>;
}

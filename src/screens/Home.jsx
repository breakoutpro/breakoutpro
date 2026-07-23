import { useState, useEffect } from "react";
import EquityHome from "./EquityHome";
import GlobalHome from "./GlobalHome";
import CommodityHome from "./CommodityHome";

function getSession() {
  var mins = new Date().getHours()*60 + new Date().getMinutes();
  if (mins >= 6*60 && mins < 23*60+30) return "day";
  return "global";
}

function getHomeOverride() {
  try {
    var s = JSON.parse(localStorage.getItem("bp_settings") || "{}");
    return s.homeOverride || "auto";
  } catch(e) {
    return "auto";
  }
}

function getGreeting() {
  var h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good Morning";
  if (h >= 12 && h < 17) return "Good Afternoon";
  if (h >= 17 && h < 21) return "Good Evening";
  return "Good Night";
}

export default function HomeScreen(props) {
  var [session, setSession] = useState(getSession());
  var [override, setOverride] = useState(getHomeOverride());

  useEffect(function(){
    var t = setInterval(function(){
      var newSess = getSession();
      if (newSess != session) {
        setSession(newSess);
        if (typeof Notification != "undefined" && Notification.permission == "granted") {
          try {
            if (newSess == "global") {
              new Notification("BreakoutPro", {body: "Global Markets Active - Check Tomorrow Setup", icon:"/favicon.ico"});
            } else {
              new Notification("BreakoutPro", {body: "Good Morning! NSE Market Dashboard Active", icon:"/favicon.ico"});
            }
          } catch(e) {}
        }
      }
      var newOv = getHomeOverride();
      if (newOv != override) setOverride(newOv);
    }, 5000);
    return function(){clearInterval(t);};
  }, [session, override]);

  if (override == "equity") return <EquityHome {...props} greeting={getGreeting()}/>;
  if (override == "commodity") return <CommodityHome {...props} greeting={getGreeting()}/>;
  if (override == "global") return <GlobalHome {...props} greeting={getGreeting()}/>;

  if (session == "global") return <GlobalHome {...props} greeting={getGreeting()}/>;
  return <EquityHome {...props} greeting={getGreeting()}/>;
}

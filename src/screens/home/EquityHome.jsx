import { useState } from "react";
import { useResponsive } from "../../hooks/useResponsive";
import OptionsIntelPage from "../OptionsIntelPage";
import ArticlePage from "../ArticlePage";
import EquityHomeMobile from "./EquityHomeMobile";
import EquityHomeTablet from "./EquityHomeTablet";
import EquityHomeLaptop from "./EquityHomeLaptop";
import EquityHomeDesktop from "./EquityHomeDesktop";

// BreakoutPro - EquityHome.jsx (Home Router)
// This file does exactly one job: detect the current device/breakpoint and
// render the matching layout. It does NOT contain any Home UI itself, and
// it does NOT call useHomeData() - only the one layout that actually
// renders calls that hook, so there is never more than one live
// subscription to market-mood polling at a time. The two full-screen
// overrides (Options detail page, Article detail page) are simple local
// navigation state owned here and passed down as props, since they apply
// identically regardless of device and should not be duplicated inside
// all four layout files.
//
// Breakpoint -> layout mapping:
//   xs, sm            -> Mobile
//   md                -> Tablet
//   lg                -> Laptop
//   xl, xxl, tv, tv4k -> Desktop / Large Monitor
//
// Only ONE of the four layout components is ever rendered per breakpoint -
// the other three are never constructed, never mounted.
// Rules: no backtick, no triple-equals, ASCII.

export default function EquityHome(props){
  var responsive = useResponsive();
  var [selArticle, setSelArticle] = useState(null);
  var [showOptions, setShowOptions] = useState(false);

  if(showOptions) return <OptionsIntelPage symbol="NIFTY" onBack={function(){setShowOptions(false);}}/>;
  if(selArticle) return (
    <ArticlePage
      article={selArticle}
      onBack={function(){setSelArticle(null);}}
      onOpen={function(n){setSelArticle(n);}}
      setTab={props.setTab}
    />
  );

  var layoutProps = Object.assign({}, props, {
    selArticle: selArticle, setSelArticle: setSelArticle,
    showOptions: showOptions, setShowOptions: setShowOptions
  });

  var bp = responsive.breakpoint;

  if(responsive.isMobile) return <EquityHomeMobile {...layoutProps}/>;
  if(bp=="md") return <EquityHomeTablet {...layoutProps}/>;
  if(bp=="lg") return <EquityHomeLaptop {...layoutProps}/>;
  return <EquityHomeDesktop {...layoutProps}/>;
}

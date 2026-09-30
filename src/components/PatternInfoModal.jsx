// BreakoutPro - PatternInfoModal.jsx
// Small, compact, dismissible educational popup for chart pattern labels.
// Strictly educational: no Buy/Sell/Entry/Exit/Target/Stop Loss language,
// no personalized trading advice, no guaranteed-outcome wording. Reads its
// content from the single centralized src/data/patternEducation.js map -
// this component only renders, it does not classify or detect patterns.

import { useEffect, useRef } from "react";
import { useTheme } from "../theme/ThemeProvider";
import { getPatternEducation } from "../data/patternEducation";

export default function PatternInfoModal(props) {
  var name = props.name;
  var onClose = props.onClose;
  var theme = useTheme();
  var CARD = theme.c.card, BD = theme.c.border;
  var T1 = theme.c.text1, T2 = theme.c.text2, T3 = theme.c.text3;
  var closeBtnRef = useRef(null);

  var edu = name ? getPatternEducation(name) : null;

  useEffect(function () {
    if (!name) return;
    if (closeBtnRef.current) closeBtnRef.current.focus();
    function onKey(e) {
      if (e.key == "Escape") onClose && onClose();
    }
    document.addEventListener("keydown", onKey);
    return function () {
      document.removeEventListener("keydown", onKey);
    };
  }, [name]);

  if (!name) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={(edu ? edu.name : name) + " pattern information"}
      onClick={function (e) { if (e.target == e.currentTarget) onClose && onClose(); }}
      style={{ position: "fixed", left: 0, top: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 4000, padding: 16, boxSizing: "border-box" }}
    >
      <div style={{ background: CARD, border: "1px solid " + BD, borderRadius: 12, width: "100%", maxWidth: 320, maxHeight: "80vh", overflow: "auto", boxSizing: "border-box", padding: 14, boxShadow: "0 8px 28px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: T1, lineHeight: 1.3 }}>{edu ? edu.name : name}</div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close"
            style={{ flexShrink: 0, background: "rgba(120,120,120,0.14)", border: "none", borderRadius: 6, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, color: T1 }}
          >&#10005;</button>
        </div>

        {edu ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12, color: T1, lineHeight: 1.5 }}>{edu.what}</div>
            <div style={{ fontSize: 12, color: T2, lineHeight: 1.5 }}>{edu.means}</div>
            {edu.context ? (
              <div style={{ fontSize: 11, color: T3, lineHeight: 1.5, paddingTop: 6, borderTop: "1px solid " + BD }}>{edu.context}</div>
            ) : null}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: T2, lineHeight: 1.5 }}>No educational description is available for this pattern yet.</div>
        )}

        <div style={{ fontSize: 10, color: T3, lineHeight: 1.4, marginTop: 12, paddingTop: 8, borderTop: "1px solid " + BD }}>
          Educational market-pattern information only. Not investment advice.
        </div>
      </div>
    </div>
  );
}

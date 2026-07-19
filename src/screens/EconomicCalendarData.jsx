// BreakoutPro - EconomicCalendarData.jsx
// IMPORTANT HONESTY NOTE: Breakout Pro has no real economic-calendar data
// source (no live RBI/Fed/CPI/GDP/earnings/expiry feed exists anywhere in
// this app). Per spec, this is built as a clearly and permanently labeled
// EDUCATIONAL / DEMO CALENDAR - illustrative event types with dates
// computed relative to today's real date (real Date math only, never
// Math.random, never claiming to be a live or confirmed schedule).
// Rules: no backtick, no triple-equals, ASCII only.

export var CALENDAR_LABEL = "Educational / Demo Calendar";

export var CATEGORIES = ["RBI","Fed","CPI","GDP","Inflation","PMI","Interest Rates","Employment","Earnings","Expiry Calendar"];
export var COUNTRIES = ["India","United States","Global"];
export var IMPACT_LEVELS = ["High","Medium","Low"];

// daysFromToday is an illustrative offset only, resolved against the real
// current date at render time - not a claim about any specific real
// future date for these institutions' actual events.
export var EVENTS = [
  {
    id:"rbi_policy", title:"RBI Monetary Policy Meeting (illustrative)", category:"RBI", country:"India", impact:"High", daysFromToday:2,
    whyMatters:"The Reserve Bank of India's policy meetings set the repo rate, which influences borrowing costs across the economy and is widely watched by market participants.",
    ruleBasedImpact:"Rate decisions and policy tone are commonly associated with movement in rate-sensitive sectors like banking and real estate. This does not predict which direction any specific move will take."
  },
  {
    id:"fed_fomc", title:"US Fed FOMC Meeting (illustrative)", category:"Fed", country:"United States", impact:"High", daysFromToday:5,
    whyMatters:"The US Federal Reserve's rate decisions influence global liquidity and are closely watched by markets worldwide, including India, due to capital flow effects.",
    ruleBasedImpact:"Fed decisions are commonly associated with volatility across global markets in the following sessions. This does not predict direction."
  },
  {
    id:"india_cpi", title:"India CPI Inflation Data (illustrative)", category:"CPI", country:"India", impact:"High", daysFromToday:1,
    whyMatters:"CPI (Consumer Price Index) measures retail inflation and is a key input to RBI's rate decisions.",
    ruleBasedImpact:"CPI readings materially different from expectations are commonly associated with short-term volatility in rate-sensitive sectors."
  },
  {
    id:"us_cpi", title:"US CPI Inflation Data (illustrative)", category:"CPI", country:"United States", impact:"High", daysFromToday:8,
    whyMatters:"US CPI is one of the most closely watched inflation gauges globally and feeds directly into Fed policy expectations.",
    ruleBasedImpact:"Surprises versus expectations are commonly associated with global market volatility, including in Indian markets."
  },
  {
    id:"india_gdp", title:"India GDP Growth Data (illustrative)", category:"GDP", country:"India", impact:"Medium", daysFromToday:14,
    whyMatters:"GDP growth figures reflect the overall pace of economic activity and are watched for signs of expansion or slowdown.",
    ruleBasedImpact:"GDP data significantly above or below expectations is commonly associated with broad market sentiment shifts."
  },
  {
    id:"global_inflation", title:"Global Inflation Trend Review (illustrative)", category:"Inflation", country:"Global", impact:"Medium", daysFromToday:10,
    whyMatters:"Broader global inflation trends influence central bank policy expectations across multiple economies simultaneously.",
    ruleBasedImpact:"Sustained global inflation trends are commonly discussed alongside currency and bond market movements."
  },
  {
    id:"india_pmi", title:"India Manufacturing PMI (illustrative)", category:"PMI", country:"India", impact:"Medium", daysFromToday:3,
    whyMatters:"PMI (Purchasing Managers Index) is an early indicator of manufacturing sector activity, watched ahead of official GDP data.",
    ruleBasedImpact:"PMI readings above 50 are conventionally read as expansion and below 50 as contraction - an educational convention, not a signal."
  },
  {
    id:"rate_review", title:"Global Interest Rate Review (illustrative)", category:"Interest Rates", country:"Global", impact:"Medium", daysFromToday:6,
    whyMatters:"Comparative interest rate trends across major economies influence currency and capital flow patterns.",
    ruleBasedImpact:"Rate differential changes are commonly associated with currency market movement, discussed here for education only."
  },
  {
    id:"india_employment", title:"India Employment Data (illustrative)", category:"Employment", country:"India", impact:"Low", daysFromToday:12,
    whyMatters:"Employment data reflects labor market health, an input many analysts consider alongside GDP and inflation.",
    ruleBasedImpact:"Employment surprises are commonly discussed alongside consumption-linked sector sentiment."
  },
  {
    id:"us_employment", title:"US Non-Farm Payrolls (illustrative)", category:"Employment", country:"United States", impact:"High", daysFromToday:9,
    whyMatters:"US jobs data is one of the most closely watched monthly indicators globally and heavily influences Fed rate expectations.",
    ruleBasedImpact:"Payroll surprises are commonly associated with short-term global market volatility."
  },
  {
    id:"earnings_season", title:"Quarterly Earnings Season (illustrative)", category:"Earnings", country:"India", impact:"High", daysFromToday:4,
    whyMatters:"Company quarterly results directly affect individual stock prices and can move sector-wide sentiment.",
    ruleBasedImpact:"Results significantly above or below expectations are commonly associated with immediate price reaction in that stock - never guaranteed."
  },
  {
    id:"weekly_expiry", title:"Weekly Index Options Expiry (illustrative)", category:"Expiry Calendar", country:"India", impact:"Medium", daysFromToday:0,
    whyMatters:"Options expiry days can see distinctive volume and volatility patterns as positions are settled or rolled over.",
    ruleBasedImpact:"Expiry sessions are commonly associated with above-average intraday volatility - an educational observation, not a trading signal."
  },
  {
    id:"monthly_expiry", title:"Monthly F&O Expiry (illustrative)", category:"Expiry Calendar", country:"India", impact:"Medium", daysFromToday:7,
    whyMatters:"Monthly expiry involves a larger volume of contract settlement and rollover than weekly expiries.",
    ruleBasedImpact:"Monthly expiry sessions are commonly discussed alongside elevated activity in index options - educational only."
  }
];

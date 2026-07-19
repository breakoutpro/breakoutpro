// BreakoutPro - LearnTopicData.jsx
// Educational content for each Learn & Invest topic. Terminology English.
// Educational only - no buy/sell/entry/SL/target. Rules: no backtick, no triple-equals, ASCII.

export function getTopic(id){ return TOPICS[id]||TOPICS["opt-buy"]; }

// Each topic: title, intro, sections[{h, p}], keyPoints[], mistakes[], routes to deeper module if any.
var TOPICS = {
  "opt-buy":{ title:"Options Buying", level:"Intermediate", mins:"8 min",
    intro:"Option buying means paying a premium for the right, not obligation, to buy (Call) or sell (Put) at a set strike before expiry. Risk is limited to the premium, but most buyers lose to time decay.",
    sections:[
      {h:"How it works", p:"You pay a premium upfront. A Call gains as price rises above the strike; a Put gains as price falls below it. Your maximum loss is the premium paid."},
      {h:"The biggest challenge", p:"Time decay (Theta) erodes premium every day, fastest near expiry. You can be right on direction and still lose if the move is slow."},
      {h:"What helps buyers", p:"A fast, strong move in your direction, rising IV, and enough time to expiry. Buying when IV is low and selling when it spikes is a common study."}
    ],
    keyPoints:["Limited risk, large potential reward","Time decay works against you","Needs direction and speed","IV changes affect premium heavily"],
    mistakes:["Buying far out-of-the-money lottery tickets","Holding through time decay near expiry","Ignoring IV crush after events"],
    deeper:null },
  "opt-sell":{ title:"Options Selling", level:"Advanced", mins:"10 min",
    intro:"Option selling means collecting premium and taking on the obligation. Time decay works in your favour, but risk can be large. BreakoutPro has a full Options Selling Academy for this.",
    sections:[
      {h:"Why sellers collect premium", p:"Sellers are paid upfront to take the other side. If the option expires worthless, they keep the premium."},
      {h:"The trade-off", p:"Positive Theta helps daily, but a sharp move against you can cause large losses in undefined-risk strategies."},
      {h:"Defined vs undefined risk", p:"Spreads (Bull Put, Bear Call, Iron Condor) cap risk. Naked straddles and strangles have undefined risk and need careful study."}
    ],
    keyPoints:["Premium collected upfront","Theta works for you","Risk can be large or undefined","Margin is required"],
    mistakes:["Selling naked without understanding risk","Holding through events","Using too much margin"],
    deeper:"optsell" },
  "gamma":{ title:"Gamma Blast", level:"Advanced", mins:"7 min",
    intro:"Gamma blast describes explosive moves near expiry when dealer hedging accelerates price in one direction. It is a market-structure concept, not a trade call.",
    sections:[
      {h:"What is Gamma", p:"Gamma measures how fast Delta changes. Near expiry, at-the-money options have very high Gamma."},
      {h:"How a blast forms", p:"When dealers are short Gamma, they must buy as price rises and sell as it falls, which can amplify a move into a sharp blast."},
      {h:"Why it matters", p:"Understanding Gamma helps explain why expiry days can see violent, fast moves that surprise beginners."}
    ],
    keyPoints:["Gamma is the speed of Delta","Highest near expiry at-the-money","Dealer hedging can amplify moves","Very high risk near expiry"],
    mistakes:["Chasing a blast after it has happened","Ignoring how fast it can reverse"],
    deeper:null },
  "greeks":{ title:"Option Greeks", level:"Intermediate", mins:"9 min",
    intro:"Greeks measure how an option's price reacts to different forces: price (Delta), speed (Gamma), time (Theta), and volatility (Vega).",
    sections:[
      {h:"Delta", p:"How much the option moves for a 1-point move in the underlying. At-the-money is around 0.5."},
      {h:"Gamma", p:"How fast Delta itself changes. Highest near expiry and at-the-money."},
      {h:"Theta", p:"Daily time decay. Negative for buyers, positive for sellers, and accelerates near expiry."},
      {h:"Vega", p:"Sensitivity to a 1% change in IV. Longer-dated options have more Vega."}
    ],
    keyPoints:["Delta = direction","Gamma = speed","Theta = time decay","Vega = volatility"],
    mistakes:["Ignoring Theta when buying","Forgetting Vega around events"],
    deeper:null },
  "chain":{ title:"Option Chain Guide", level:"Beginner", mins:"6 min",
    intro:"The Option Chain lists all Call and Put strikes with their price, OI, volume, and IV. It is the control panel for options analysis.",
    sections:[
      {h:"Reading the chain", p:"Calls are usually on the left, Puts on the right, strikes in the middle. Each row shows LTP, OI, volume, and IV."},
      {h:"Open Interest", p:"OI shows how many contracts are open at each strike. High OI marks important levels like Call Wall and Put Wall."},
      {h:"Using it", p:"PCR, Max Pain, and support or resistance from OI all come from reading the chain carefully."}
    ],
    keyPoints:["Strikes, OI, volume, IV in one view","High OI marks key levels","Source of PCR and Max Pain"],
    mistakes:["Looking only at price, ignoring OI","Confusing volume with OI"],
    deeper:null },
  "candle":{ title:"Candlestick Patterns", level:"Beginner", mins:"Interactive",
    intro:"Candlestick patterns show the battle between buyers and sellers in a single or few candles. BreakoutPro has animated lessons for each one.",
    sections:[
      {h:"Why candles matter", p:"Each candle shows open, high, low, close. Patterns hint at possible shifts in momentum."},
      {h:"Learn interactively", p:"Open the animated pattern library to watch each pattern form candle by candle with full explanation."}
    ],
    keyPoints:["Single and multi-candle patterns","Show momentum shifts","Best with trend and volume context"],
    mistakes:["Trading patterns without context","Ignoring the wider trend"],
    deeper:"signals" },
  "chart":{ title:"Chart Patterns", level:"Intermediate", mins:"Interactive",
    intro:"Chart patterns like Head and Shoulders, Triangles, and Flags form over many candles and hint at continuation or reversal.",
    sections:[
      {h:"Continuation vs reversal", p:"Flags and Pennants often continue the trend; Double Tops and Head and Shoulders often reverse it."},
      {h:"Learn interactively", p:"Open the animated pattern library for chart patterns with real Indian examples."}
    ],
    keyPoints:["Form over many candles","Continuation or reversal","Volume confirms breaks"],
    mistakes:["Forcing patterns that are not there","Entering before confirmation"],
    deeper:"signals" },
  "intraday":{ title:"Intraday Basics", level:"Beginner", mins:"7 min",
    intro:"Intraday trading means opening and closing positions the same day. It needs discipline, liquidity, and strict risk study.",
    sections:[
      {h:"What it involves", p:"Fast decisions, watching levels, and managing risk tightly within market hours."},
      {h:"Key concepts", p:"Opening range, VWAP, volume, and momentum are commonly studied for intraday."}
    ],
    keyPoints:["Same-day positions","Needs discipline and liquidity","Risk management is critical"],
    mistakes:["Overtrading","Ignoring transaction costs","No risk plan"],
    deeper:null },
  "swing":{ title:"Swing Trading", level:"Intermediate", mins:"7 min",
    intro:"Swing trading holds positions for several days to weeks to capture a larger move, using daily charts and patterns.",
    sections:[
      {h:"The idea", p:"Capture one swing of a trend over days or weeks rather than minutes."},
      {h:"What is studied", p:"Daily structure, support and resistance, and chart patterns are the core tools."}
    ],
    keyPoints:["Multi-day holding","Uses daily charts","Patience over frequency"],
    mistakes:["Checking charts too often","Cutting winners early"],
    deeper:null },
  "delivery":{ title:"Delivery Investing", level:"Beginner", mins:"6 min",
    intro:"Delivery investing means buying shares and holding them in your demat account, from weeks to years, based on fundamentals.",
    sections:[
      {h:"The approach", p:"You own the actual shares and can hold long term, benefiting from growth and dividends."},
      {h:"What is studied", p:"Company fundamentals, sector trends, and valuation rather than short-term charts."}
    ],
    keyPoints:["Own real shares","Long-term horizon","Fundamentals matter"],
    mistakes:["Buying on tips","Ignoring valuation","No diversification"],
    deeper:null },
  "sip":{ title:"SIP Guide", level:"Beginner", mins:"5 min",
    intro:"A Systematic Investment Plan invests a fixed amount regularly into mutual funds, using rupee-cost averaging and compounding.",
    sections:[
      {h:"How SIP works", p:"You invest a fixed sum monthly, buying more units when prices are low and fewer when high."},
      {h:"Why it helps", p:"It removes timing stress and lets compounding work over years."}
    ],
    keyPoints:["Fixed regular investing","Rupee-cost averaging","Compounding over time"],
    mistakes:["Stopping during market falls","Expecting quick returns"],
    deeper:null },
  "mf":{ title:"Mutual Funds", level:"Beginner", mins:"6 min",
    intro:"A mutual fund pools money from many investors and a professional manager invests it across stocks or bonds.",
    sections:[
      {h:"Types", p:"Equity, debt, hybrid, and index funds suit different goals and risk levels."},
      {h:"What to study", p:"Expense ratio, fund category, and long-term consistency rather than last year's return."}
    ],
    keyPoints:["Professionally managed","Diversified by design","Match fund to your goal"],
    mistakes:["Chasing past returns","Ignoring expense ratio"],
    deeper:null },
  "risk":{ title:"Risk Management", level:"Essential", mins:"8 min",
    intro:"Risk management is the most important skill. It is about protecting capital so you can stay in the game long term.",
    sections:[
      {h:"Position sizing", p:"Risk only a small part of capital on any single idea so one loss cannot hurt badly."},
      {h:"Diversification", p:"Spread exposure across ideas and sectors to reduce concentration risk."},
      {h:"Discipline", p:"A plan you follow consistently beats a perfect plan you abandon under stress."}
    ],
    keyPoints:["Protect capital first","Size positions by risk","Diversify","Stay disciplined"],
    mistakes:["Risking too much on one idea","No plan for losses","Averaging into losers blindly"],
    deeper:null },
  "psych":{ title:"Trading Psychology", level:"Essential", mins:"7 min",
    intro:"Markets test emotions. Fear, greed, and impatience cause most mistakes. Psychology is as important as analysis.",
    sections:[
      {h:"Common emotions", p:"Fear of missing out, fear of loss, and greed all push people into poor decisions."},
      {h:"Building discipline", p:"A written plan, journaling, and accepting losses as part of the process build steadiness."}
    ],
    keyPoints:["Emotions drive mistakes","A plan reduces impulse","Journaling builds awareness"],
    mistakes:["Revenge trading after a loss","Overconfidence after a win"],
    deeper:null },
  "portfolio":{ title:"Portfolio Management", level:"Intermediate", mins:"7 min",
    intro:"Portfolio management is about building and balancing a mix of investments that matches your goals and risk comfort.",
    sections:[
      {h:"Asset allocation", p:"Decide how much goes to equity, debt, and other assets based on your horizon."},
      {h:"Rebalancing", p:"Periodically bring weights back to target so winners do not dominate risk."}
    ],
    keyPoints:["Allocation drives results","Rebalance periodically","Match risk to goals"],
    mistakes:["Over-concentration","Never rebalancing","Ignoring your time horizon"],
    deeper:null },
  "fvo":{ title:"Futures vs Options", level:"Intermediate", mins:"6 min",
    intro:"Futures and Options are both derivatives, but they behave very differently in risk and reward.",
    sections:[
      {h:"Futures", p:"A futures contract has linear profit and loss and requires margin. Both gains and losses can be large."},
      {h:"Options", p:"Options have non-linear payoffs. Buyers have limited risk; sellers collect premium with larger risk."},
      {h:"Choosing", p:"The right tool depends on your view, risk comfort, and understanding of Greeks."}
    ],
    keyPoints:["Futures = linear risk","Options = non-linear","Options add Greeks","Both use margin or premium"],
    mistakes:["Treating options like futures","Ignoring Greeks in options"],
    deeper:null }
};

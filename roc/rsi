# RSI with RateOfChange
# An RSI, using RateOfChange (ROC) as the source
# Code based off of OBV/RSI thread from @diazlaz
# Assembled by BenTen at useThinkScript.com

declare lower;

input length = 14;
input over_Bought = 70;
input over_Sold = 30;
input src = close;
input averageType = AverageType.WILDERS;
input showBreakoutSignals = no;

# Rate of Change code
input price_ROC = close;
assert(length > 0, "'length' must be positive: " + length);
def ROC = if price_ROC[length] != 0 then(price_ROC / price_ROC[length] - 1) * 100 else 0;
#end of ROC code

def price = ROC;

def NetChgAvg = MovingAverage(averageType, price - price[1], length);
def TotChgAvg = MovingAverage(averageType, AbsValue(price - price[1]), length);
def ChgRatio = if TotChgAvg != 0 then NetChgAvg / TotChgAvg else 0;

plot RSI = 50 * (ChgRatio + 1);
plot OverSold = over_Sold;
plot OverBought = over_Bought;
plot UpSignal = if RSI crosses above OverSold then OverSold else Double.NaN;
plot DownSignal = if RSI crosses below OverBought then OverBought else Double.NaN;

plot mid = 50;
mid.SetPaintingStrategy(paintingStrategy = PaintingStrategy.DASHES);
mid.AssignValueColor(COLOR.DARK_GRAY);

UpSignal.SetHiding(!showBreakoutSignals);
DownSignal.SetHiding(!showBreakoutSignals);

RSI.DefineColor("OverBought", GetColor(5));
RSI.DefineColor("Normal", GetColor(7));
RSI.DefineColor("OverSold", GetColor(1));
RSI.AssignValueColor(if RSI > over_Bought then RSI.color("OverBought") else
  if RSI<over_Sold then RSI.color("OverSold") else RSI.color("Normal"));

OverSold.SetDefaultColor(GetColor(8));
OverBought.SetDefaultColor(GetColor(8));
UpSignal.SetDefaultColor(Color.UPTICK);
UpSignal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
DownSignal.SetDefaultColor(Color.DOWNTICK);
DownSignal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);

# END OF ROC RSI

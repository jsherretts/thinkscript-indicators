##########################################################
# vwap + stochastics signals
# displays buy / sell arrow depending on what side of vwap price is on
##########################################################

##########################################################
# vwap
##########################################################
input numDevDn = -2.0;
input numDevUp = 2.0;
input timeFrame = { default DAY, WEEK, MONTH };

def cap = GetAggregationPeriod();
def errorInAggregation =
    timeFrame == timeFrame.DAY and cap >= AggregationPeriod.WEEK or
timeFrame == timeFrame.WEEK and cap >= AggregationPeriod.MONTH;
Assert(!errorInAggregation, "timeFrame should be not less than current chart aggregation period");

def yyyyMmDd = GetYYYYMMDD();
def periodIndx;
switch (timeFrame) {
    case DAY:
        periodIndx = yyyyMmDd;
    case WEEK:
        periodIndx = Floor((DaysFromDate(First(yyyyMmDd)) + GetDayOfWeek(First(yyyyMmDd))) / 7);
    case MONTH:
        periodIndx = RoundDown(yyyyMmDd / 100, 0);
}
def isPeriodRolled = CompoundValue(1, periodIndx != periodIndx[1], yes);

def volumeSum;
def volumeVwapSum;
def volumeVwap2Sum;

if (isPeriodRolled) {
    volumeSum = volume;
    volumeVwapSum = volume * vwap;
    volumeVwap2Sum = volume * Sqr(vwap);
} else {
    volumeSum = CompoundValue(1, volumeSum[1] + volume, volume);
    volumeVwapSum = CompoundValue(1, volumeVwapSum[1] + volume * vwap, volume * vwap);
    volumeVwap2Sum = CompoundValue(1, volumeVwap2Sum[1] + volume * Sqr(vwap), volume * Sqr(vwap));
}
def price = volumeVwapSum / volumeSum;
def deviation = Sqrt(Max(volumeVwap2Sum / volumeSum - Sqr(price), 0));

plot VWAP = price;
VWAP.AssignValueColor(if VWAP[0] > VWAP[1] then Color.GREEN else Color.RED);
VWAP.SetPaintingStrategy(PaintingStrategy.DASHES);

##########################################################
# stochastics
##########################################################
input over_bought = 80;
input over_sold = 20;
input KPeriod = 10;
input DPeriod = 10;
input priceH = high;
input priceL = low;
input priceC = close;
input slowing_period = 3;
input averageType = AverageType.SIMPLE;
input showBreakoutSignals = { default "No", "On FullK", "On FullD", "On FullK & FullD"};

def lowest_k = Lowest(priceL, KPeriod);
def c1 = priceC - lowest_k;
def c2 = Highest(priceH, KPeriod) - lowest_k;
def FastK = if c2 != 0 then c1 / c2 * 100 else 0;

def FullK = MovingAverage(averageType, FastK, slowing_period);
def FullD = MovingAverage(averageType, FullK, DPeriod);

def OverBought = over_bought;
def OverSold = over_sold;

def upK = FullK crosses above OverSold;
def upD = FullD crosses above OverSold;
def downK = FullK crosses below OverBought;
def downD = FullD crosses below OverBought;

plot UpSignal;
plot DownSignal;
switch (showBreakoutSignals) {
    case "No":
        UpSignal = Double.NaN;
        DownSignal = Double.NaN;
    case "On FullK":
        UpSignal = if upK then OverSold else Double.NaN;
        DownSignal = if downK then OverBought else Double.NaN;
    case "On FullD":
        UpSignal = if upD then OverSold else Double.NaN;
        DownSignal = if downD then OverBought else Double.NaN;
    case "On FullK & FullD":
        UpSignal = if upK or upD then OverSold else Double.NaN;
        DownSignal = if downK or downD then OverBought else Double.NaN;
}

##########################################################
# signals
##########################################################
plot bullish = (priceC > VWAP) and(FullK crosses above OverSold);
plot bearish = (PriceC < VWAP) and(FullK crosses below OverBought);

bullish.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
bullish.SetDefaultColor(Color.PINK);
bullish.SetLineWeight(2);
bearish.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);
bearish.SetDefaultColor(Color.PINK);
bearish.SetLineWeight(2);
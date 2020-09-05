##########################################################
# vwap rejection signals
# displays buy / sell arrow depending on what side of vwap the rejection happens
##########################################################

##########################################################
# vwap
##########################################################
input numDevDn = -2.0;
input numDevUp = 2.0;
input timeFrame = { default DAY, WEEK, MONTH };
input distance = 0.50;

def cap = getAggregationPeriod();
def errorInAggregation =
    timeFrame == timeFrame.DAY and cap >= AggregationPeriod.WEEK or
timeFrame == timeFrame.WEEK and cap >= AggregationPeriod.MONTH;
assert(!errorInAggregation, "timeFrame should be not less than current chart aggregation period");

def yyyyMmDd = getYyyyMmDd();
def periodIndx;
switch (timeFrame) {
    case DAY:
        periodIndx = yyyyMmDd;
    case WEEK:
        periodIndx = Floor((daysFromDate(first(yyyyMmDd)) + getDayOfWeek(first(yyyyMmDd))) / 7);
    case MONTH:
        periodIndx = roundDown(yyyyMmDd / 100, 0);
}
def isPeriodRolled = compoundValue(1, periodIndx != periodIndx[1], yes);

def volumeSum;
def volumeVwapSum;
def volumeVwap2Sum;

if (isPeriodRolled) {
    volumeSum = volume;
    volumeVwapSum = volume * vwap;
    volumeVwap2Sum = volume * Sqr(vwap);
} else {
    volumeSum = compoundValue(1, volumeSum[1] + volume, volume);
    volumeVwapSum = compoundValue(1, volumeVwapSum[1] + volume * vwap, volume * vwap);
    volumeVwap2Sum = compoundValue(1, volumeVwap2Sum[1] + volume * Sqr(vwap), volume * Sqr(vwap));
}
def price = volumeVwapSum / volumeSum;
def deviation = Sqrt(Max(volumeVwap2Sum / volumeSum - Sqr(price), 0));

plot VWAP = price;
VWAP.setDefaultColor(getColor(0));

##########################################################
# signals
##########################################################
def bullSetup = (high[2] > high[1]) and(low[2] > low[1]);
def bullRejection = (open[1] > VWAP) and(((low[1] - VWAP) < distance)) and(high[1] > VWAP) and(close[1] > VWAP);
def bullSignal = (low[0] > VWAP) and(VWAP[0] > VWAP[1]);

def bearSetup = (high[2] < high[1]) and(low[2] < low[1]);
def bearRejection = (open[1] < VWAP) and(((VWAP - high[1]) < distance)) and(low[1] < VWAP) and(close[1] < VWAP);
def bearSignal = (high[0] < VWAP) and(VWAP[0] < VWAP[1]);

plot bullish = (bullSetup and bullRejection and bullSignal and(high[0] > high[1]));
plot bearish = (bearSetup and bearRejection and bearSignal and(low[0] < low[1]));

alert(bullish, "LONG!", alert.BAR, Sound.Ding);
alert(bearish, "SHORT!", alert.BAR, Sound.Ding);

bullish.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
bullish.SetDefaultColor(color.green);
bullish.SetLineWeight(3);
bearish.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);
bearish.SetDefaultColor(color.red);
bearish.SetLineWeight(3);

addlabel(yes, "vwap rejection", color.magenta);
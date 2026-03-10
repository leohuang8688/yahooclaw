/**
 * Technical Indicators 模块 - 技术指标分析
 * @module modules/technical
 */

/**
 * 计算简单移动平均线 (MA)
 * @param {Array<number>} data - 价格数据
 * @param {number} period - 周期
 * @returns {Object} MA 数据
 */
export function calculateMA(data, period) {
  if (data.length < period) {
    return null;
  }
  
  const slice = data.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  const ma = sum / period;
  
  return {
    value: parseFloat(ma.toFixed(2)),
    period: period,
    trend: data[data.length - 1] > ma ? 'BULLISH' : 'BEARISH'
  };
}

/**
 * 计算指数移动平均线 (EMA)
 * @param {Array<number>} data - 价格数据
 * @param {number} period - 周期
 * @returns {Object} EMA 数据
 */
export function calculateEMA(data, period) {
  if (data.length < period) {
    return null;
  }

  const multiplier = 2 / (period + 1);
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
  }

  return {
    value: parseFloat(ema.toFixed(2)),
    period: period,
    trend: data[data.length - 1] > ema ? 'BULLISH' : 'BEARISH'
  };
}

/**
 * 计算相对强弱指数 (RSI)
 * @param {Array<number>} data - 价格数据
 * @param {number} period - 周期（默认 14）
 * @returns {number} RSI 值
 */
export function calculateRSI(data, period = 14) {
  if (data.length < period + 1) {
    return null;
  }

  let gains = 0;
  let losses = 0;

  // 计算初始平均涨幅和跌幅
  for (let i = 1; i <= period; i++) {
    const change = data[i] - data[i - 1];
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // 平滑计算后续值
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i] - data[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  return parseFloat(rsi.toFixed(2));
}

/**
 * 获取 RSI 信号
 * @param {number} rsi - RSI 值
 * @returns {string} 信号
 */
export function getRSISignal(rsi) {
  if (rsi >= 70) return 'OVERBOUGHT';
  if (rsi <= 30) return 'OVERSOLD';
  if (rsi >= 50) return 'BULLISH';
  return 'BEARISH';
}

/**
 * 计算 MACD
 * @param {Array<number>} data - 价格数据
 * @returns {Object} MACD 数据
 */
export function calculateMACD(data) {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);

  if (!ema12 || !ema26) {
    return null;
  }

  const macdLine = ema12.value - ema26.value;
  
  // 计算信号线 (9 日 EMA)
  const macdValues = [];
  for (let i = 26; i < data.length; i++) {
    const slice = data.slice(0, i + 1);
    const e12 = calculateEMA(slice, 12);
    const e26 = calculateEMA(slice, 26);
    if (e12 && e26) {
      macdValues.push(e12.value - e26.value);
    }
  }

  const signalLine = calculateEMA(macdValues, 9);
  const histogram = macdLine - (signalLine ? signalLine.value : 0);

  return {
    macdLine: parseFloat(macdLine.toFixed(2)),
    signalLine: signalLine ? parseFloat(signalLine.value.toFixed(2)) : null,
    histogram: parseFloat(histogram.toFixed(2)),
    trend: macdLine > 0 ? 'BULLISH' : 'BEARISH',
    crossover: signalLine ? (macdLine > signalLine.value ? 'GOLDEN' : 'DEATH') : null
  };
}

/**
 * 计算布林带
 * @param {Array<number>} data - 价格数据
 * @param {number} period - 周期（默认 20）
 * @param {number} stdDev - 标准差倍数（默认 2）
 * @returns {Object} 布林带数据
 */
export function calculateBollingerBands(data, period = 20, stdDev = 2) {
  if (data.length < period) {
    return null;
  }

  const slice = data.slice(-period);
  const middle = slice.reduce((a, b) => a + b, 0) / period;
  
  // 计算标准差
  const variance = slice.reduce((sum, price) => {
    return sum + Math.pow(price - middle, 2);
  }, 0) / period;
  
  const std = Math.sqrt(variance);
  const upper = middle + (stdDev * std);
  const lower = middle - (stdDev * std);
  const currentPrice = data[data.length - 1];

  // 判断价格位置
  let position = 'MIDDLE';
  if (currentPrice >= upper) position = 'OVERBOUGHT';
  else if (currentPrice <= lower) position = 'OVERSOLD';
  else if (currentPrice > middle) position = 'UPPER_HALF';
  else position = 'LOWER_HALF';

  return {
    upper: parseFloat(upper.toFixed(2)),
    middle: parseFloat(middle.toFixed(2)),
    lower: parseFloat(lower.toFixed(2)),
    bandwidth: parseFloat(((upper - lower) / middle * 100).toFixed(2)),
    percentB: parseFloat(((currentPrice - lower) / (upper - lower) * 100).toFixed(2)),
    position: position,
    period: period
  };
}

/**
 * 计算 KDJ
 * @param {Array<number>} highs - 最高价
 * @param {Array<number>} lows - 最低价
 * @param {Array<number>} closes - 收盘价
 * @param {number} period - 周期（默认 9）
 * @returns {Object} KDJ 数据
 */
export function calculateKDJ(highs, lows, closes, period = 9) {
  if (closes.length < period) {
    return null;
  }

  const kValues = [];

  for (let i = period - 1; i < closes.length; i++) {
    const sliceHighs = highs.slice(i - period + 1, i + 1);
    const sliceLows = lows.slice(i - period + 1, i + 1);

    const highestHigh = Math.max(...sliceHighs);
    const lowestLow = Math.min(...sliceLows);
    const currentClose = closes[i];

    const rsv = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    kValues.push(rsv);
  }

  // 计算 K 值 (3 日 SMA)
  const k = kValues.length >= 3 
    ? kValues.slice(-3).reduce((a, b) => a + b, 0) / 3 
    : kValues[kValues.length - 1];

  // 计算 D 值 (3 日 SMA of K)
  const d = kValues.length >= 3 
    ? kValues.slice(-3).reduce((a, b) => a + b, 0) / 3 
    : k;

  // 计算 J 值
  const j = 3 * k - 2 * d;

  return {
    k: parseFloat(k.toFixed(2)),
    d: parseFloat(d.toFixed(2)),
    j: parseFloat(j.toFixed(2)),
    signal: k > 80 ? 'OVERBOUGHT' : k < 20 ? 'OVERSOLD' : k > d ? 'BULLISH' : 'BEARISH',
    crossover: k > d ? 'GOLDEN' : 'DEATH'
  };
}

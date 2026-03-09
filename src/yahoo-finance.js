/**
 * YahooClaw - Yahoo Finance API Integration for OpenClaw
 * 
 * @author PocketAI for Leo
 * @version 0.1.0
 * @description Real-time stock quotes, financial data, and market analysis
 */

import yahooFinance from 'yahoo-finance2';

/**
 * YahooClaw 类 - Yahoo Finance API 封装
 */
class YahooClaw {
  constructor(options = {}) {
    this.options = {
      lang: options.lang || 'zh-CN',
      region: options.region || 'US',
      ...options
    };
  }

  /**
   * 获取实时股价
   * @param {string} symbol - 股票代码 (如 AAPL, TSLA, 0700.HK)
   * @returns {Promise<Object>} 股价数据
   */
  async getQuote(symbol) {
    try {
      const quote = await yahooFinance.quote(symbol);
      
      return {
        success: true,
        data: {
          symbol: quote.symbol,
          name: quote.shortName || quote.longName,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          previousClose: quote.regularMarketPreviousClose,
          open: quote.regularMarketOpen,
          dayHigh: quote.regularMarketDayHigh,
          dayLow: quote.regularMarketDayLow,
          volume: quote.regularMarketVolume,
          marketCap: quote.marketCap,
          pe: quote.trailingPE,
          eps: quote.trailingEps,
          dividend: quote.trailingAnnualDividendRate,
          yield: quote.trailingAnnualDividendYield,
          currency: quote.currency,
          exchange: quote.exchange,
          marketState: quote.marketState,
          timestamp: new Date().toISOString()
        },
        message: `成功获取 ${symbol} 股价数据`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: `获取 ${symbol} 股价失败：${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * 获取历史股价数据
   * @param {string} symbol - 股票代码
   * @param {string} period - 时间周期 (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
   * @returns {Promise<Object>} 历史数据
   */
  async getHistory(symbol, period = '1mo') {
    try {
      const period1 = this._calculatePeriodStart(period);
      const history = await yahooFinance.chart(symbol, {
        period1: period1,
        interval: this._getInterval(period)
      });

      const quotes = history.quotes.map(q => ({
        date: q.date.toISOString().split('T')[0],
        open: q.open,
        high: q.high,
        low: q.low,
        close: q.close,
        volume: q.volume
      }));

      return {
        success: true,
        data: {
          symbol: symbol,
          period: period,
          quotes: quotes,
          count: quotes.length
        },
        message: `成功获取 ${symbol} 过去 ${period} 历史数据，共 ${quotes.length} 条记录`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: `获取 ${symbol} 历史数据失败：${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * 获取公司信息
   * @param {string} symbol - 股票代码
   * @returns {Promise<Object>} 公司信息
   */
  async getCompanyInfo(symbol) {
    try {
      const info = await yahooFinance.quote(symbol);
      
      return {
        success: true,
        data: {
          symbol: info.symbol,
          name: info.longName || info.shortName,
          sector: info.sector,
          industry: info.industry,
          website: info.website,
          description: info.longBusinessSummary,
          employees: info.fullTimeEmployees,
          marketCap: info.marketCap,
          enterpriseValue: info.enterpriseValue,
          pe: info.trailingPE,
          forwardPe: info.forwardPE,
          pb: info.priceToBook,
          ps: info.priceToSalesTrailing12Months,
          eps: info.trailingEps,
          beta: info.beta,
          fiftyTwoWeekHigh: info.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: info.fiftyTwoWeekLow,
          averageVolume: info.averageDailyVolume10Day,
          currency: info.currency,
          exchange: info.exchange
        },
        message: `成功获取 ${symbol} 公司信息`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: `获取 ${symbol} 公司信息失败：${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * 获取技术指标分析
   * @param {string} symbol - 股票代码
   * @param {string} period - 时间周期
   * @param {Array<string>} indicators - 技术指标列表 (MA, EMA, RSI, MACD, BOLL, KDJ)
   * @returns {Promise<Object>} 技术指标数据
   */
  async getTechnicalIndicators(symbol, period = '1mo', indicators = ['MA', 'RSI', 'MACD']) {
    try {
      // 获取历史数据
      const historyResult = await this.getHistory(symbol, period);
      
      if (!historyResult.success) {
        return historyResult;
      }

      const quotes = historyResult.data.quotes;
      const closes = quotes.map(q => q.close);
      const highs = quotes.map(q => q.high);
      const lows = quotes.map(q => q.low);
      const volumes = quotes.map(q => q.volume);

      const technicalData = {
        symbol: symbol,
        period: period,
        timestamp: new Date().toISOString(),
        indicators: {}
      };

      // 计算各个技术指标
      if (indicators.includes('MA')) {
        technicalData.indicators.MA = {
          MA5: this._calculateMA(closes, 5),
          MA10: this._calculateMA(closes, 10),
          MA20: this._calculateMA(closes, 20),
          MA50: this._calculateMA(closes, 50),
          MA200: this._calculateMA(closes, 200)
        };
      }

      if (indicators.includes('EMA')) {
        technicalData.indicators.EMA = {
          EMA12: this._calculateEMA(closes, 12),
          EMA26: this._calculateEMA(closes, 26),
          EMA50: this._calculateEMA(closes, 50)
        };
      }

      if (indicators.includes('RSI')) {
        technicalData.indicators.RSI = {
          RSI14: this._calculateRSI(closes, 14),
          signal: this._getRSISignal(this._calculateRSI(closes, 14))
        };
      }

      if (indicators.includes('MACD')) {
        technicalData.indicators.MACD = this._calculateMACD(closes);
      }

      if (indicators.includes('BOLL')) {
        technicalData.indicators.BOLL = this._calculateBollingerBands(closes);
      }

      if (indicators.includes('KDJ')) {
        technicalData.indicators.KDJ = this._calculateKDJ(highs, lows, closes);
      }

      if (indicators.includes('Volume')) {
        technicalData.indicators.Volume = {
          avgVolume: this._calculateMA(volumes, 20),
          currentVolume: volumes[volumes.length - 1],
          volumeRatio: volumes[volumes.length - 1] / this._calculateMA(volumes, 20)
        };
      }

      // 综合信号分析
      technicalData.analysis = this._getTechnicalAnalysis(technicalData.indicators);

      return {
        success: true,
        data: technicalData,
        message: `成功获取 ${symbol} 技术指标分析`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: `获取 ${symbol} 技术指标失败：${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * 计算简单移动平均线 (MA)
   * @private
   */
  _calculateMA(data, period) {
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
   * @private
   */
  _calculateEMA(data, period) {
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
   * @private
   */
  _calculateRSI(data, period = 14) {
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
   * @private
   */
  _getRSISignal(rsi) {
    if (rsi >= 70) return 'OVERBOUGHT';
    if (rsi <= 30) return 'OVERSOLD';
    if (rsi >= 50) return 'BULLISH';
    return 'BEARISH';
  }

  /**
   * 计算 MACD
   * @private
   */
  _calculateMACD(data) {
    const ema12 = this._calculateEMA(data, 12);
    const ema26 = this._calculateEMA(data, 26);

    if (!ema12 || !ema26) {
      return null;
    }

    const macdLine = ema12.value - ema26.value;
    
    // 计算信号线 (9 日 EMA)
    const macdValues = [];
    for (let i = 26; i < data.length; i++) {
      const slice = data.slice(0, i + 1);
      const e12 = this._calculateEMA(slice, 12);
      const e26 = this._calculateEMA(slice, 26);
      if (e12 && e26) {
        macdValues.push(e12.value - e26.value);
      }
    }

    const signalLine = this._calculateEMA(macdValues, 9);
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
   * 计算布林带 (Bollinger Bands)
   * @private
   */
  _calculateBollingerBands(data, period = 20, stdDev = 2) {
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
   * 计算 KDJ 指标
   * @private
   */
  _calculateKDJ(highs, lows, closes, period = 9) {
    if (closes.length < period) {
      return null;
    }

    const kValues = [];
    const dValues = [];
    const jValues = [];

    for (let i = period - 1; i < closes.length; i++) {
      const sliceHighs = highs.slice(i - period + 1, i + 1);
      const sliceLows = lows.slice(i - period + 1, i + 1);
      const sliceCloses = closes.slice(i - period + 1, i + 1);

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

  /**
   * 获取综合技术分析
   * @private
   */
  _getTechnicalAnalysis(indicators) {
    const signals = {
      bullish: 0,
      bearish: 0,
      neutral: 0
    };

    const details = [];

    // 分析 MA 趋势
    if (indicators.MA) {
      if (indicators.MA.MA5 && indicators.MA.MA5.trend === 'BULLISH') {
        signals.bullish++;
        details.push('MA5: 看涨');
      } else if (indicators.MA.MA5) {
        signals.bearish++;
        details.push('MA5: 看跌');
      }
    }

    // 分析 RSI
    if (indicators.RSI) {
      if (indicators.RSI.signal === 'OVERBOUGHT') {
        signals.bearish++;
        details.push(`RSI: 超买 (${indicators.RSI.RSI14})`);
      } else if (indicators.RSI.signal === 'OVERSOLD') {
        signals.bullish++;
        details.push(`RSI: 超卖 (${indicators.RSI.RSI14})`);
      } else if (indicators.RSI.signal === 'BULLISH') {
        signals.bullish++;
        details.push('RSI: 看涨');
      } else {
        signals.bearish++;
        details.push('RSI: 看跌');
      }
    }

    // 分析 MACD
    if (indicators.MACD) {
      if (indicators.MACD.trend === 'BULLISH') {
        signals.bullish++;
        details.push('MACD: 看涨');
      } else {
        signals.bearish++;
        details.push('MACD: 看跌');
      }
      
      if (indicators.MACD.crossover === 'GOLDEN') {
        signals.bullish++;
        details.push('MACD: 金叉');
      } else if (indicators.MACD.crossover === 'DEATH') {
        signals.bearish++;
        details.push('MACD: 死叉');
      }
    }

    // 分析布林带
    if (indicators.BOLL) {
      if (indicators.BOLL.position === 'OVERSOLD') {
        signals.bullish++;
        details.push('布林带: 超卖');
      } else if (indicators.BOLL.position === 'OVERBOUGHT') {
        signals.bearish++;
        details.push('布林带: 超买');
      }
    }

    // 分析 KDJ
    if (indicators.KDJ) {
      if (indicators.KDJ.signal === 'OVERSOLD' || indicators.KDJ.crossover === 'GOLDEN') {
        signals.bullish++;
        details.push('KDJ: 看涨信号');
      } else if (indicators.KDJ.signal === 'OVERBOUGHT' || indicators.KDJ.crossover === 'DEATH') {
        signals.bearish++;
        details.push('KDJ: 看跌信号');
      }
    }

    // 综合判断
    let overallSignal = 'NEUTRAL';
    let confidence = 0;

    const total = signals.bullish + signals.bearish;
    if (total > 0) {
      const bullishPercent = signals.bullish / total;
      
      if (bullishPercent >= 0.7) {
        overallSignal = 'STRONG_BUY';
        confidence = Math.round(bullishPercent * 100);
      } else if (bullishPercent >= 0.6) {
        overallSignal = 'BUY';
        confidence = Math.round(bullishPercent * 100);
      } else if (bullishPercent <= 0.3) {
        overallSignal = 'STRONG_SELL';
        confidence = Math.round((1 - bullishPercent) * 100);
      } else if (bullishPercent <= 0.4) {
        overallSignal = 'SELL';
        confidence = Math.round((1 - bullishPercent) * 100);
      } else {
        overallSignal = 'NEUTRAL';
        confidence = 50;
      }
    }

    return {
      signal: overallSignal,
      confidence: confidence,
      bullish: signals.bullish,
      bearish: signals.bearish,
      neutral: signals.neutral,
      details: details,
      recommendation: this._getRecommendation(overallSignal, confidence)
    };
  }

  /**
   * 获取投资建议
   * @private
   */
  _getRecommendation(signal, confidence) {
    const recommendations = {
      'STRONG_BUY': `强烈建议买入 (置信度：${confidence}%) - 多个技术指标显示上涨信号`,
      'BUY': `建议买入 (置信度：${confidence}%) - 多数技术指标看涨`,
      'NEUTRAL': `观望 - 技术指标分化，建议等待更明确信号`,
      'SELL': `建议卖出 (置信度：${confidence}%) - 多数技术指标看跌`,
      'STRONG_SELL': `强烈建议卖出 (置信度：${confidence}%) - 多个技术指标显示下跌信号`
    };

    return recommendations[signal] || recommendations['NEUTRAL'];
  }

  /**
   * 获取财务报表（简化版）
   * @param {string} symbol - 股票代码
   * @param {string} type - 报表类型 (balance, income, cashflow)
   * @returns {Promise<Object>} 财务数据
   */
  async getFinancials(symbol, type = 'income') {
    try {
      let financials;
      
      switch (type) {
        case 'balance':
          financials = await yahooFinance.balanceSheet(symbol);
          break;
        case 'cashflow':
          financials = await yahooFinance.cashflow(symbol);
          break;
        case 'income':
        default:
          financials = await yahooFinance.incomeStatement(symbol);
          break;
      }

      return {
        success: true,
        data: {
          symbol: symbol,
          type: type,
          financials: financials,
          timestamp: new Date().toISOString()
        },
        message: `成功获取 ${symbol} ${type} 报表`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: `获取 ${symbol} 财务报表失败：${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * 搜索股票
   * @param {string} query - 搜索关键词
   * @returns {Promise<Object>} 搜索结果
   */
  async search(query) {
    try {
      const results = await yahooFinance.search(query);
      
      const quotes = results.quotes.map(q => ({
        symbol: q.symbol,
        name: q.shortname || q.longname,
        exchange: q.exchange,
        type: q.quoteType
      }));

      return {
        success: true,
        data: {
          query: query,
          results: quotes,
          count: quotes.length
        },
        message: `搜索 "${query}" 找到 ${quotes.length} 个结果`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: `搜索 "${query}" 失败：${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * 计算周期起始时间
   * @private
   */
  _calculatePeriodStart(period) {
    const now = new Date();
    const periods = {
      '1d': 1,
      '5d': 5,
      '1mo': 30,
      '3mo': 90,
      '6mo': 180,
      '1y': 365,
      '2y': 730,
      '5y': 1825,
      '10y': 3650,
      'ytd': this._getDaysSinceYearStart(),
      'max': 36500
    };
    
    const days = periods[period] || 30;
    now.setDate(now.getDate() - days);
    return now;
  }

  /**
   * 获取时间间隔
   * @private
   */
  _getInterval(period) {
    const intervals = {
      '1d': '1m',
      '5d': '15m',
      '1mo': '1d',
      '3mo': '1d',
      '6mo': '1d',
      '1y': '1d',
      '2y': '1d',
      '5y': '1wk',
      '10y': '1mo',
      'ytd': '1d',
      'max': '1mo'
    };
    
    return intervals[period] || '1d';
  }

  /**
   * 获取新闻聚合（支持多源）
   * @param {string} symbol - 股票代码
   * @param {Object} options - 选项
   * @param {number} options.limit - 新闻数量限制（默认 10）
   * @param {Array<string>} options.sources - 新闻源列表（yahoo, google, seekingalpha）
   * @param {string} options.sentiment - 情感分析（true/false）
   * @returns {Promise<Object>} 新闻数据
   */
  async getNews(symbol, options = {}) {
    try {
      const {
        limit = 10,
        sources = ['yahoo'],
        sentiment = true
      } = options;

      const allNews = [];

      // 获取 Yahoo Finance 新闻
      if (sources.includes('yahoo')) {
        const yahooNews = await this._getYahooNews(symbol, limit);
        allNews.push(...yahooNews);
      }

      // 获取 Google News 新闻
      if (sources.includes('google')) {
        const googleNews = await this._getGoogleNews(symbol, limit);
        allNews.push(...googleNews);
      }

      // 获取 Seeking Alpha 新闻
      if (sources.includes('seekingalpha')) {
        const saNews = await this._getSeekingAlphaNews(symbol, limit);
        allNews.push(...saNews);
      }

      // 情感分析
      if (sentiment) {
        for (let news of allNews) {
          news.sentiment = this._analyzeSentiment(news.title + ' ' + (news.summary || ''));
        }
      }

      // 按时间排序
      allNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      // 限制数量
      const limitedNews = allNews.slice(0, limit);

      // 统计情感分布
      const sentimentStats = this._getSentimentStats(limitedNews);

      return {
        success: true,
        data: {
          symbol: symbol,
          news: limitedNews,
          count: limitedNews.length,
          sources: sources,
          sentimentStats: sentimentStats,
          overallSentiment: this._getOverallSentiment(sentimentStats),
          timestamp: new Date().toISOString()
        },
        message: `成功获取 ${symbol} 新闻，共 ${limitedNews.length} 条`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: `获取 ${symbol} 新闻失败：${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * 获取 Yahoo Finance 新闻
   * @private
   */
  async _getYahooNews(symbol, limit = 10) {
    try {
      const news = await yahooFinance.search(symbol, { newsCount: limit });
      
      return news.news.map(n => ({
        title: n.title,
        summary: n.summary,
        source: 'yahoo',
        publisher: n.publisher,
        link: n.link,
        publishedAt: n.providerPublishTime ? new Date(n.providerPublishTime * 1000).toISOString() : new Date().toISOString(),
        thumbnail: n.thumbnail ? n.thumbnail.resolutions[0]?.url : null,
        type: n.type,
        uuid: n.uuid
      }));
    } catch (error) {
      console.error(`Yahoo News error for ${symbol}:`, error.message);
      return [];
    }
  }

  /**
   * 获取 Google News 新闻
   * @private
   */
  async _getGoogleNews(symbol, limit = 10) {
    try {
      // 使用 RSS  feed 或搜索 API（这里简化处理）
      // 实际项目中可以使用 google-news-api 或类似服务
      const query = encodeURIComponent(`${symbol} stock news`);
      const googleNewsUrl = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
      
      // 注意：实际使用中需要解析 RSS feed
      // 这里返回空数组，实际项目需要实现 RSS 解析
      return [];
    } catch (error) {
      console.error(`Google News error for ${symbol}:`, error.message);
      return [];
    }
  }

  /**
   * 获取 Seeking Alpha 新闻
   * @private
   */
  async _getSeekingAlphaNews(symbol, limit = 10) {
    try {
      // Seeking Alpha 需要 API key 或网页爬取
      // 这里返回空数组，实际项目需要实现
      return [];
    } catch (error) {
      console.error(`Seeking Alpha News error for ${symbol}:`, error.message);
      return [];
    }
  }

  /**
   * 情感分析（简化版）
   * @private
   */
  _analyzeSentiment(text) {
    const positiveWords = [
      'beat', 'surge', 'soar', 'jump', 'rise', 'gain', 'growth', 'profit', 
      'bullish', 'upgrade', 'outperform', 'buy', 'strong', 'record', 'high',
      'positive', 'optimistic', 'exceed', 'outlook', 'rally', 'boom'
    ];
    
    const negativeWords = [
      'miss', 'drop', 'fall', 'decline', 'loss', 'bearish', 'downgrade',
      'sell', 'weak', 'low', 'negative', 'pessimistic', 'fail', 'crash',
      'plunge', 'slump', 'warning', 'risk', 'concern', 'lawsuit', 'investigation'
    ];

    const textLower = text.toLowerCase();
    
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      if (textLower.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (textLower.includes(word)) negativeCount++;
    });

    const total = positiveCount + negativeCount;
    
    if (total === 0) {
      return {
        label: 'NEUTRAL',
        score: 0.5,
        positive: 0,
        negative: 0
      };
    }

    const score = positiveCount / total;
    let label = 'NEUTRAL';
    
    if (score >= 0.6) label = 'POSITIVE';
    else if (score <= 0.4) label = 'NEGATIVE';

    return {
      label: label,
      score: parseFloat(score.toFixed(2)),
      positive: positiveCount,
      negative: negativeCount
    };
  }

  /**
   * 获取情感统计
   * @private
   */
  _getSentimentStats(news) {
    const stats = {
      positive: 0,
      negative: 0,
      neutral: 0,
      total: news.length
    };

    news.forEach(n => {
      if (n.sentiment) {
        if (n.sentiment.label === 'POSITIVE') stats.positive++;
        else if (n.sentiment.label === 'NEGATIVE') stats.negative++;
        else stats.neutral++;
      }
    });

    return stats;
  }

  /**
   * 获取整体情感倾向
   * @private
   */
  _getOverallSentiment(stats) {
    if (stats.total === 0) return 'NEUTRAL';
    
    const positiveRatio = stats.positive / stats.total;
    const negativeRatio = stats.negative / stats.total;
    
    if (positiveRatio >= 0.6) return 'BULLISH';
    if (negativeRatio >= 0.6) return 'BEARISH';
    if (positiveRatio >= 0.4) return 'SLIGHTLY_BULLISH';
    if (negativeRatio >= 0.4) return 'SLIGHTLY_BEARISH';
    return 'NEUTRAL';
  }

  /**
   * 获取热门新闻主题
   * @param {string} symbol - 股票代码
   * @returns {Promise<Object>} 热门主题
   */
  async getNewsTopics(symbol) {
    try {
      const newsResult = await this.getNews(symbol, { limit: 20, sentiment: false });
      
      if (!newsResult.success) {
        return newsResult;
      }

      const news = newsResult.data.news;
      const topics = {};

      // 提取关键词
      const keywords = [
        'earnings', 'revenue', 'profit', 'dividend', 'stock split',
        'acquisition', 'merger', 'layoff', 'CEO', 'product',
        'lawsuit', 'investigation', 'upgrade', 'downgrade', 'price target',
        'AI', 'electric vehicle', 'semiconductor', 'cloud', '5G'
      ];

      news.forEach(n => {
        const text = (n.title + ' ' + (n.summary || '')).toLowerCase();
        
        keywords.forEach(keyword => {
          if (text.includes(keyword)) {
            if (!topics[keyword]) {
              topics[keyword] = {
                count: 0,
                articles: []
              };
            }
            topics[keyword].count++;
            topics[keyword].articles.push({
              title: n.title,
              link: n.link,
              publishedAt: n.publishedAt
            });
          }
        });
      });

      // 按数量排序
      const sortedTopics = Object.entries(topics)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10);

      return {
        success: true,
        data: {
          symbol: symbol,
          topics: sortedTopics.map(([topic, data]) => ({
            topic: topic,
            count: data.count,
            articles: data.articles.slice(0, 3) // 每个主题只显示 3 篇
          })),
          timestamp: new Date().toISOString()
        },
        message: `成功获取 ${symbol} 热门新闻主题`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: `获取 ${symbol} 新闻主题失败：${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * 获取股息分红历史
   * @param {string} symbol - 股票代码
   * @returns {Promise<Object>} 股息数据
   */
  async getDividends(symbol) {
    try {
      const dividends = await yahooFinance.dividends(symbol);
      
      const dividendHistory = dividends.map(d => ({
        date: d.date.toISOString().split('T')[0],
        amount: d.amount,
        currency: d.currency || 'USD'
      }));

      const totalDividends = dividendHistory.reduce((sum, d) => sum + d.amount, 0);

      return {
        success: true,
        data: {
          symbol: symbol,
          dividends: dividendHistory,
          count: dividendHistory.length,
          totalAmount: totalDividends,
          latestDividend: dividendHistory[dividendHistory.length - 1]
        },
        message: `成功获取 ${symbol} 股息数据，共 ${dividendHistory.length} 条记录`
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: `获取 ${symbol} 股息数据失败：${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * 获取年初至今的天数
   * @private
   */
  _getDaysSinceYearStart() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}

// 导出默认实例
const yahooclaw = new YahooClaw();

export default yahooclaw;
export { YahooClaw };

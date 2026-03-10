/**
 * YahooClaw - Yahoo Finance API Integration for OpenClaw
 * 
 * @author PocketAI for Leo
 * @version 0.2.0 (Refactored)
 * @description Real-time stock quotes, financial data, and market analysis
 */

import yahooFinance from 'yahoo-finance2';

// 导入模块
import { getQuote, getQuotes } from './modules/quote.js';
import {
  calculateMA,
  calculateEMA,
  calculateRSI,
  getRSISignal,
  calculateMACD,
  calculateBollingerBands,
  calculateKDJ
} from './modules/technical.js';
import {
  getYahooNews,
  analyzeSentiment,
  getSentimentStats,
  getOverallSentiment,
  extractNewsTopics
} from './modules/news.js';

/**
 * YahooClaw 主类
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
   * 获取实时股价（委托给 quote 模块）
   */
  async getQuote(symbol) {
    return getQuote(symbol);
  }

  /**
   * 获取批量股价（委托给 quote 模块）
   */
  async getQuotes(symbols) {
    return getQuotes(symbols);
  }

  /**
   * 获取历史数据
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
   * 获取技术指标分析
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
          MA5: calculateMA(closes, 5),
          MA10: calculateMA(closes, 10),
          MA20: calculateMA(closes, 20),
          MA50: calculateMA(closes, 50),
          MA200: calculateMA(closes, 200)
        };
      }

      if (indicators.includes('EMA')) {
        technicalData.indicators.EMA = {
          EMA12: calculateEMA(closes, 12),
          EMA26: calculateEMA(closes, 26),
          EMA50: calculateEMA(closes, 50)
        };
      }

      if (indicators.includes('RSI')) {
        const rsi = calculateRSI(closes, 14);
        technicalData.indicators.RSI = {
          RSI14: rsi,
          signal: getRSISignal(rsi)
        };
      }

      if (indicators.includes('MACD')) {
        technicalData.indicators.MACD = calculateMACD(closes);
      }

      if (indicators.includes('BOLL')) {
        technicalData.indicators.BOLL = calculateBollingerBands(closes);
      }

      if (indicators.includes('KDJ')) {
        technicalData.indicators.KDJ = calculateKDJ(highs, lows, closes);
      }

      if (indicators.includes('Volume')) {
        technicalData.indicators.Volume = {
          avgVolume: calculateMA(volumes, 20),
          currentVolume: volumes[volumes.length - 1],
          volumeRatio: volumes[volumes.length - 1] / calculateMA(volumes, 20)
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
   * 获取新闻（委托给 news 模块）
   */
  async getNews(symbol, options = {}) {
    const {
      limit = 10,
      sources = ['yahoo'],
      sentiment = true
    } = options;

    const allNews = [];

    // 获取 Yahoo Finance 新闻
    if (sources.includes('yahoo')) {
      const yahooNews = await getYahooNews(symbol, limit);
      allNews.push(...yahooNews);
    }

    // 情感分析
    if (sentiment) {
      for (let news of allNews) {
        news.sentiment = analyzeSentiment(news.title + ' ' + (news.summary || ''));
      }
    }

    // 按时间排序
    allNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    // 限制数量
    const limitedNews = allNews.slice(0, limit);

    // 统计情感分布
    const sentimentStats = getSentimentStats(limitedNews);

    return {
      success: true,
      data: {
        symbol: symbol,
        news: limitedNews,
        count: limitedNews.length,
        sources: sources,
        sentimentStats: sentimentStats,
        overallSentiment: getOverallSentiment(sentimentStats),
        timestamp: new Date().toISOString()
      },
      message: `成功获取 ${symbol} 新闻，共 ${limitedNews.length} 条`
    };
  }

  /**
   * 获取新闻主题（委托给 news 模块）
   */
  async getNewsTopics(symbol) {
    try {
      const newsResult = await this.getNews(symbol, { limit: 20, sentiment: false });
      
      if (!newsResult.success) {
        return newsResult;
      }

      const topics = extractNewsTopics(newsResult.data.news);

      return {
        success: true,
        data: {
          symbol: symbol,
          topics: topics,
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
   * 获取股息分红
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
   * 获取公司信息
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
   * 搜索股票
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
   * 综合技术分析（内部方法）
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
        details.push('布林带：超卖');
      } else if (indicators.BOLL.position === 'OVERBOUGHT') {
        signals.bearish++;
        details.push('布林带：超买');
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
   * 计算周期起始时间
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
   * 获取年初至今的天数
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

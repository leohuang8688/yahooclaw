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

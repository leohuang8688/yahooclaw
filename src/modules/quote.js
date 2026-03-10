/**
 * Quote 模块 - 实时股价查询
 * @module modules/quote
 */

import yahooFinance from 'yahoo-finance2';

/**
 * 获取实时股价
 * @param {string} symbol - 股票代码
 * @returns {Promise<Object>} 股价数据
 */
export async function getQuote(symbol) {
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
 * 获取多个股票的批量报价
 * @param {Array<string>} symbols - 股票代码数组
 * @returns {Promise<Object>} 批量股价数据
 */
export async function getQuotes(symbols) {
  try {
    const results = await Promise.all(
      symbols.map(symbol => getQuote(symbol))
    );
    
    const successCount = results.filter(r => r.success).length;
    
    return {
      success: successCount > 0,
      data: {
        quotes: results.filter(r => r.success).map(r => r.data),
        total: symbols.length,
        success: successCount,
        failed: symbols.length - successCount
      },
      message: `批量获取 ${symbols.length} 只股票，成功 ${successCount} 只`
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: `批量获取失败：${error.message}`,
      error: error.message
    };
  }
}

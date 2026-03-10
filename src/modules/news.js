/**
 * News 模块 - 新闻聚合和情感分析
 * @module modules/news
 */

import yahooFinance from 'yahoo-finance2';

/**
 * 情感分析关键词
 */
const SENTIMENT_KEYWORDS = {
  positive: [
    'beat', 'surge', 'soar', 'jump', 'rise', 'gain', 'growth', 'profit', 
    'bullish', 'upgrade', 'outperform', 'buy', 'strong', 'record', 'high',
    'positive', 'optimistic', 'exceed', 'outlook', 'rally', 'boom'
  ],
  negative: [
    'miss', 'drop', 'fall', 'decline', 'loss', 'bearish', 'downgrade',
    'sell', 'weak', 'low', 'negative', 'pessimistic', 'fail', 'crash',
    'plunge', 'slump', 'warning', 'risk', 'concern', 'lawsuit', 'investigation'
  ]
};

/**
 * 获取 Yahoo Finance 新闻
 * @param {string} symbol - 股票代码
 * @param {number} limit - 数量限制
 * @returns {Promise<Array>} 新闻数组
 */
export async function getYahooNews(symbol, limit = 10) {
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
 * 情感分析
 * @param {string} text - 文本
 * @returns {Object} 情感数据
 */
export function analyzeSentiment(text) {
  const textLower = text.toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;

  SENTIMENT_KEYWORDS.positive.forEach(word => {
    if (textLower.includes(word)) positiveCount++;
  });

  SENTIMENT_KEYWORDS.negative.forEach(word => {
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
 * @param {Array<Object>} news - 新闻数组
 * @returns {Object} 统计数据
 */
export function getSentimentStats(news) {
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
 * @param {Object} stats - 情感统计
 * @returns {string} 整体倾向
 */
export function getOverallSentiment(stats) {
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
 * 提取新闻主题
 * @param {Array<Object>} news - 新闻数组
 * @returns {Object} 主题数据
 */
export function extractNewsTopics(news) {
  const topics = {};
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
  return Object.entries(topics)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([topic, data]) => ({
      topic: topic,
      count: data.count,
      articles: data.articles.slice(0, 3)
    }));
}

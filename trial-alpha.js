/**
 * YahooClaw 技能试用（使用 Alpha Vantage）
 * 演示备用 API 功能
 */

import { AlphaVantageAPI } from './src/api/AlphaVantage.js';

console.log('🦞 YahooClaw v0.0.2 技能试用\n');
console.log('=' .repeat(60));
console.log('数据源：Alpha Vantage API (500 次/天免费)\n');

const alphaVantage = new AlphaVantageAPI({
  apiKey: '9Z6PTPL7AB5M5DN3'
});

// 演示 1: 股价查询
console.log('📈 1. 实时股价查询');
console.log('-'.repeat(60));

const stocks = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL'];

for (const symbol of stocks) {
  try {
    const quote = await alphaVantage.getQuote(symbol);
    if (quote.success) {
      const changeIcon = quote.data.change >= 0 ? '📈' : '📉';
      console.log(`${changeIcon} ${symbol}`);
      console.log(`   价格：$${quote.data.price.toFixed(2)}`);
      console.log(`   涨跌：${quote.data.change >= 0 ? '+' : ''}${quote.data.change.toFixed(2)} (${quote.data.changePercent})`);
      console.log(`   开盘：$${quote.data.open}`);
      console.log(`   最高：$${quote.data.high}`);
      console.log(`   最低：$${quote.data.low}`);
      console.log('');
    } else {
      console.log(`⚠️  ${symbol}: ${quote.message}\n`);
    }
  } catch (error) {
    console.log(`❌ ${symbol}: ${error.message}\n`);
  }
}

// 演示 2: 历史数据
console.log('📊 2. 历史数据查询');
console.log('-'.repeat(60));

try {
  const history = await alphaVantage.getHistory('AAPL', '1mo');
  
  if (history.success && history.data.quotes.length > 0) {
    console.log(`✅ AAPL 历史数据 (${history.data.count} 条记录):\n`);
    console.log('日期        | 开盘    | 最高    | 最低    | 收盘    | 成交量');
    console.log('-'.repeat(60));
    
    // 显示最近 5 天
    const recentDays = history.data.quotes.slice(0, 5);
    recentDays.forEach(day => {
      console.log(`${day.date} | $${day.open.toFixed(2)} | $${day.high.toFixed(2)} | $${day.low.toFixed(2)} | $${day.close.toFixed(2)} | ${(day.volume / 1000000).toFixed(1)}M`);
    });
  } else {
    console.log(`⚠️  暂时无法获取历史数据`);
  }
} catch (error) {
  console.log(`❌ 错误：${error.message}`);
}

// 总结
console.log('\n' + '='.repeat(60));
console.log('✅ 演示完成！\n');
console.log('💡 使用说明:');
console.log('   在 OpenClaw 对话中直接说:');
console.log('   • "查询 AAPL 股价"');
console.log('   • "显示 TSLA 历史数据"');
console.log('   • "分析 NVDA 技术指标"');
console.log('');
console.log('⚠️  注意事项:');
console.log('   • Alpha Vantage 免费额度：500 次/天');
console.log('   • Yahoo Finance 限流解除后自动切换');
console.log('   • 缓存有效期：5 分钟（减少 API 调用）');
console.log('=' .repeat(60));

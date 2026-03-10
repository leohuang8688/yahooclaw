/**
 * YahooClaw 备用 API 测试
 * 测试 Alpha Vantage API 是否正常工作
 */

import { config } from 'dotenv';
config();

import { AlphaVantageAPI } from './src/api/AlphaVantage.js';

console.log('🦞 YahooClaw 备用 API 测试\n');
console.log('=' .repeat(60));

const api = new AlphaVantageAPI({
  apiKey: process.env.ALPHA_VANTAGE_API_KEY
});

let passed = 0;
let failed = 0;

// 测试 1: 实时股价
console.log('\n📈 测试 1: AAPL 实时股价');
try {
  const aapl = await api.getQuote('AAPL');
  
  if (aapl.success) {
    console.log(`✅ AAPL: $${aapl.data.price}`);
    console.log(`   涨跌：${aapl.data.change > 0 ? '+' : ''}${aapl.data.change}`);
    console.log(`   数据源：Alpha Vantage`);
    passed++;
  } else {
    console.log(`❌ 失败：${aapl.message}`);
    failed++;
  }
} catch (error) {
  console.log(`❌ 错误：${error.message}`);
  failed++;
}

// 测试 2: TSLA 股价
console.log('\n🚗 测试 2: TSLA 实时股价');
try {
  const tsla = await api.getQuote('TSLA');
  
  if (tsla.success) {
    console.log(`✅ TSLA: $${tsla.data.price}`);
    console.log(`   涨跌：${tsla.data.change > 0 ? '+' : ''}${tsla.data.change}`);
    passed++;
  } else {
    console.log(`❌ 失败：${tsla.message}`);
    failed++;
  }
} catch (error) {
  console.log(`❌ 错误：${error.message}`);
  failed++;
}

// 测试 3: NVDA 历史数据
console.log('\n📊 测试 3: NVDA 历史数据');
try {
  const nvda = await api.getHistory('NVDA', '1mo');
  
  if (nvda.success && nvda.data.quotes.length > 0) {
    console.log(`✅ NVDA: ${nvda.data.quotes.length} 条历史记录`);
    const last = nvda.data.quotes[0];
    console.log(`   最新：${last.date} 收盘 $${last.close}`);
    passed++;
  } else {
    console.log(`❌ 失败：${nvda.message}`);
    failed++;
  }
} catch (error) {
  console.log(`❌ 错误：${error.message}`);
  failed++;
}

// 测试 4: 技术指标
console.log('\n📉 测试 4: AMD 技术指标（RSI）');
try {
  const amd = await api.getTechnicalIndicator('AMD', 'RSI', { interval: 'daily', time_period: 14 });
  
  if (amd.success) {
    console.log(`✅ AMD RSI 指标`);
    if (amd.data['Technical Analysis: RSI']) {
      const dates = Object.keys(amd.data['Technical Analysis: RSI']);
      const latest = amd.data['Technical Analysis: RSI'][dates[0]];
      console.log(`   RSI: ${latest.RSI}`);
      console.log(`   数据源：Alpha Vantage`);
    }
    passed++;
  } else {
    console.log(`❌ 失败：${amd.message}`);
    failed++;
  }
} catch (error) {
  console.log(`❌ 错误：${error.message}`);
  failed++;
}

// 测试结果
console.log('\n' + '='.repeat(60));
console.log(`✅ 通过：${passed}`);
console.log(`❌ 失败：${failed}`);
if (passed + failed > 0) {
  console.log(`📊 成功率：${((passed / (passed + failed)) * 100).toFixed(1)}%`);
}
console.log('='.repeat(60));

if (failed === 0) {
  console.log('\n🎉 所有测试通过！Alpha Vantage API 工作正常！');
  console.log('\n💡 提示：');
  console.log('   - 免费额度：500 次/天');
  console.log('   - 当前限制：5 次/分钟');
  console.log('   - 建议：启用缓存减少请求');
} else {
  console.log(`\n⚠️ 有 ${failed} 个测试失败`);
  if (failed > 0) {
    console.log('\n💡 提示：');
    console.log('   - API Key 可能需要几分钟激活');
    console.log('   - 检查 Alpha Vantage 账户状态');
    console.log('   - 稍等 5 分钟后重试');
  }
}

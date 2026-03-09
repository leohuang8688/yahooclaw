# 🦞 YahooClaw - Yahoo Finance API for OpenClaw

> 让 OpenClaw 能直接查询股票行情、财务数据和市场分析

[![npm version](https://img.shields.io/npm/v/yahooclaw.svg)](https://www.npmjs.com/package/yahooclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenClaw Skill](https://img.shields.io/badge/OpenClaw-Skill-blue)](https://github.com/openclaw/openclaw)

---

## 📖 简介

**YahooClaw** 是一个为 OpenClaw 设计的 Yahoo Finance API 集成技能，让你可以直接通过 OpenClaw agent 查询：

- 📈 **实时股价** - 美股、港股、A 股等全球市场
- 📊 **历史数据** - 支持多种时间周期
- 💰 **股息分红** - 完整的分红历史
- 📉 **财务报表** - 资产负债表、利润表、现金流
- 🔍 **股票搜索** - 快速查找股票代码

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd /root/.openclaw/workspace/skills/yahooclaw
npm install
```

### 2. 在 OpenClaw 中使用

```javascript
// 在你的 OpenClaw agent 中导入
import yahooclaw from './skills/yahooclaw/src/yahoo-finance.js';

// 查询股价
const aapl = await yahooclaw.getQuote('AAPL');
console.log(aapl.data.price);

// 查询历史数据
const tsla = await yahooclaw.getHistory('TSLA', '1mo');
console.log(tsla.data.quotes);

// 查询公司信息
const msft = await yahooclaw.getCompanyInfo('MSFT');
console.log(msft.data.marketCap);
```

### 3. 通过 OpenClaw 对话使用

```
用户：查询苹果股价
PocketAI: 好的，正在查询 AAPL...
        苹果公司 (AAPL) 当前股价：$175.43
        涨跌：+$2.15 (+1.24%)
        市值：2.73 万亿美元
```

---

## 📚 API 文档

### getQuote(symbol)

获取实时股价

**参数：**
- `symbol` (string): 股票代码，如 'AAPL', 'TSLA', '0700.HK'

**返回：**
```javascript
{
  success: true,
  data: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.43,
    change: 2.15,
    changePercent: 1.24,
    previousClose: 173.28,
    open: 173.50,
    dayHigh: 176.00,
    dayLow: 173.00,
    volume: 52000000,
    marketCap: 2730000000000,
    pe: 28.5,
    eps: 6.15,
    dividend: 0.96,
    yield: 0.0055,
    currency: 'USD',
    exchange: 'NMS',
    marketState: 'REGULAR',
    timestamp: '2026-03-09T12:00:00.000Z'
  },
  message: '成功获取 AAPL 股价数据'
}
```

**示例：**
```javascript
const quote = await yahooclaw.getQuote('AAPL');
console.log(`AAPL: $${quote.data.price}`);
```

---

### getHistory(symbol, period)

获取历史股价数据

**参数：**
- `symbol` (string): 股票代码
- `period` (string): 时间周期，可选值：
  - '1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'ytd', 'max'

**返回：**
```javascript
{
  success: true,
  data: {
    symbol: 'TSLA',
    period: '1mo',
    quotes: [
      {
        date: '2026-02-09',
        open: 280.50,
        high: 285.00,
        low: 278.00,
        close: 282.30,
        volume: 45000000
      },
      // ...
    ],
    count: 30
  },
  message: '成功获取 TSLA 过去 1mo 历史数据，共 30 条记录'
}
```

**示例：**
```javascript
const history = await yahooclaw.getHistory('TSLA', '3mo');
history.data.quotes.forEach(q => {
  console.log(`${q.date}: $${q.close}`);
});
```

---

### getCompanyInfo(symbol)

获取公司信息

**参数：**
- `symbol` (string): 股票代码

**返回：**
```javascript
{
  success: true,
  data: {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology',
    industry: 'Software—Infrastructure',
    website: 'https://www.microsoft.com',
    description: 'Microsoft Corporation develops...',
    employees: 221000,
    marketCap: 3100000000000,
    enterpriseValue: 3050000000000,
    pe: 35.2,
    forwardPe: 30.5,
    pb: 12.8,
    ps: 11.5,
    eps: 11.20,
    beta: 0.90,
    fiftyTwoWeekHigh: 420.00,
    fiftyTwoWeekLow: 310.00,
    averageVolume: 25000000,
    currency: 'USD',
    exchange: 'NMS'
  },
  message: '成功获取 MSFT 公司信息'
}
```

---

### getDividends(symbol)

获取股息分红历史

**参数：**
- `symbol` (string): 股票代码

**返回：**
```javascript
{
  success: true,
  data: {
    symbol: 'AAPL',
    dividends: [
      { date: '2025-11-10', amount: 0.24, currency: 'USD' },
      { date: '2025-08-12', amount: 0.24, currency: 'USD' },
      // ...
    ],
    count: 50,
    totalAmount: 12.50,
    latestDividend: { date: '2025-11-10', amount: 0.24 }
  },
  message: '成功获取 AAPL 股息数据，共 50 条记录'
}
```

---

### getFinancials(symbol, type)

获取财务报表

**参数：**
- `symbol` (string): 股票代码
- `type` (string): 报表类型
  - 'income' - 利润表（默认）
  - 'balance' - 资产负债表
  - 'cashflow' - 现金流量表

**返回：**
```javascript
{
  success: true,
  data: {
    symbol: 'AAPL',
    type: 'income',
    financials: {
      // 财务报表数据
    },
    timestamp: '2026-03-09T12:00:00.000Z'
  },
  message: '成功获取 AAPL income 报表'
}
```

---

### search(query)

搜索股票

**参数：**
- `query` (string): 搜索关键词

**返回：**
```javascript
{
  success: true,
  data: {
    query: '腾讯',
    results: [
      { symbol: '0700.HK', name: 'Tencent Holdings', exchange: 'HKG', type: 'EQUITY' },
      { symbol: 'TCEHY', name: 'Tencent Holdings Ltd ADR', exchange: 'PNK', type: 'EQUITY' }
    ],
    count: 2
  },
  message: '搜索 "腾讯" 找到 2 个结果'
}
```

---

## 🌍 支持的股票市场

| 市场 | 代码格式 | 示例 |
|------|---------|------|
| **美股** | SYMBOL | AAPL, TSLA, NVDA |
| **港股** | SYMBOL.HK | 0700.HK, 9988.HK |
| **A 股** | SYMBOL.SS / SYMBOL.SZ | 600519.SS, 000001.SZ |
| **台股** | SYMBOL.TW | 2330.TW |
| **日股** | SYMBOL.T | 7203.T |
| **英股** | SYMBOL.L | HSBA.L |

---

## 🔧 配置选项

### 环境变量

```bash
# .env 文件
YAHOO_FINANCE_API_KEY=your_api_key_here  # 可选
HTTP_PROXY=http://proxy.example.com:8080  # 可选
HTTPS_PROXY=https://proxy.example.com:8080  # 可选
```

### 构造函数选项

```javascript
const yahooclaw = new YahooClaw({
  lang: 'zh-CN',  // 语言
  region: 'US'    // 地区
});
```

---

## ⚠️ 注意事项

1. **数据延迟**：Yahoo Finance 实时数据可能有 15 分钟延迟
2. **请求限制**：建议控制请求频率（< 100 次/小时）
3. **非商业用途**：Yahoo Finance API 仅供个人/研究使用
4. **错误处理**：始终检查 `success` 字段

---

## 🐛 故障排除

### 常见问题

**Q: 获取数据失败**
```javascript
// 检查股票代码格式
await yahooclaw.getQuote('AAPL');      // ✅ 正确
await yahooclaw.getQuote('AAPL.US');   // ❌ 错误
```

**Q: A 股/港股代码格式**
```javascript
// A 股
await yahooclaw.getQuote('600519.SS');  // 贵州茅台
await yahooclaw.getQuote('000001.SZ');  // 平安银行

// 港股
await yahooclaw.getQuote('0700.HK');    // 腾讯控股
await yahooclaw.getQuote('9988.HK');    // 阿里巴巴
```

**Q: 数据延迟**
- 这是正常现象
- 考虑使用付费 API 获取真正实时数据

---

## 📝 更新日志

### v0.1.0 (2026-03-09)
- ✅ 初始版本发布
- ✅ 实时股价查询
- ✅ 历史数据查询
- ✅ 公司信息查询
- ✅ 股息分红查询
- ✅ 财务报表查询
- ✅ 股票搜索功能
- ✅ OpenClaw 集成

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 👨‍💻 作者

**PocketAI for Leo** - OpenClaw Community

- GitHub: [@leohuang8688](https://github.com/leohuang8688)
- Project: [yahooclaw](https://github.com/leohuang8688/yahooclaw)

---

## 🙏 致谢

- [Yahoo Finance](https://finance.yahoo.com/) - 提供金融数据
- [yahoo-finance2](https://github.com/pilwon/node-yahoo-finance2) - Node.js 客户端
- [OpenClaw](https://github.com/openclaw/openclaw) - AI Agent 框架

---

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- GitHub Issues: [yahooclaw/issues](https://github.com/leohuang8688/yahooclaw/issues)
- OpenClaw Discord: [discord.gg/clawd](https://discord.gg/clawd)

---

**Happy Trading! 📈**

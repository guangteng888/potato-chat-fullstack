// Potato Chat 全面API集成测试
// 测试所有后端API的功能完整性和性能

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 测试配置
const TEST_CONFIG = {
  baseURL: 'http://localhost:3002/api',
  timeout: 10000,
  testUser: {
    username: 'testuser_' + Date.now(),
    email: 'test_' + Date.now() + '@example.com',
    password: 'Test123456!'
  },
  testUser2: {
    username: 'testuser2_' + Date.now(),
    email: 'test2_' + Date.now() + '@example.com',
    password: 'Test123456!'
  }
};

// 测试结果记录
let testResults = {
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    percentage: 0
  },
  performance: {
    avgResponseTime: 0,
    maxResponseTime: 0,
    minResponseTime: Infinity
  },
  tests: [],
  errors: []
};

// HTTP客户端
const client = axios.create({
  baseURL: TEST_CONFIG.baseURL,
  timeout: TEST_CONFIG.timeout,
  validateStatus: () => true // 接受所有状态码
});

// 存储认证token
let authTokens = {
  user1: null,
  user2: null
};

// 日志函数
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const icons = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    test: '🧪',
    perf: '⚡'
  };
  console.log(`[${timestamp}] ${icons[type] || '📋'} ${message}`);
}

// 记录测试结果
function recordTest(name, success, responseTime, details = '', error = null) {
  testResults.summary.total++;
  if (success) {
    testResults.summary.passed++;
  } else {
    testResults.summary.failed++;
    if (error) {
      testResults.errors.push({ test: name, error: error.message || error });
    }
  }
  
  // 记录性能数据
  if (responseTime) {
    testResults.performance.maxResponseTime = Math.max(testResults.performance.maxResponseTime, responseTime);
    testResults.performance.minResponseTime = Math.min(testResults.performance.minResponseTime, responseTime);
  }
  
  testResults.tests.push({
    name,
    success,
    responseTime,
    details,
    timestamp: new Date().toISOString()
  });
  
  log(`${name}: ${success ? '通过' : '失败'} (${responseTime}ms) ${details}`, 
      success ? 'success' : 'error');
}

// 执行API请求并记录性能
async function apiRequest(method, url, data = null, headers = {}) {
  const startTime = Date.now();
  try {
    const response = await client({
      method,
      url,
      data,
      headers
    });
    const responseTime = Date.now() - startTime;
    return { response, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return { error, responseTime };
  }
}

// 测试健康检查
async function testHealthCheck() {
  log('测试健康检查API...', 'test');
  
  const { response, responseTime } = await apiRequest('GET', '/health');
  
  const success = response && response.status === 200 && response.data.success;
  recordTest('健康检查', success, responseTime, 
    success ? `状态: ${response.data.message}` : '健康检查失败');
}

// 测试用户注册
async function testUserRegistration() {
  log('测试用户注册功能...', 'test');
  
  // 测试用户1注册
  const { response: response1, responseTime: time1 } = await apiRequest('POST', '/auth/register', TEST_CONFIG.testUser);
  
  const success1 = response1 && response1.status === 201 && response1.data.success;
  recordTest('用户注册-用户1', success1, time1,
    success1 ? `用户ID: ${response1.data.user?.id}` : `错误: ${response1?.data?.message}`);
  
  // 测试用户2注册
  const { response: response2, responseTime: time2 } = await apiRequest('POST', '/auth/register', TEST_CONFIG.testUser2);
  
  const success2 = response2 && response2.status === 201 && response2.data.success;
  recordTest('用户注册-用户2', success2, time2,
    success2 ? `用户ID: ${response2.data.user?.id}` : `错误: ${response2?.data?.message}`);
  
  // 测试重复注册
  const { response: response3, responseTime: time3 } = await apiRequest('POST', '/auth/register', TEST_CONFIG.testUser);
  
  const success3 = response3 && response3.status === 400;
  recordTest('重复注册检查', success3, time3,
    success3 ? '正确拒绝重复注册' : '重复注册验证失败');
}

// 测试用户登录
async function testUserLogin() {
  log('测试用户登录功能...', 'test');
  
  // 测试用户1登录
  const loginData1 = {
    email: TEST_CONFIG.testUser.email,
    password: TEST_CONFIG.testUser.password
  };
  
  const { response: response1, responseTime: time1 } = await apiRequest('POST', '/auth/login', loginData1);
  
  const success1 = response1 && response1.status === 200 && response1.data.data && response1.data.data.token;
  if (success1) {
    authTokens.user1 = response1.data.data.token;
  }
  recordTest('用户登录-用户1', success1, time1,
    success1 ? 'Token获取成功' : `错误: ${response1?.data?.message}`);
  
  // 测试用户2登录
  const loginData2 = {
    email: TEST_CONFIG.testUser2.email,
    password: TEST_CONFIG.testUser2.password
  };
  
  const { response: response2, responseTime: time2 } = await apiRequest('POST', '/auth/login', loginData2);
  
  const success2 = response2 && response2.status === 200 && response2.data.data && response2.data.data.token;
  if (success2) {
    authTokens.user2 = response2.data.data.token;
  }
  recordTest('用户登录-用户2', success2, time2,
    success2 ? 'Token获取成功' : `错误: ${response2?.data?.message}`);
  
  // 测试错误密码登录
  const wrongLoginData = {
    email: TEST_CONFIG.testUser.email,
    password: 'wrongpassword'
  };
  
  const { response: response3, responseTime: time3 } = await apiRequest('POST', '/auth/login', wrongLoginData);
  
  const success3 = response3 && response3.status === 401;
  recordTest('错误密码登录', success3, time3,
    success3 ? '正确拒绝错误密码' : '密码验证失败');
}

// 测试用户个人资料
async function testUserProfile() {
  log('测试用户个人资料API...', 'test');
  
  if (!authTokens.user1) {
    recordTest('用户个人资料', false, 0, '无认证Token');
    return;
  }
  
  const headers = { Authorization: `Bearer ${authTokens.user1}` };
  const { response, responseTime } = await apiRequest('GET', '/auth/profile', null, headers);
  
  const success = response && response.status === 200 && response.data.data && response.data.data.user;
  recordTest('获取用户个人资料', success, responseTime,
    success ? `用户: ${response.data.data.user.username}` : `错误: ${response?.data?.message}`);
}

// 测试聊天室功能
async function testChatRooms() {
  log('测试聊天室功能...', 'test');
  
  if (!authTokens.user1) {
    recordTest('聊天室功能', false, 0, '无认证Token');
    return;
  }
  
  const headers = { Authorization: `Bearer ${authTokens.user1}` };
  
  // 获取聊天室列表
  const { response, responseTime } = await apiRequest('GET', '/chat/rooms', null, headers);
  
  const success = response && response.status === 200 && response.data.data && Array.isArray(response.data.data.rooms);
  recordTest('获取聊天室列表', success, responseTime,
    success ? `聊天室数量: ${response.data.data.rooms.length}` : `错误: ${response?.data?.message}`);
}

// 测试钱包功能
async function testWallet() {
  log('测试钱包功能...', 'test');
  
  if (!authTokens.user1) {
    recordTest('钱包功能', false, 0, '无认证Token');
    return;
  }
  
  const headers = { Authorization: `Bearer ${authTokens.user1}` };
  
  // 获取钱包余额
  const { response, responseTime } = await apiRequest('GET', '/wallet/balance', null, headers);
  
  const success = response && response.status === 200 && response.data.data && Array.isArray(response.data.data.balances);
  recordTest('获取钱包余额', success, responseTime,
    success ? `钱包数量: ${response.data.data.balances.length}` : `错误: ${response?.data?.message}`);
}

// 测试小程序功能
async function testMiniApps() {
  log('测试小程序功能...', 'test');
  
  if (!authTokens.user1) {
    recordTest('小程序功能', false, 0, '无认证Token');
    return;
  }
  
  const headers = { Authorization: `Bearer ${authTokens.user1}` };
  
  // 获取小程序列表
  const { response, responseTime } = await apiRequest('GET', '/miniapps', null, headers);
  
  const success = response && response.status === 200 && response.data.data && Array.isArray(response.data.data.apps);
  recordTest('获取小程序列表', success, responseTime,
    success ? `小程序数量: ${response.data.data.apps.length}` : `错误: ${response?.data?.message}`);
}

// 测试API性能
async function testPerformance() {
  log('执行性能压力测试...', 'test');
  
  const performanceTests = [];
  const testCount = 10;
  
  // 并发健康检查测试
  for (let i = 0; i < testCount; i++) {
    performanceTests.push(apiRequest('GET', '/health'));
  }
  
  const startTime = Date.now();
  const results = await Promise.all(performanceTests);
  const totalTime = Date.now() - startTime;
  
  const successCount = results.filter(r => r.response?.status === 200).length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / testCount;
  
  recordTest('并发性能测试', successCount === testCount, avgResponseTime,
    `${successCount}/${testCount} 成功, 平均响应时间: ${avgResponseTime.toFixed(2)}ms`);
}

// 测试认证安全性
async function testAuthSecurity() {
  log('测试认证安全性...', 'test');
  
  // 测试无Token访问受保护资源
  const { response: response1, responseTime: time1 } = await apiRequest('GET', '/auth/profile');
  
  const success1 = response1 && response1.status === 401;
  recordTest('无Token访问保护', success1, time1,
    success1 ? '正确拒绝无Token访问' : '认证保护失效');
  
  // 测试错误Token访问
  const headers = { Authorization: 'Bearer invalid_token' };
  const { response: response2, responseTime: time2 } = await apiRequest('GET', '/auth/profile', null, headers);
  
  const success2 = response2 && response2.status === 401;
  recordTest('错误Token访问保护', success2, time2,
    success2 ? '正确拒绝错误Token' : 'Token验证失效');
}

// 计算性能统计
function calculatePerformanceStats() {
  const responseTimes = testResults.tests
    .filter(t => t.responseTime > 0)
    .map(t => t.responseTime);
  
  if (responseTimes.length > 0) {
    testResults.performance.avgResponseTime = 
      responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }
  
  testResults.summary.percentage = 
    (testResults.summary.passed / testResults.summary.total * 100).toFixed(1);
}

// 生成测试报告
function generateReport() {
  calculatePerformanceStats();
  
  const report = `# Potato Chat API 集成测试报告

## 测试概览

**测试时间**: ${testResults.timestamp}
**总测试数**: ${testResults.summary.total}
**通过测试**: ${testResults.summary.passed}
**失败测试**: ${testResults.summary.failed}
**成功率**: ${testResults.summary.percentage}%

## 性能统计

- **平均响应时间**: ${testResults.performance.avgResponseTime.toFixed(2)}ms
- **最快响应时间**: ${testResults.performance.minResponseTime}ms
- **最慢响应时间**: ${testResults.performance.maxResponseTime}ms

## 详细测试结果

${testResults.tests.map(test => `
### ${test.name}
- **状态**: ${test.success ? '✅ 通过' : '❌ 失败'}
- **响应时间**: ${test.responseTime}ms
- **详情**: ${test.details}
- **时间**: ${test.timestamp}
`).join('')}

## 错误汇总

${testResults.errors.length > 0 ? 
  testResults.errors.map(err => `- **${err.test}**: ${err.error}`).join('\n') :
  '✅ 无错误'}

## 功能覆盖率

### 已测试功能
- ✅ 健康检查API
- ✅ 用户注册功能
- ✅ 用户登录验证
- ✅ 个人资料获取
- ✅ 聊天室功能
- ✅ 钱包功能
- ✅ 小程序功能
- ✅ 认证安全性
- ✅ 性能压力测试

### 测试环境
- **后端服务**: ${TEST_CONFIG.baseURL}
- **超时设置**: ${TEST_CONFIG.timeout}ms
- **测试用户**: 2个测试账户

## 质量评估

${(() => {
  const percentage = parseFloat(testResults.summary.percentage);
  if (percentage >= 95) {
    return '🏆 **优秀** - API功能完整，性能良好，可以投入生产使用';
  } else if (percentage >= 80) {
    return '👍 **良好** - 主要功能正常，少量问题需要修复';
  } else if (percentage >= 60) {
    return '⚠️ **需要改进** - 存在较多问题，需要重点修复';
  } else {
    return '❌ **不合格** - 严重问题较多，需要全面检查和修复';
  }
})()}

## 建议和后续行动

${testResults.summary.failed > 0 ? `
### 需要修复的问题
${testResults.errors.map(err => `- ${err.test}: ${err.error}`).join('\n')}

### 修复建议
- 检查失败测试的具体错误信息
- 验证数据库连接和数据完整性
- 确保所有API端点正确实现
- 优化性能较慢的接口
` : `
### 成功建议
- ✅ 所有API测试通过，系统运行良好
- 🚀 可以进行下一阶段的前端集成测试
- 📈 建议继续监控生产环境性能
- 🔄 定期执行回归测试确保质量
`}

---

*报告生成时间: ${new Date().toLocaleString()}*
*测试工具: MiniMax Agent API测试框架*
`;

  try {
    const reportPath = '/workspace/docs/api_integration_test_report.md';
    fs.writeFileSync(reportPath, report, 'utf8');
    log(`API测试报告已生成: ${reportPath}`, 'success');
  } catch (error) {
    log(`生成报告失败: ${error.message}`, 'error');
  }
}

// 主测试函数
async function runApiTests() {
  log('开始Potato Chat API全面集成测试...', 'test');
  
  try {
    // 基础功能测试
    await testHealthCheck();
    await testUserRegistration();
    await testUserLogin();
    await testUserProfile();
    await testChatRooms();
    await testWallet();
    await testMiniApps();
    
    // 安全性测试
    await testAuthSecurity();
    
    // 性能测试
    await testPerformance();
    
    // 生成报告
    generateReport();
    
    // 总结
    const percentage = testResults.summary.percentage;
    if (percentage >= 95) {
      log(`🎉 API测试全部通过! 成功率: ${percentage}%`, 'success');
    } else if (percentage >= 80) {
      log(`👍 API测试基本通过，成功率: ${percentage}%`, 'success');
    } else {
      log(`⚠️ API测试存在问题，成功率: ${percentage}%`, 'warning');
    }
    
  } catch (error) {
    log(`API测试过程异常: ${error.message}`, 'error');
  }
}

// 运行测试
if (require.main === module) {
  runApiTests();
}

module.exports = {
  runApiTests,
  testResults
};

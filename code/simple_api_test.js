// 简化的API测试，专注于基本功能验证

const axios = require('axios');

const API_BASE = 'http://localhost:3002/api';

// 创建HTTP客户端
const client = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
  validateStatus: () => true
});

// 日志函数
function log(message, type = 'info') {
  const icons = { info: '📋', success: '✅', error: '❌', test: '🧪' };
  console.log(`${icons[type] || '📋'} ${message}`);
}

// 测试结果存储
let results = {
  total: 0,
  passed: 0,
  tests: []
};

// 记录测试结果
function recordTest(name, success, details = '') {
  results.total++;
  if (success) results.passed++;
  
  results.tests.push({ name, success, details });
  log(`${name}: ${success ? '通过' : '失败'} ${details}`, success ? 'success' : 'error');
}

async function runSimpleTests() {
  log('开始基础API功能测试...', 'test');
  
  try {
    // 1. 健康检查
    const healthResponse = await client.get('/health');
    recordTest('健康检查', 
      healthResponse.status === 200 && healthResponse.data.success,
      `状态码: ${healthResponse.status}`);
    
    // 2. 用户注册测试
    const testUser = {
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      password: 'Test123456!'
    };
    
    const registerResponse = await client.post('/auth/register', testUser);
    recordTest('用户注册',
      registerResponse.status === 201,
      `状态码: ${registerResponse.status}, 消息: ${registerResponse.data?.message}`);
    
    // 3. 用户登录测试（使用新注册的用户）
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    
    const loginResponse = await client.post('/auth/login', loginData);
    recordTest('新用户登录',
      loginResponse.status === 200,
      `状态码: ${loginResponse.status}, 消息: ${loginResponse.data?.message}`);
    
    let token = null;
    if (loginResponse.status === 200 && loginResponse.data.data && loginResponse.data.data.token) {
      token = loginResponse.data.data.token;
    }
    
    // 4. 获取用户资料
    if (token) {
      const profileResponse = await client.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      recordTest('获取用户资料',
        profileResponse.status === 200,
        `状态码: ${profileResponse.status}`);
      
      // 5. 聊天室功能
      const roomsResponse = await client.get('/chat/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      recordTest('聊天室列表',
        roomsResponse.status === 200,
        `状态码: ${roomsResponse.status}`);
      
      // 6. 钱包功能
      const walletResponse = await client.get('/wallet/balance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      recordTest('钱包余额',
        walletResponse.status === 200,
        `状态码: ${walletResponse.status}`);
      
      // 7. 小程序功能
      const miniappsResponse = await client.get('/miniapps', {
        headers: { Authorization: `Bearer ${token}` }
      });
      recordTest('小程序列表',
        miniappsResponse.status === 200,
        `状态码: ${miniappsResponse.status}`);
    } else {
      recordTest('获取用户资料', false, '无认证Token');
      recordTest('聊天室列表', false, '无认证Token');
      recordTest('钱包余额', false, '无认证Token');
      recordTest('小程序列表', false, '无认证Token');
    }
    
    // 总结
    const successRate = (results.passed / results.total * 100).toFixed(1);
    log(`\n测试完成: ${results.passed}/${results.total} (${successRate}%)`, 
        successRate >= 80 ? 'success' : 'error');
    
    return results;
    
  } catch (error) {
    log(`测试过程异常: ${error.message}`, 'error');
    return results;
  }
}

// 运行测试
if (require.main === module) {
  runSimpleTests();
}

module.exports = { runSimpleTests };

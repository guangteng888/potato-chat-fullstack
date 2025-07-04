// 简单的服务器测试脚本
const http = require('http');

// 测试服务器健康检查
function testHealthCheck() {
  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/health',
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('健康检查响应:', data);
        resolve(JSON.parse(data));
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

// 测试用户注册
function testUserRegistration() {
  const postData = JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: '123456'
  });

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log('用户注册响应:', data);
        resolve(JSON.parse(data));
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// 运行测试
async function runTests() {
  console.log('开始后端API测试...\n');
  
  try {
    // 等待服务器启动
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 测试健康检查
    console.log('1. 测试健康检查...');
    const health = await testHealthCheck();
    console.log('健康检查成功!\n');
    
    // 测试用户注册
    console.log('2. 测试用户注册...');
    const registration = await testUserRegistration();
    console.log('用户注册成功!\n');
    
    console.log('所有测试通过! ✅');
    
  } catch (error) {
    console.error('测试失败:', error.message);
    console.log('测试失败! ❌');
  }
}

runTests();

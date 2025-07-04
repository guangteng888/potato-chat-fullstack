
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

async function runTests() {
  console.log('=============== 前端集成测试开始 ===============');
  let token = '';
  let userData = {};

  // ======================== 1. 用户注册 ========================
  try {
    console.log('\n[测试] 1. 用户注册...');
    const newUser = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
    };
    const registerResponse = await api.post('/auth/register', newUser);

    if (registerResponse.data.success) {
      console.log('  [成功] 用户注册成功');
      userData = registerResponse.data.data.user;
      token = registerResponse.data.data.token;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      throw new Error(registerResponse.data.message);
    }
  } catch (error) {
    console.error('  [失败] 用户注册失败:', error.response ? error.response.data : error.message);
    process.exit(1);
  }

  // ======================== 2. 用户登录 ========================
  try {
    console.log('\n[测试] 2. 用户登录...');
    const loginResponse = await api.post('/auth/login', {
      identifier: userData.email,
      password: 'password123',
    });

    if (loginResponse.data.success) {
      console.log('  [成功] 用户登录成功');
      // Token should be the same or a new one, update it just in case
      token = loginResponse.data.data.token;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      throw new Error(loginResponse.data.message);
    }
  } catch (error) {
    console.error('  [失败] 用户登录失败:', error.response ? error.response.data : error.message);
    process.exit(1);
  }

  // ======================== 3. 获取用户个人资料 ========================
  try {
    console.log('\n[测试] 3. 获取用户个人资料...');
    const profileResponse = await api.get('/user/profile');
    if (profileResponse.data.success && profileResponse.data.data.user.id === userData.id) {
      console.log(`  [成功] 成功获取用户 ${profileResponse.data.data.user.username} 的资料`);
    } else {
      throw new Error(profileResponse.data.message || '获取用户资料失败');
    }
  } catch (error) {
    console.error('  [失败] 获取用户资料失败:', error.response ? error.response.data : error.message);
  }

  // ======================== 4. 获取聊天室 ========================
  try {
    console.log('\n[测试] 4. 获取聊天室...');
    const roomsResponse = await api.get('/chat/rooms');
    if (roomsResponse.data.success) {
      console.log(`  [成功] 成功获取 ${roomsResponse.data.data.rooms.length} 个聊天室`);
    } else {
      throw new Error(roomsResponse.data.message);
    }
  } catch (error) {
    console.error('  [失败] 获取聊天室失败:', error.response ? error.response.data : error.message);
  }

  // ======================== 5. 获取钱包余额 ========================
  try {
    console.log('\n[测试] 5. 获取钱包余额...');
    const balanceResponse = await api.get('/wallet/balance');
    if (balanceResponse.data.success) {
      console.log(`  [成功] 成功获取 ${balanceResponse.data.data.balances.length} 种货币的余额`);
    } else {
      throw new Error(balanceResponse.data.message);
    }
  } catch (error) {
    console.error('  [失败] 获取钱包余额失败:', error.response ? error.response.data : error.message);
  }
  
    // ======================== 6. 获取小程序列表 ========================
  try {
    console.log('\n[测试] 6. 获取小程序列表...');
    const appsResponse = await api.get('/miniapps');
    if (appsResponse.data.success) {
      console.log(`  [成功] 成功获取 ${appsResponse.data.data.apps.length} 个小程序`);
    } else {
      throw new Error(appsResponse.data.message);
    }
  } catch (error) {
    console.error('  [失败] 获取小程序列表失败:', error.response ? error.response.data : error.message);
  }


  console.log('\n=============== 前端集成测试结束 ===============');
}

runTests();

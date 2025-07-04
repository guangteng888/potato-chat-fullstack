// Potato Chat Mobile - 简化版移动端测试脚本

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  mobileDir: '/workspace/potato-chat-mobile',
  webDir: '/workspace/potato-chat-clone',
  timeout: 60000
};

// 日志函数
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const icons = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    build: '🔨'
  };
  console.log(`[${timestamp}] ${icons[type] || '📋'} ${message}`);
}

// 检查路径
function checkPath(filePath, type = 'file') {
  try {
    const stats = fs.statSync(filePath);
    return type === 'file' ? stats.isFile() : stats.isDirectory();
  } catch (error) {
    return false;
  }
}

// 执行命令
function execCommand(command, cwd = process.cwd()) {
  try {
    log(`执行: ${command}`, 'build');
    const result = execSync(command, {
      cwd,
      timeout: CONFIG.timeout,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout || error.stderr || ''
    };
  }
}

// 测试结果
let results = {
  web: false,
  capacitor: false,
  ios: false,
  android: false,
  errors: []
};

async function runTests() {
  log('开始移动端构建测试...', 'build');
  
  try {
    // 1. 检查Web构建
    const distPath = path.join(CONFIG.webDir, 'dist');
    if (checkPath(distPath, 'dir')) {
      log('Web应用已构建', 'success');
      results.web = true;
    } else {
      log('Web应用未构建，开始构建...', 'build');
      const buildResult = execCommand('pnpm run build', CONFIG.webDir);
      if (buildResult.success) {
        log('Web应用构建成功', 'success');
        results.web = true;
      } else {
        log('Web应用构建失败', 'error');
        results.errors.push('Web构建失败');
      }
    }
    
    // 2. 检查Capacitor配置
    const configPath = path.join(CONFIG.mobileDir, 'capacitor.config.json');
    if (checkPath(configPath)) {
      log('Capacitor配置文件存在', 'success');
      results.capacitor = true;
    } else {
      log('Capacitor配置文件缺失', 'error');
      results.errors.push('Capacitor配置缺失');
    }
    
    // 3. 检查iOS平台
    const iosDir = path.join(CONFIG.mobileDir, 'ios');
    if (checkPath(iosDir, 'dir')) {
      const xcodeProj = path.join(iosDir, 'App/App.xcodeproj');
      if (checkPath(xcodeProj, 'dir')) {
        log('iOS平台就绪', 'success');
        results.ios = true;
      } else {
        log('iOS项目文件不完整', 'warning');
        results.errors.push('iOS项目不完整');
      }
    } else {
      log('iOS平台目录不存在', 'warning');
      results.errors.push('iOS平台未配置');
    }
    
    // 4. 检查Android平台
    const androidDir = path.join(CONFIG.mobileDir, 'android');
    if (checkPath(androidDir, 'dir')) {
      const buildGradle = path.join(androidDir, 'app/build.gradle');
      if (checkPath(buildGradle)) {
        log('Android平台就绪', 'success');
        results.android = true;
      } else {
        log('Android项目文件不完整', 'warning');
        results.errors.push('Android项目不完整');
      }
    } else {
      log('Android平台目录不存在', 'warning');
      results.errors.push('Android平台未配置');
    }
    
    // 5. 生成报告
    generateReport();
    
    // 总结
    const successCount = Object.values(results).filter(v => v === true).length;
    const totalTests = 4;
    const percentage = (successCount / totalTests * 100).toFixed(1);
    
    log(`测试完成: ${successCount}/${totalTests} (${percentage}%)`, 
        percentage >= 75 ? 'success' : 'warning');
    
  } catch (error) {
    log(`测试异常: ${error.message}`, 'error');
  }
}

function generateReport() {
  const report = `# Potato Chat 移动端构建测试报告

## 测试时间
${new Date().toLocaleString()}

## 测试结果

### Web应用构建
- **状态**: ${results.web ? '✅ 成功' : '❌ 失败'}
- **路径**: ${CONFIG.webDir}/dist

### Capacitor配置
- **状态**: ${results.capacitor ? '✅ 正常' : '❌ 异常'}
- **配置文件**: ${CONFIG.mobileDir}/capacitor.config.json

### iOS平台
- **状态**: ${results.ios ? '✅ 就绪' : '⚠️ 未就绪'}
- **项目路径**: ${CONFIG.mobileDir}/ios

### Android平台
- **状态**: ${results.android ? '✅ 就绪' : '⚠️ 未就绪'}
- **项目路径**: ${CONFIG.mobileDir}/android

## 问题汇总
${results.errors.length > 0 ? 
  results.errors.map(err => `- ❌ ${err}`).join('\n') : 
  '✅ 无问题'}

## 完成度评估
- **整体完成度**: ${((Object.values(results).filter(v => v === true).length / 4) * 100).toFixed(1)}%
- **构建就绪度**: ${results.web && results.capacitor ? '✅ 基础就绪' : '❌ 需要修复'}

---
*测试工具: MiniMax Agent*
`;

  try {
    const reportPath = '/workspace/docs/mobile_build_test_simple.md';
    fs.writeFileSync(reportPath, report, 'utf8');
    log(`测试报告已生成: ${reportPath}`, 'success');
  } catch (error) {
    log(`生成报告失败: ${error.message}`, 'error');
  }
}

// 运行测试
runTests();

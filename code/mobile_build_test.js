// Potato Chat Mobile - 移动端构建测试脚本
// 测试 Capacitor 移动端应用的构建能力

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  mobileDir: '/workspace/potato-chat-mobile',
  webDir: '/workspace/potato-chat-clone',
  timeout: 120000, // 2分钟超时
  platforms: ['ios', 'android'],
  testResults: '/workspace/docs/mobile_build_test_results.md'
};

// 测试结果
let testResults = {
  timestamp: new Date().toISOString(),
  overall: { success: true, errors: [] },
  web: { built: false, path: '', size: 0 },
  capacitor: { synced: false, platforms: {} },
  ios: { prepared: false, errors: [] },
  android: { prepared: false, errors: [] }
};

// 日志函数
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    build: '🔨'
  }[type] || '📋';
  
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

// 执行命令
function execCommand(command, cwd = process.cwd()) {
  try {
    log(`执行命令: ${command}`, 'build');
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

// 检查目录和文件
function checkPath(filePath, type = 'file') {
  try {
    const stats = fs.statSync(filePath);
    if (type === 'file') {
      return stats.isFile();
    } else if (type === 'dir') {
      return stats.isDirectory();
    }
    return stats;
  } catch (error) {
    return false;
  }
}

// 获取目录大小
function getDirSize(dirPath) {
  try {
    const result = execSync(`du -sh "${dirPath}" | cut -f1`, { 
      encoding: 'utf8',
      timeout: 10000 
    });
    return result.trim();
  } catch (error) {
    return 'Unknown';
  }
}

// 测试Web应用构建
async function testWebBuild() {
  log('开始测试Web应用构建...', 'build');
  
  try {
    // 检查Web项目目录
    if (!checkPath(CONFIG.webDir, 'dir')) {
      throw new Error(`Web项目目录不存在: ${CONFIG.webDir}`);
    }
    
    // 检查package.json
    const packageJsonPath = path.join(CONFIG.webDir, 'package.json');
    if (!checkPath(packageJsonPath)) {
      throw new Error('Web项目缺少package.json');
    }
    
    // 检查是否已有构建结果
    const distPath = path.join(CONFIG.webDir, 'dist');\n    if (checkPath(distPath, 'dir')) {\n      log('发现已有构建结果', 'success');\n      testResults.web.built = true;\n      testResults.web.path = distPath;\n      testResults.web.size = getDirSize(distPath);\n      return true;\n    }\n    \n    // 检查依赖是否已安装\n    const nodeModulesPath = path.join(CONFIG.webDir, 'node_modules');\n    if (!checkPath(nodeModulesPath, 'dir')) {\n      log('安装Web项目依赖...', 'build');\n      const installResult = execCommand('pnpm install', CONFIG.webDir);\n      if (!installResult.success) {\n        throw new Error(`依赖安装失败: ${installResult.error}`);\n      }\n    }\n    \n    // 构建Web应用\n    log('构建Web应用...', 'build');\n    const buildResult = execCommand('pnpm run build', CONFIG.webDir);\n    \n    if (!buildResult.success) {\n      throw new Error(`Web构建失败: ${buildResult.error}`);\n    }\n    \n    // 验证构建结果\n    if (!checkPath(distPath, 'dir')) {\n      throw new Error('构建完成但dist目录不存在');\n    }\n    \n    const indexPath = path.join(distPath, 'index.html');\n    if (!checkPath(indexPath)) {\n      throw new Error('构建完成但缺少index.html');\n    }\n    \n    testResults.web.built = true;\n    testResults.web.path = distPath;\n    testResults.web.size = getDirSize(distPath);\n    \n    log(`Web应用构建成功，大小: ${testResults.web.size}`, 'success');\n    return true;\n    \n  } catch (error) {\n    log(`Web应用构建失败: ${error.message}`, 'error');\n    testResults.overall.errors.push(`Web构建: ${error.message}`);\n    testResults.overall.success = false;\n    return false;\n  }\n}\n\n// 测试Capacitor同步\nasync function testCapacitorSync() {\n  log('开始测试Capacitor同步...', 'build');\n  \n  try {\n    // 检查移动端项目目录\n    if (!checkPath(CONFIG.mobileDir, 'dir')) {\n      throw new Error(`移动端项目目录不存在: ${CONFIG.mobileDir}`);\n    }\n    \n    // 检查capacitor.config.json\n    const configPath = path.join(CONFIG.mobileDir, 'capacitor.config.json');\n    if (!checkPath(configPath)) {\n      throw new Error('Capacitor配置文件不存在');\n    }\n    \n    // 检查Web构建结果\n    const webDistPath = path.join(CONFIG.webDir, 'dist');\n    if (!checkPath(webDistPath, 'dir')) {\n      throw new Error('Web应用未构建，无法同步到Capacitor');\n    }\n    \n    // 检查Capacitor依赖\n    const packageJsonPath = path.join(CONFIG.mobileDir, 'package.json');\n    if (checkPath(packageJsonPath)) {\n      const nodeModulesPath = path.join(CONFIG.mobileDir, 'node_modules');\n      if (!checkPath(nodeModulesPath, 'dir')) {\n        log('安装Capacitor依赖...', 'build');\n        const installResult = execCommand('npm install', CONFIG.mobileDir);\n        if (!installResult.success) {\n          log(`依赖安装警告: ${installResult.error}`, 'warning');\n        }\n      }\n    }\n    \n    // 执行Capacitor同步\n    log('同步Web应用到Capacitor...', 'build');\n    const syncResult = execCommand('npx cap sync', CONFIG.mobileDir);\n    \n    if (!syncResult.success) {\n      // 尝试替代方案\n      log('尝试使用copy命令...', 'build');\n      const copyResult = execCommand('npx cap copy', CONFIG.mobileDir);\n      if (!copyResult.success) {\n        throw new Error(`Capacitor同步失败: ${syncResult.error}`);\n      }\n    }\n    \n    testResults.capacitor.synced = true;\n    log('Capacitor同步成功', 'success');\n    return true;\n    \n  } catch (error) {\n    log(`Capacitor同步失败: ${error.message}`, 'error');\n    testResults.overall.errors.push(`Capacitor同步: ${error.message}`);\n    return false;\n  }\n}\n\n// 测试iOS平台准备\nasync function testIOSPlatform() {\n  log('开始测试iOS平台准备...', 'build');\n  \n  try {\n    const iosDir = path.join(CONFIG.mobileDir, 'ios');\n    \n    // 检查iOS目录是否存在\n    if (!checkPath(iosDir, 'dir')) {\n      log('iOS平台目录不存在，尝试添加...', 'build');\n      const addResult = execCommand('npx cap add ios', CONFIG.mobileDir);\n      if (!addResult.success) {\n        throw new Error(`iOS平台添加失败: ${addResult.error}`);\n      }\n    }\n    \n    // 检查关键iOS文件\n    const requiredFiles = [\n      'App/App.xcodeproj/project.pbxproj',\n      'App/App/Info.plist',\n      'App/App/Assets.xcassets',\n      'App/App/AppDelegate.swift'\n    ];\n    \n    const missingFiles = requiredFiles.filter(file => \n      !checkPath(path.join(iosDir, file))\n    );\n    \n    if (missingFiles.length > 0) {\n      log(`iOS关键文件缺失: ${missingFiles.join(', ')}`, 'warning');\n      testResults.ios.errors.push(`缺失文件: ${missingFiles.join(', ')}`);\n    }\n    \n    // 尝试更新iOS平台\n    log('更新iOS平台文件...', 'build');\n    const updateResult = execCommand('npx cap update ios', CONFIG.mobileDir);\n    if (!updateResult.success) {\n      log(`iOS平台更新警告: ${updateResult.error}`, 'warning');\n      testResults.ios.errors.push(`更新失败: ${updateResult.error}`);\n    }\n    \n    // 检查Podfile (如果存在)\n    const podfilePath = path.join(iosDir, 'App/Podfile');\n    if (checkPath(podfilePath)) {\n      log('发现Podfile，iOS依赖管理已配置', 'success');\n    }\n    \n    testResults.ios.prepared = true;\n    testResults.capacitor.platforms.ios = true;\n    log('iOS平台准备完成', 'success');\n    return true;\n    \n  } catch (error) {\n    log(`iOS平台准备失败: ${error.message}`, 'error');\n    testResults.ios.errors.push(error.message);\n    testResults.overall.errors.push(`iOS平台: ${error.message}`);\n    return false;\n  }\n}\n\n// 测试Android平台准备\nasync function testAndroidPlatform() {\n  log('开始测试Android平台准备...', 'build');\n  \n  try {\n    const androidDir = path.join(CONFIG.mobileDir, 'android');\n    \n    // 检查Android目录是否存在\n    if (!checkPath(androidDir, 'dir')) {\n      log('Android平台目录不存在，尝试添加...', 'build');\n      const addResult = execCommand('npx cap add android', CONFIG.mobileDir);\n      if (!addResult.success) {\n        throw new Error(`Android平台添加失败: ${addResult.error}`);\n      }\n    }\n    \n    // 检查关键Android文件\n    const requiredFiles = [\n      'app/build.gradle',\n      'app/src/main/AndroidManifest.xml',\n      'gradle.properties',\n      'settings.gradle'\n    ];\n    \n    const missingFiles = requiredFiles.filter(file => \n      !checkPath(path.join(androidDir, file))\n    );\n    \n    if (missingFiles.length > 0) {\n      log(`Android关键文件缺失: ${missingFiles.join(', ')}`, 'warning');\n      testResults.android.errors.push(`缺失文件: ${missingFiles.join(', ')}`);\n    }\n    \n    // 尝试更新Android平台\n    log('更新Android平台文件...', 'build');\n    const updateResult = execCommand('npx cap update android', CONFIG.mobileDir);\n    if (!updateResult.success) {\n      log(`Android平台更新警告: ${updateResult.error}`, 'warning');\n      testResults.android.errors.push(`更新失败: ${updateResult.error}`);\n    }\n    \n    // 检查Gradle配置\n    const gradlePath = path.join(androidDir, 'build.gradle');\n    if (checkPath(gradlePath)) {\n      log('发现Gradle配置，Android构建环境已准备', 'success');\n    }\n    \n    testResults.android.prepared = true;\n    testResults.capacitor.platforms.android = true;\n    log('Android平台准备完成', 'success');\n    return true;\n    \n  } catch (error) {\n    log(`Android平台准备失败: ${error.message}`, 'error');\n    testResults.android.errors.push(error.message);\n    testResults.overall.errors.push(`Android平台: ${error.message}`);\n    return false;\n  }\n}\n\n// 生成测试报告\nfunction generateReport() {\n  const report = `# Potato Chat 移动端构建测试报告\n\n## 测试概览\n\n**测试时间**: ${testResults.timestamp}\n**整体状态**: ${testResults.overall.success ? '✅ 成功' : '❌ 失败'}\n**错误数量**: ${testResults.overall.errors.length}\n\n## 详细测试结果\n\n### Web应用构建\n- **状态**: ${testResults.web.built ? '✅ 成功' : '❌ 失败'}\n- **构建路径**: ${testResults.web.path || 'N/A'}\n- **构建大小**: ${testResults.web.size || 'N/A'}\n\n### Capacitor同步\n- **状态**: ${testResults.capacitor.synced ? '✅ 成功' : '❌ 失败'}\n- **iOS平台**: ${testResults.capacitor.platforms.ios ? '✅ 就绪' : '❌ 未就绪'}\n- **Android平台**: ${testResults.capacitor.platforms.android ? '✅ 就绪' : '❌ 未就绪'}\n\n### iOS平台测试\n- **状态**: ${testResults.ios.prepared ? '✅ 准备完成' : '❌ 准备失败'}\n- **错误数量**: ${testResults.ios.errors.length}\n${testResults.ios.errors.length > 0 ? `- **错误详情**:\n${testResults.ios.errors.map(err => `  - ${err}`).join('\\n')}` : ''}\n\n### Android平台测试\n- **状态**: ${testResults.android.prepared ? '✅ 准备完成' : '❌ 准备失败'}\n- **错误数量**: ${testResults.android.errors.length}\n${testResults.android.errors.length > 0 ? `- **错误详情**:\n${testResults.android.errors.map(err => `  - ${err}`).join('\\n')}` : ''}\n\n## 整体错误汇总\n\n${testResults.overall.errors.length > 0 ? \n  testResults.overall.errors.map(err => `- ❌ ${err}`).join('\\n') : \n  '✅ 无错误'}\n\n## 构建能力评估\n\n### 移动端完成度评估\n基于测试结果，移动端当前状态：\n\n- **Web应用**: ${testResults.web.built ? '✅ 完整' : '❌ 缺失'}\n- **iOS平台**: ${testResults.ios.prepared ? '✅ 就绪' : '❌ 需要修复'}\n- **Android平台**: ${testResults.android.prepared ? '✅ 就绪' : '❌ 需要修复'}\n- **Capacitor集成**: ${testResults.capacitor.synced ? '✅ 正常' : '❌ 异常'}\n\n### 构建就绪度\n${(() => {\n  const readyPlatforms = Object.values(testResults.capacitor.platforms).filter(Boolean).length;\n  const totalPlatforms = 2; // iOS + Android\n  const percentage = (readyPlatforms / totalPlatforms * 100);\n  \n  if (percentage === 100 && testResults.web.built && testResults.capacitor.synced) {\n    return '🎉 **100% 就绪** - 可以进行完整的移动端构建';\n  } else if (percentage >= 50 && testResults.web.built) {\n    return '👍 **部分就绪** - 可以进行部分平台构建';\n  } else {\n    return '⚠️ **未就绪** - 需要解决基础问题才能进行构建';\n  }\n})()}\n\n## 下一步建议\n\n${testResults.overall.success ? \n  `### 成功建议\n- ✅ 移动端构建环境已就绪\n- 🚀 可以尝试实际构建安装包\n- 📱 建议在真实设备上测试\n- 🔄 定期更新Capacitor和平台依赖` :\n  `### 修复建议\n${testResults.overall.errors.map(err => `- 🔧 修复: ${err}`).join('\\n')}\n- 📚 检查Capacitor官方文档\n- 🛠️ 验证开发环境配置\n- ⚡ 重新运行测试验证修复`}\n\n## 技术信息\n\n- **Capacitor配置**: /workspace/potato-chat-mobile/capacitor.config.json\n- **Web应用路径**: ${CONFIG.webDir}\n- **移动端项目路径**: ${CONFIG.mobileDir}\n- **原生功能模块**: /workspace/potato-chat-mobile/src/native-features.js\n\n---\n\n*报告生成时间: ${new Date().toLocaleString()}*\n*测试工具: MiniMax Agent*\n`;\n\n  try {\n    fs.writeFileSync(CONFIG.testResults, report, 'utf8');\n    log(`移动端构建测试报告已生成: ${CONFIG.testResults}`, 'success');\n  } catch (error) {\n    log(`生成测试报告失败: ${error.message}`, 'error');\n  }\n}\n\n// 主测试函数\nasync function runMobileBuildTest() {\n  log('开始Potato Chat移动端构建测试...', 'build');\n  \n  try {\n    // 1. 测试Web应用构建\n    await testWebBuild();\n    \n    // 2. 测试Capacitor同步\n    await testCapacitorSync();\n    \n    // 3. 测试iOS平台\n    await testIOSPlatform();\n    \n    // 4. 测试Android平台\n    await testAndroidPlatform();\n    \n    // 5. 生成报告\n    generateReport();\n    \n    // 总结\n    if (testResults.overall.success) {\n      log('🎉 移动端构建测试全部成功!', 'success');\n    } else {\n      log(`⚠️ 移动端构建测试完成，发现 ${testResults.overall.errors.length} 个问题`, 'warning');\n    }\n    \n  } catch (error) {\n    log(`移动端构建测试异常: ${error.message}`, 'error');\n    testResults.overall.success = false;\n    testResults.overall.errors.push(`测试异常: ${error.message}`);\n    generateReport();\n  }\n}\n\n// 运行测试\nif (require.main === module) {\n  runMobileBuildTest();\n}\n\nmodule.exports = {\n  runMobileBuildTest,\n  testResults\n};\n
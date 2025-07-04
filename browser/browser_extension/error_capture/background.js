// 在导航提交时尽早注入脚本
chrome.webNavigation.onCommitted.addListener(async (details) => {
  // 主框架过滤
  if (details.frameId === 0) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ['content.js'],
        injectImmediately: true,  // 尽可能早地注入
        world: "MAIN"  // 在主页面环境中运行
      });
    } catch (err) {
      console.error("Early script injection failed:", err);
    }
  }
});

// 注册常规内容脚本作为备份
chrome.runtime.onInstalled.addListener(async () => {
  await chrome.scripting.registerContentScripts([{
    id: "error-logger",
    matches: ["<all_urls>"],
    js: ["content.js"],
    runAt: "document_start",
    world: "MAIN",
    allFrames: true
  }]);
}); 
// 幂等的错误捕获实现
(function () {
  // 如果已经初始化过，直接返回
  if (window.__matrix_errors_initialized__) return;
  window.__matrix_errors_initialized__ = true;

  // 初始化错误存储数组
  if (!window.__matrix_errors__) {
    window.__matrix_errors__ = [];
  }

  // 保存原始console方法（如果尚未保存）
  if (!window.__original_console_error__) {
    window.__original_console_error__ = console.error;
  }

  if (!window.__original_console_log__) {
    window.__original_console_log__ = console.log;
  }

  // 覆盖console.error（只有在尚未被覆盖的情况下）
  console.error = function (...args) {
    window.__matrix_errors__.push({
      type: 'console.error',
      message: args.join(' '),
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    });
    window.__original_console_error__.apply(console, args);
  };

  // 覆盖console.log
  console.log = function (...args) {
    window.__matrix_errors__.push({
      type: 'console.log',
      message: args.join(' '),
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    });
    window.__original_console_log__.apply(console, args);
  };

  // 捕获图片加载失败事件
  document.addEventListener('error', function (event) {
    if (event.target.tagName === 'IMG') {
      window.__matrix_errors__.push({
        type: 'image.error',
        message: `Failed to load image: ${event.target.src}`,
        timestamp: new Date().toISOString(),
        stack: new Error().stack,
        element: {
          tagName: event.target.tagName,
          src: event.target.src,
          id: event.target.id,
          className: event.target.className
        }
      });
    }
  }, true);

  // 其他错误捕获逻辑...
  window.addEventListener('error', function (event) {
    window.__matrix_errors__.push({
      type: 'uncaught.error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: new Date().toISOString(),
      stack: event.error ? event.error.stack : null
    });
    return false;
  }, true);

  window.addEventListener('unhandledrejection', function (event) {
    let message = 'Promise rejection: ';
    if (typeof event.reason === 'object') {
      message += (event.reason.message || JSON.stringify(event.reason));
    } else {
      message += String(event.reason);
    }

    window.__matrix_errors__.push({
      type: 'unhandled.promise',
      message: message,
      timestamp: new Date().toISOString(),
      stack: event.reason && event.reason.stack ? event.reason.stack : null
    });
  });
})();

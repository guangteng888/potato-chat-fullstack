// src/routes/miniapps.js
const express = require('express');
const router = express.Router();

const miniAppsController = require('../controllers/miniAppsController');
const { authenticateToken } = require('../middleware/auth');

// 获取小程序列表（需要认证）
router.get('/', authenticateToken, miniAppsController.getMiniApps);

// 获取已安装的小程序（需要认证）
router.get('/installed', authenticateToken, miniAppsController.getInstalledMiniApps);

// 安装小程序（需要认证）
router.post('/:appId/install', authenticateToken, miniAppsController.installMiniApp);

// 卸载小程序（需要认证）
router.delete('/:appId/install', authenticateToken, miniAppsController.uninstallMiniApp);

// 更新小程序使用时间（需要认证）
router.post('/:appId/use', authenticateToken, miniAppsController.updateLastUsed);

module.exports = router;
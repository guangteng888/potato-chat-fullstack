// src/routes/miniapps-simple.js
const express = require('express');
const router = express.Router();

const miniAppsController = require('../controllers/miniAppsController');
const { authenticateToken } = require('../middleware/auth');

// 获取小程序列表
router.get('/', authenticateToken, miniAppsController.getMiniApps);

// 获取用户已安装的小程序
router.get('/installed', authenticateToken, miniAppsController.getInstalledMiniApps);

// 安装小程序
router.post('/:appId/install', authenticateToken, miniAppsController.installMiniApp);

// 卸载小程序
router.delete('/:appId/uninstall', authenticateToken, miniAppsController.uninstallMiniApp);

module.exports = router;

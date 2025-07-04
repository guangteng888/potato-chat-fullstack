// src/controllers/miniAppsController.js
const { MiniApp, UserMiniApp, User } = require('../models');
const { Op } = require('sequelize');

// 获取小程序列表
const getMiniApps = async (req, res) => {
  try {
    const { category, search, installed } = req.query;
    const userId = req.userId;

    let whereClause = { isPublished: true };

    // 分类筛选
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    // 搜索筛选
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const apps = await MiniApp.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'developer',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: UserMiniApp,
          as: 'installations',
          where: installed === 'true' ? { userId } : undefined,
          required: installed === 'true',
          attributes: ['installedAt', 'lastUsed']
        }
      ],
      order: [['downloads', 'DESC'], ['rating', 'DESC']]
    });

    // 格式化返回数据
    const formattedApps = apps.map(app => {
      const appData = app.toJSON();
      const userInstallation = appData.installations.find(inst => inst.userId === userId);
      
      return {
        ...appData,
        isInstalled: !!userInstallation,
        installedAt: userInstallation?.installedAt,
        lastUsed: userInstallation?.lastUsed,
        installations: undefined // 移除installations数组，避免暴露其他用户信息
      };
    });

    res.json({
      success: true,
      data: { apps: formattedApps }
    });
  } catch (error) {
    console.error('获取小程序列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 安装小程序
const installMiniApp = async (req, res) => {
  try {
    const { appId } = req.params;
    const userId = req.userId;

    // 检查小程序是否存在
    const miniApp = await MiniApp.findByPk(appId);
    if (!miniApp) {
      return res.status(404).json({
        success: false,
        message: '小程序不存在'
      });
    }

    if (!miniApp.isPublished) {
      return res.status(400).json({
        success: false,
        message: '小程序尚未发布'
      });
    }

    // 检查是否已安装
    const existingInstallation = await UserMiniApp.findOne({
      where: { userId, miniAppId: appId }
    });

    if (existingInstallation) {
      if (existingInstallation.isActive) {
        return res.status(400).json({
          success: false,
          message: '小程序已安装'
        });
      } else {
        // 重新激活已卸载的小程序
        await existingInstallation.update({
          isActive: true,
          installedAt: new Date()
        });
      }
    } else {
      // 创建新安装记录
      await UserMiniApp.create({
        userId,
        miniAppId: appId
      });
    }

    // 增加下载数
    await miniApp.increment('downloads');

    res.json({
      success: true,
      message: '小程序安装成功'
    });
  } catch (error) {
    console.error('安装小程序错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 卸载小程序
const uninstallMiniApp = async (req, res) => {
  try {
    const { appId } = req.params;
    const userId = req.userId;

    const installation = await UserMiniApp.findOne({
      where: { userId, miniAppId: appId, isActive: true }
    });

    if (!installation) {
      return res.status(404).json({
        success: false,
        message: '小程序未安装'
      });
    }

    // 标记为非活跃（软删除）
    await installation.update({ isActive: false });

    res.json({
      success: true,
      message: '小程序卸载成功'
    });
  } catch (error) {
    console.error('卸载小程序错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取已安装的小程序
const getInstalledMiniApps = async (req, res) => {
  try {
    const userId = req.userId;

    const installations = await UserMiniApp.findAll({
      where: { userId, isActive: true },
      include: [
        {
          model: MiniApp,
          as: 'miniApp',
          include: [
            {
              model: User,
              as: 'developer',
              attributes: ['id', 'username', 'avatar']
            }
          ]
        }
      ],
      order: [['lastUsed', 'DESC'], ['installedAt', 'DESC']]
    });

    const installedApps = installations.map(installation => ({
      ...installation.miniApp.toJSON(),
      installedAt: installation.installedAt,
      lastUsed: installation.lastUsed,
      isInstalled: true
    }));

    res.json({
      success: true,
      data: { apps: installedApps }
    });
  } catch (error) {
    console.error('获取已安装小程序错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 更新小程序使用时间
const updateLastUsed = async (req, res) => {
  try {
    const { appId } = req.params;
    const userId = req.userId;

    const installation = await UserMiniApp.findOne({
      where: { userId, miniAppId: appId, isActive: true }
    });

    if (!installation) {
      return res.status(404).json({
        success: false,
        message: '小程序未安装'
      });
    }

    await installation.update({ lastUsed: new Date() });

    res.json({
      success: true,
      message: '使用时间已更新'
    });
  } catch (error) {
    console.error('更新使用时间错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  getMiniApps,
  installMiniApp,
  uninstallMiniApp,
  getInstalledMiniApps,
  updateLastUsed
};
// Potato Chat Desktop - Electron Builder 构建配置
// 用于生成跨平台的桌面应用安装包

const { version } = require('./package.json');

module.exports = {
  appId: 'com.potato.chat.desktop',
  productName: 'Potato Chat',
  copyright: 'Copyright © 2025 Potato Chat Team',
  
  // 应用信息
  metadata: {
    name: 'potato-chat-desktop',
    version: version,
    description: 'Potato Chat 桌面端应用',
    author: {
      name: 'Potato Chat Team',
      email: 'support@potato-chat.com',
      url: 'https://potato-chat.com'
    },
    homepage: 'https://potato-chat.com',
    repository: {
      type: 'git',
      url: 'https://github.com/potato-chat/desktop.git'
    }
  },

  // 构建目录配置
  directories: {
    buildResources: 'build',
    output: 'dist'
  },

  // 文件包含配置
  files: [
    'src/**/*',
    'assets/**/*',
    'package.json',
    '!**/*.ts',
    '!src/**/*.map',
    '!node_modules/.cache',
    '!**/{.nyc_output,coverage,docs,test,tests,typings,__tests__,__mocks__}/**/*',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
    '!.editorconfig',
    '!**/._*',
    '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
    '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
    '!**/{appveyor.yml,.travis.yml,circle.yml}',
    '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}'
  ],

  // 额外资源
  extraResources: [
    {
      from: '../potato-chat-clone/dist',
      to: 'web',
      filter: ['**/*']
    }
  ],

  // 压缩配置
  compression: 'normal',
  
  // 安全配置
  afterSign: undefined, // 代码签名后处理
  
  // Windows 配置
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64', 'ia32']
      },
      {
        target: 'portable',
        arch: ['x64']
      },
      {
        target: 'zip',
        arch: ['x64', 'ia32']
      }
    ],
    icon: 'assets/icon.ico',
    publisherName: 'Potato Chat Team',
    verifyUpdateCodeSignature: false,
    
    // Windows 应用清单
    requestedExecutionLevel: 'asInvoker',
    
    // 文件关联
    fileAssociations: [
      {
        ext: 'potato',
        name: 'Potato Chat File',
        description: 'Potato Chat 文件',
        icon: 'assets/file-icon.ico'
      }
    ],
    
    // 协议关联
    protocols: [
      {
        name: 'Potato Chat Protocol',
        schemes: ['potato-chat']
      }
    ]
  },

  // NSIS 安装器配置 (Windows)
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    allowElevation: true,
    installerIcon: 'assets/installer-icon.ico',
    uninstallerIcon: 'assets/uninstaller-icon.ico',
    installerHeaderIcon: 'assets/installer-header.ico',
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Potato Chat',
    include: 'build/installer.nsh',
    script: 'build/installer.nsh',
    
    // 自定义安装器语言
    language: ['2052'], // 简体中文
    
    // 安装器外观
    artifactName: '${productName}-${version}-${os}-${arch}-installer.${ext}',
    
    // 卸载器配置
    deleteAppDataOnUninstall: false,
    
    // 多语言支持
    multiLanguageInstaller: true,
    
    // 安装器欢迎页面
    welcomeTitle: '欢迎安装 Potato Chat',
    welcomeText: '感谢您选择 Potato Chat 桌面端应用。\\n\\n点击"下一步"继续安装。',
    
    // 完成页面
    finishTitle: '安装完成',
    finishText: 'Potato Chat 已成功安装到您的计算机。\\n\\n点击"完成"启动应用。',
    
    // 许可协议
    license: 'build/license.txt',
    
    // 运行配置
    runAfterFinish: true,
    menuCategory: '通讯工具'
  },

  // macOS 配置
  mac: {
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64']
      }
    ],
    icon: 'assets/icon.icns',
    category: 'public.app-category.social-networking',
    
    // macOS 特定配置
    darkModeSupport: true,
    hardenedRuntime: true,
    gatekeeperAssess: false,
    
    // 权限配置
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
    
    // 文件关联
    fileAssociations: [
      {
        ext: 'potato',
        name: 'Potato Chat File',
        description: 'Potato Chat 文件',
        icon: 'assets/file-icon.icns',
        role: 'Editor'
      }
    ],
    
    // 协议关联
    protocols: [
      {
        name: 'Potato Chat Protocol',
        schemes: ['potato-chat']
      }
    ],
    
    // 签名配置
    identity: null, // 开发阶段不签名
    provisioningProfile: null,
    
    // 公证配置
    notarize: false, // 开发阶段不公证
    
    // Bundle 配置
    bundleVersion: version,
    bundleShortVersion: version,
    
    // 最低系统版本
    minimumSystemVersion: '10.14.0'
  },

  // DMG 配置 (macOS)
  dmg: {
    title: '${productName} ${version}',
    icon: 'assets/dmg-icon.icns',
    iconSize: 100,
    iconTextSize: 12,
    window: {
      width: 540,
      height: 380
    },
    contents: [
      {
        x: 140,
        y: 150,
        type: 'file'
      },
      {
        x: 400,
        y: 150,
        type: 'link',
        path: '/Applications'
      }
    ],
    backgroundColor: '#ffffff',
    artifactName: '${productName}-${version}-${os}-${arch}.${ext}'
  },

  // Linux 配置
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64']
      },
      {
        target: 'deb',
        arch: ['x64']
      },
      {
        target: 'rpm',
        arch: ['x64']
      },
      {
        target: 'tar.gz',
        arch: ['x64']
      }
    ],
    icon: 'assets/icon.png',
    category: 'Network;InstantMessaging;',
    
    // Linux 桌面集成
    desktop: {
      Name: 'Potato Chat',
      Comment: 'Potato Chat 桌面端应用',
      GenericName: '即时通讯',
      Keywords: 'chat;messaging;potato;communication;',
      Categories: 'Network;InstantMessaging;Qt;',
      StartupNotify: 'true',
      StartupWMClass: 'potato-chat-desktop'
    },
    
    // 文件关联
    fileAssociations: [
      {
        ext: 'potato',
        name: 'Potato Chat File',
        description: 'Potato Chat 文件',
        icon: 'assets/file-icon.png',
        mimeType: 'application/x-potato-chat'
      }
    ],
    
    // 依赖关系
    depends: [
      'libgtk-3-0',
      'libnotify4',
      'libnss3',
      'libxss1',
      'libxtst6',
      'xdg-utils',
      'libatspi2.0-0',
      'libdrm2',
      'libxcomposite1',
      'libxdamage1',
      'libxrandr2',
      'libgbm1',
      'libxkbcommon0',
      'libasound2'
    ]
  },

  // Debian 包配置
  deb: {
    priority: 'optional',
    afterInstall: 'build/linux-after-install.sh',
    afterRemove: 'build/linux-after-remove.sh'
  },

  // RPM 包配置
  rpm: {
    fpm: ['--rpm-posttrans', 'build/linux-after-install.sh']
  },

  // AppImage 配置
  appImage: {
    artifactName: '${productName}-${version}-${arch}.${ext}'
  },

  // 发布配置
  publish: [
    {
      provider: 'github',
      owner: 'potato-chat',
      repo: 'desktop',
      private: false,
      releaseType: 'release'
    }
  ],

  // 自动更新配置
  autoUpdater: {
    provider: 'github',
    owner: 'potato-chat',
    repo: 'desktop',
    updaterCacheDirName: 'potato-chat-desktop-updater'
  },

  // 构建选项
  buildVersion: process.env.BUILD_NUMBER || version,
  
  // 构建钩子
  beforeBuild: async (context) => {
    console.log('开始构建前准备...');
    // 这里可以添加构建前的自定义逻辑
  },
  
  afterAllArtifactBuild: async (context) => {
    console.log('所有构建产物已生成');
    // 这里可以添加构建后的自定义逻辑
    return [];
  },

  // 环境变量
  env: {
    NODE_ENV: process.env.NODE_ENV || 'production'
  },

  // 扩展信息
  extends: null,

  // 远程构建配置 (可选)
  remoteBuild: false,

  // 构建缓存
  buildDependenciesFromSource: false,

  // 压缩级别
  compression: 'normal', // store, fast, normal, max

  // 包管理器
  npmRebuild: true,

  // 构建日志
  buildVersion: process.env.BUILD_VERSION || '1.0.0'
};

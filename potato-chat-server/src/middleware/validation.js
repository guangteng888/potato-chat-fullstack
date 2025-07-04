// src/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// 验证结果处理中间件
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '输入验证失败',
      errors: errors.array()
    });
  }
  next();
};

// 用户注册验证
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('用户名长度必须在3-30个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  
  body('email')
    .isEmail()
    .withMessage('请提供有效的邮箱地址')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密码必须包含至少一个大写字母、一个小写字母和一个数字'),
  
  handleValidationErrors
];

// 用户登录验证
const validateLogin = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('请提供用户名或邮箱'),
  
  body('password')
    .notEmpty()
    .withMessage('请提供密码'),
  
  handleValidationErrors
];

// 用户资料更新验证
const validateProfileUpdate = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('用户名长度必须在3-30个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('请提供有效的邮箱地址')
    .normalizeEmail(),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('个人简介不能超过500个字符'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('位置信息不能超过100个字符'),
  
  body('website')
    .optional()
    .isURL()
    .withMessage('请提供有效的网站URL'),
  
  handleValidationErrors
];

// 消息发送验证
const validateMessage = [
  body('roomId')
    .notEmpty()
    .withMessage('聊天室ID不能为空'),
  
  body('content')
    .trim()
    .isLength({ min: 1, max: 4000 })
    .withMessage('消息内容长度必须在1-4000个字符之间'),
  
  body('type')
    .optional()
    .isIn(['text', 'image', 'file', 'voice', 'video', 'location'])
    .withMessage('无效的消息类型'),
  
  handleValidationErrors
];

// 聊天室创建验证
const validateChatRoomCreation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('聊天室名称长度必须在1-100个字符之间'),
  
  body('type')
    .optional()
    .isIn(['private', 'group', 'channel'])
    .withMessage('无效的聊天室类型'),
  
  body('memberIds')
    .isArray({ min: 1 })
    .withMessage('成员列表不能为空'),
  
  handleValidationErrors
];

// 钱包转账验证
const validateTransfer = [
  body('to')
    .notEmpty()
    .withMessage('收款人不能为空'),
  
  body('amount')
    .isFloat({ min: 0.00000001 })
    .withMessage('转账金额必须大于0'),
  
  body('currency')
    .notEmpty()
    .withMessage('货币类型不能为空'),
  
  body('password')
    .notEmpty()
    .withMessage('请提供交易密码'),
  
  handleValidationErrors
];

// 分页验证
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是大于0的整数'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页条数必须在1-100之间'),
  
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateMessage,
  validateChatRoomCreation,
  validateTransfer,
  validatePagination,
  handleValidationErrors
};
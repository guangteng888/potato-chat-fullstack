# Potato Chat 部署指南

## 环境要求

- Node.js 18+ 
- npm 或 pnpm
- SQLite3 (开发环境) 或 PostgreSQL/MySQL (生产环境)

## 快速开始

### 1. 安装依赖

```bash
cd potato-chat-server
pnpm install
```

### 2. 环境配置

复制环境变量示例文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 服务器配置
PORT=3001
NODE_ENV=development

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# 数据库配置 (生产环境)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=potato_chat
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# 文件上传配置
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# 安全配置
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### 3. 数据库初始化

开发环境（SQLite）：
```bash
pnpm run dev
```

生产环境：
```bash
# 首先确保数据库服务运行
pnpm run migrate
pnpm start
```

### 4. 启动服务

开发模式：
```bash
pnpm run dev
```

生产模式：
```bash
pnpm start
```

## 生产环境部署

### 1. 服务器准备

#### Ubuntu/Debian
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 PostgreSQL (推荐)
sudo apt install -y postgresql postgresql-contrib
```

#### CentOS/RHEL
```bash
# 安装 Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 PostgreSQL
sudo yum install -y postgresql postgresql-server
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 2. 数据库配置

#### PostgreSQL 设置
```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 在 PostgreSQL 中执行
CREATE DATABASE potato_chat;
CREATE USER potato_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE potato_chat TO potato_user;
\q
```

#### 更新数据库配置
编辑 `src/config/database.js`：

```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'potato_chat',
  process.env.DB_USER || 'potato_user', 
  process.env.DB_PASSWORD || 'your_secure_password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
```

### 3. 应用部署

```bash
# 克隆代码
git clone <your-repo-url>
cd potato-chat-server

# 安装依赖
pnpm install --production

# 设置环境变量
cp .env.example .env
# 编辑 .env 文件设置生产环境配置

# 数据库迁移
pnpm run migrate

# 构建应用 (如果有构建步骤)
pnpm run build

# 使用 PM2 启动服务
pnpm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. PM2 配置

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'potato-chat-server',
    script: 'src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

### 5. Nginx 反向代理

安装 Nginx：
```bash
sudo apt install nginx
```

创建配置文件 `/etc/nginx/sites-available/potato-chat`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket 支持
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用站点：
```bash
sudo ln -s /etc/nginx/sites-available/potato-chat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL 证书 (Let's Encrypt)

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加行：0 12 * * * /usr/bin/certbot renew --quiet
```

## Docker 部署

### 1. 创建 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装 pnpm 和依赖
RUN npm install -g pnpm
RUN pnpm install --production

# 复制源代码
COPY . .

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 设置权限
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3001

CMD ["node", "src/app.js"]
```

### 2. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_NAME=potato_chat
      - DB_USER=postgres
      - DB_PASSWORD=password
    depends_on:
      - postgres
      - redis
    volumes:
      - ./uploads:/app/uploads

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: potato_chat
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 3. 启动容器

```bash
docker-compose up -d
```

## 监控和日志

### 1. 日志管理

使用 Winston 进行日志管理：

```bash
pnpm add winston winston-daily-rotate-file
```

### 2. 性能监控

集成监控工具：

```bash
# APM 监控
pnpm add newrelic

# 健康检查
pnpm add express-health-check
```

### 3. 数据库监控

```bash
# PostgreSQL 监控
sudo apt install postgresql-contrib
```

## 安全建议

### 1. 防火墙配置

```bash
# UFW 配置
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 3001  # 只允许内部访问
```

### 2. 安全头设置

安装 helmet：

```bash
pnpm add helmet
```

在 `src/app.js` 中添加：

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 3. 速率限制

已集成 express-rate-limit，确保在生产环境中启用。

### 4. 定期更新

```bash
# 检查依赖漏洞
pnpm audit

# 更新依赖
pnpm update
```

## 备份策略

### 1. 数据库备份

```bash
# PostgreSQL 备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres potato_chat > backup_$DATE.sql
```

### 2. 文件备份

```bash
# 上传文件备份
rsync -av ./uploads/ backup/uploads/
```

### 3. 自动化备份

```bash
# 添加到 crontab
0 2 * * * /path/to/backup-script.sh
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   lsof -i :3001
   kill -9 <PID>
   ```

2. **数据库连接失败**
   - 检查数据库服务状态
   - 验证连接参数
   - 检查防火墙设置

3. **内存不足**
   ```bash
   # 增加 swap
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

4. **Socket.IO 连接问题**
   - 检查 CORS 配置
   - 验证 WebSocket 支持
   - 检查代理配置

## 性能优化

1. **启用 gzip 压缩**
2. **使用 Redis 缓存**
3. **优化数据库查询**
4. **配置 CDN**
5. **启用 HTTP/2**

通过以上配置，您的 Potato Chat 服务器将具备生产环境的稳定性和安全性。

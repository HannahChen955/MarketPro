# MarketPro AI 快速启动指南 🚀

这是一个 5 分钟快速开始指南，帮你立即开始使用 MarketPro AI。

## ⚡ 一键启动（推荐）

```bash
# 1. 进入项目目录
cd MarketPro

# 2. 运行自动化启动脚本
./dev-start.sh
```

脚本将自动完成：
- ✅ 检查依赖环境
- ✅ 启动数据库服务
- ✅ 安装项目依赖
- ✅ 初始化数据库
- ✅ 填充示例数据
- ✅ 启动开发服务器

## 🎯 访问应用

启动完成后，打开浏览器访问：

- **前端应用**: http://localhost:5678
- **后端 API**: http://localhost:9527/health
- **数据库管理**: http://localhost:5050 (pgAdmin)

## 👤 默认账号

使用以下账号登录系统：

| 角色 | 邮箱 | 密码 | 说明 |
|------|------|------|------|
| 管理员 | admin@marketpro.ai | admin123 | 完整权限 |
| 演示用户 | demo@marketpro.ai | demo123 | 普通用户 |

## 🎮 快速体验

### 1. 查看首页
- 8个报告卡片，4个可用，4个待配置
- 实时统计数据展示
- 搜索和筛选功能

### 2. 生成第一份报告
1. 点击"竞品分析报告"卡片
2. 填写项目信息：
   - 项目名称：`测试项目`
   - 分析区域：`北京朝阳区`
   - 分析项目名称：`朝阳某住宅`
3. 点击"开始生成报告"
4. 观看实时进度监控
5. 下载完成的报告

### 3. 配置自定义报告
1. 点击任意"占位符"状态的卡片
2. 选择"上传分析"或"从零配置"
3. 按步骤完成配置
4. 保存新的报告类型

## 🛠️ 手动启动（如果自动化脚本失败）

### 1. 启动数据库

```bash
# 使用 Docker（推荐）
docker-compose up -d postgres redis

# 或手动启动
# PostgreSQL: brew services start postgresql
# Redis: brew services start redis
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# 编辑 .env 文件，设置数据库连接
# DATABASE_URL="postgresql://marketpro:marketpro123@localhost:5432/marketpro"
# REDIS_URL="redis://:redis123@localhost:6379"
```

### 3. 安装依赖

```bash
# 安装根目录依赖（并发启动工具）
yarn install

# 安装前端依赖
cd frontend && yarn install && cd ..

# 安装后端依赖
cd backend && yarn install && cd ..
```

### 4. 初始化数据库

```bash
cd backend

# 生成 Prisma 客户端
yarn prisma generate

# 推送数据库模式
yarn prisma db push

# 填充种子数据
yarn db:seed

cd ..
```

### 5. 启动开发服务器

```bash
# 并发启动前后端（根目录）
yarn dev

# 或分别启动
# 后端：cd backend && yarn dev
# 前端：cd frontend && yarn dev
```

## 🔧 常见问题

### Q: 数据库连接失败？
```bash
# 检查 PostgreSQL 是否运行
docker ps | grep postgres
# 或
brew services list | grep postgresql

# 检查端口是否被占用
lsof -i :5432
```

### Q: 端口冲突？
修改端口配置：
- 前端：`frontend/package.json` 中的 `-p 5678`
- 后端：`backend/src/index.ts` 中的 port 设置

### Q: AI 功能不可用？
设置 AI API 密钥：
```bash
# 编辑 .env 文件
QWEN_API_KEY=your-tongyi-qianwen-api-key
OPENAI_API_KEY=your-openai-api-key
```

### Q: 文件上传失败？
检查上传目录权限：
```bash
mkdir -p backend/uploads
chmod 755 backend/uploads
```

## 📚 下一步

1. **阅读完整文档**: 查看 `README.md`
2. **API 文档**: 访问 http://localhost:9527/health/detailed
3. **自定义配置**: 编辑 `.env` 文件
4. **部署上线**: 参考 `README.md` 中的部署章节

## 💡 开发技巧

### 重启服务
```bash
# 重启所有服务
yarn dev

# 仅重启后端
cd backend && yarn dev

# 仅重启前端
cd frontend && yarn dev
```

### 重置数据库
```bash
cd backend
yarn prisma db push --force-reset
yarn db:seed
```

### 查看日志
```bash
# 数据库日志
docker-compose logs postgres

# Redis 日志
docker-compose logs redis

# 应用日志直接在终端显示
```

### 数据库管理
```bash
# 打开 Prisma Studio
cd backend && yarn db:studio

# 或使用 pgAdmin
# 访问 http://localhost:5050
# 用户名: admin@marketpro.local
# 密码: admin123
```

## 🆘 获取帮助

- **GitHub Issues**: 报告 Bug 或功能请求
- **邮箱支持**: support@marketpro.ai
- **开发文档**: `README.md`

---

**现在开始体验 MarketPro AI 吧！** 🎉
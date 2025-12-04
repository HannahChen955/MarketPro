# MarketPro AI 🏢

智能房地产营销报告生成平台 - 使用 AI 技术自动化房地产市场分析和报告生成。

## 🚀 项目简介

MarketPro AI 是一个专为房地产行业设计的智能报告生成平台，通过 AI 技术帮助房地产营销团队快速生成专业的市场分析报告、竞品分析、投资分析等多种类型的报告。

### 主要功能

- 📊 **多种报告类型**：支持竞品分析、市场研究、项目营销方案、销售跟踪等8种报告类型
- 🤖 **AI 智能生成**：基于通义千问等 AI 模型自动生成专业报告内容
- 📁 **文件分析**：上传现有报告，AI 自动学习并生成相应的报告模板
- ⚡ **任务监控**：实时监控报告生成进度，采用轮询机制确保稳定性
- 🎨 **可视化配置**：前端界面配置报告模板，无需编程知识
- 📈 **数据统计**：详细的使用统计和效率分析


## 🛠️ 技术栈

### 前端
- **Next.js 14** - React 框架，App Router
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Framer Motion** - 动画库
- **Zustand** - 状态管理
- **React DnD Kit** - 拖拽功能

### 后端
- **Fastify** - 高性能 Node.js 服务器
- **TypeScript** - 类型安全
- **Prisma** - ORM 数据库工具
- **PostgreSQL** - 主数据库
- **Redis** - 任务队列缓存
- **Bull Queue** - 任务队列管理
- **JWT** - 身份认证

### AI & 服务
- **通义千问 (Qwen)** - 主要 AI 模型
- **OpenAI** - 备选 AI 模型
- **任务监控系统** - 自研轮询监控
- **文件处理** - PDF/PPTX 解析

## 📦 快速开始

### 环境要求

- Node.js 18.0.0 或更高版本
- PostgreSQL 12 或更高版本
- Redis 6 或更高版本
- yarn 或 npm

### 1. 克隆项目

```bash
git clone <repository-url>
cd MarketPro
```

### 2. 使用 Docker（推荐）

如果你有 Docker 和 Docker Compose，可以快速启动所有服务：

```bash
# 启动数据库和缓存服务
docker-compose up -d postgres redis

# 等待数据库启动完成
sleep 10

# 设置环境变量
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# 编辑 .env 文件，设置数据库连接
# DATABASE_URL="postgresql://marketpro:marketpro123@localhost:5432/marketpro"
# REDIS_URL="redis://:redis123@localhost:6379"
```

### 3. 手动安装数据库

如果不使用 Docker：

```bash
# 安装 PostgreSQL
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# 创建数据库
psql postgres
CREATE DATABASE marketpro;
CREATE USER marketpro WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE marketpro TO marketpro;
\q

# 安装 Redis
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
```

### 4. 安装依赖

```bash
# 安装根目录依赖（用于并发启动）
yarn install

# 安装前端依赖
cd frontend
yarn install
cd ..

# 安装后端依赖
cd backend
yarn install
cd ..
```

### 5. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env
cp frontend/.env.example frontend/.env.local

# 编辑 .env 文件
vim .env
```

重要的配置项：

```env
# 数据库连接
DATABASE_URL="postgresql://marketpro:marketpro123@localhost:5432/marketpro"

# JWT 密钥（生产环境必须修改）
JWT_SECRET="your-super-secret-jwt-key"

# AI API 密钥（需要申请）
QWEN_API_KEY="your-tongyi-qianwen-api-key"
OPENAI_API_KEY="your-openai-api-key"

# Redis 连接
REDIS_URL="redis://:redis123@localhost:6379"
```

### 6. 初始化数据库

```bash
cd backend

# 生成 Prisma 客户端
yarn prisma generate

# 运行数据库迁移
yarn prisma db push

# （可选）填充示例数据
yarn prisma db seed
```

### 7. 启动开发服务

```bash
# 在项目根目录，并发启动前后端
yarn dev

# 或者分别启动
# 启动后端 (http://localhost:9527)
cd backend && yarn dev

# 启动前端 (http://localhost:5678)
cd frontend && yarn dev
```

### 8. 访问应用

- **前端应用**: http://localhost:5678
- **后端 API**: http://localhost:9527
- **API 健康检查**: http://localhost:9527/health
- **数据库管理**: http://localhost:5050 (如果启用了 pgAdmin)

## 📚 使用指南

### 创建第一个报告

1. 访问首页，查看8个报告卡片
2. 点击任意一个"可用"状态的报告类型
3. 填写项目配置信息
4. 点击"开始生成报告"
5. 实时监控生成进度
6. 下载完成的报告

### 配置自定义报告类型

1. 点击"占位符"状态的报告卡片
2. 选择从零配置或上传现有报告分析
3. 填写报告基本信息
4. 配置输入字段
5. 确认工作流程
6. 保存配置

### 上传分析现有报告

1. 在报告配置页面选择"智能分析"
2. 上传 PDF 或 PPTX 文件
3. AI 自动分析文件结构和设计模式
4. 系统自动填充配置表单
5. 调整配置后保存

## 🔧 开发指南

### 项目结构

```
MarketPro/
├── frontend/                 # Next.js 前端应用
│   ├── src/
│   │   ├── app/             # App Router 页面
│   │   ├── components/      # React 组件
│   │   ├── stores/          # Zustand 状态管理
│   │   ├── lib/            # 工具库和 API 客户端
│   │   └── types/          # TypeScript 类型定义
│   ├── public/             # 静态资源
│   └── package.json
├── backend/                 # Fastify 后端应用
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── services/       # 业务逻辑服务
│   │   ├── models/         # 数据模型
│   │   └── utils/          # 工具函数
│   ├── prisma/             # 数据库模式和迁移
│   └── package.json
├── docker-compose.yml       # Docker 服务配置
└── README.md
```

### API 文档

主要 API 端点：

- `GET /health` - 健康检查
- `POST /api/auth/login` - 用户登录
- `GET /api/reports` - 获取报告类型列表
- `POST /api/reports` - 创建报告类型
- `POST /api/projects` - 创建项目
- `POST /api/projects/:id/generate` - 开始生成报告
- `GET /api/tasks/:id` - 获取任务状态
- `GET /api/tasks/:id/monitoring` - 获取任务监控数据

### 添加新的报告类型

1. 在数据库中定义报告配置
2. 创建对应的处理逻辑
3. 配置 AI 提示词和模板
4. 测试生成流程

### 自定义 AI 模型

1. 在 `backend/src/services/aiService.ts` 添加新的 AI 服务
2. 配置对应的 API 密钥
3. 更新报告生成逻辑

## 🚀 部署指南

### 环境配置

生产环境需要设置以下环境变量：

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/db"
JWT_SECRET="secure-random-string"
QWEN_API_KEY="production-api-key"
REDIS_URL="redis://host:6379"
```

### Docker 部署

```bash
# 构建镜像
docker-compose -f docker-compose.prod.yml build

# 启动服务
docker-compose -f docker-compose.prod.yml up -d
```

### 云服务部署

支持部署到：
- **前端**: Vercel, Netlify, CloudFlare Pages
- **后端**: Railway, Render, DigitalOcean App Platform
- **数据库**: Supabase, PlanetScale, AWS RDS
- **缓存**: Upstash Redis, AWS ElastiCache

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

此项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详细信息。

## 📞 支持

如果你在使用过程中遇到问题：

1. 查看 [常见问题](#常见问题)
2. 搜索已有的 [Issues](https://github.com/your-repo/issues)
3. 创建新的 Issue 描述问题
4. 联系开发团队

## 常见问题

### Q: 如何获取 AI API 密钥？

A:
- **通义千问**: 访问[阿里云控制台](https://dashscope.console.aliyun.com/)申请
- **OpenAI**: 访问[OpenAI 平台](https://platform.openai.com/api-keys)申请

### Q: 数据库连接失败？

A: 检查以下项目：
1. PostgreSQL 服务是否启动
2. 数据库凭据是否正确
3. 网络连接是否正常
4. 防火墙设置

### Q: 报告生成失败？

A: 可能的原因：
1. AI API 密钥无效或额度不足
2. 网络连接问题
3. 输入数据格式错误
4. 服务器资源不足

### Q: 如何自定义报告模板？

A:
1. 使用报告配置界面创建模板
2. 上传现有报告让 AI 学习
3. 直接修改数据库中的配置
4. 联系开发团队定制

---

**MarketPro AI** - 让房地产营销更智能 🚀
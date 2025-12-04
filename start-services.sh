#!/bin/bash

# MarketPro AI 服务启动脚本
echo "🚀 启动 MarketPro AI 服务..."

# 检查是否有Docker
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 需要安装 Docker"
    echo "请访问 https://docs.docker.com/get-docker/ 安装 Docker"
    exit 1
fi

# 检查是否有Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 需要安装 Node.js"
    echo "请访问 https://nodejs.org/ 安装 Node.js"
    exit 1
fi

# 启动数据库服务
echo "🐳 启动数据库服务 (PostgreSQL & Redis)..."
docker-compose up -d postgres redis

# 等待数据库启动
echo "⏰ 等待数据库启动..."
sleep 5

# 检查数据库连接
echo "🔍 检查数据库连接..."
if ! psql "postgresql://marketpro:marketpro123@localhost:5433/marketpro" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ 数据库连接失败，请检查配置"
    exit 1
fi

echo "✅ 数据库连接成功"

# 安装后端依赖（如果还没有安装）
if [ ! -d "backend/node_modules" ]; then
    echo "📦 安装后端依赖..."
    cd backend && npm install && cd ..
fi

# 安装前端依赖（如果还没有安装）
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd frontend && npm install && cd ..
fi

# 生成 Prisma 客户端和数据库迁移
echo "🗄️  设置数据库..."
cd backend && npm run db:generate && npm run db:push && cd ..

# 启动后端服务
echo "🔧 启动后端服务 (端口 9527)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# 等待后端启动
echo "⏰ 等待后端启动..."
sleep 10

# 启动前端服务
echo "🎨 启动前端服务 (端口 5678)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# 等待前端启动
echo "⏰ 等待前端启动..."
sleep 5

echo ""
echo "🎉 MarketPro AI 启动完成！"
echo ""
echo "📍 访问地址:"
echo "   前端应用: http://localhost:5678"
echo "   后端API:  http://localhost:9527"
echo "   数据库:   localhost:5433 (用户: marketpro)"
echo ""
echo "🔧 管理命令:"
echo "   停止服务: Ctrl+C"
echo "   查看日志: docker-compose logs -f"
echo "   数据库管理: docker-compose up -d pgadmin (访问 http://localhost:5050)"
echo ""
echo "💡 提示: 请保持此终端窗口打开以维持服务运行"

# 等待中断信号
wait $BACKEND_PID $FRONTEND_PID

echo "👋 服务已停止"
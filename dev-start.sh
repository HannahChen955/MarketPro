#!/bin/bash

# MarketPro AI 开发启动脚本
# 用于快速启动开发环境

set -e

echo "🚀 MarketPro AI 开发环境启动"
echo "==============================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[启动]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[提示]${NC} $1"
}

# 检查是否在项目根目录
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ 请在 MarketPro 项目根目录运行此脚本"
    exit 1
fi

# 检查环境变量文件
if [ ! -f ".env" ]; then
    print_warning "环境变量文件不存在，正在创建..."
    cp .env.example .env
    print_success "已创建 .env 文件，请根据需要修改配置"
fi

if [ ! -f "frontend/.env.local" ]; then
    print_warning "前端环境变量文件不存在，正在创建..."
    cp frontend/.env.example frontend/.env.local
    print_success "已创建 frontend/.env.local 文件"
fi

# 启动数据库服务（如果使用 Docker）
print_status "启动数据库服务..."
if command -v docker-compose >/dev/null 2>&1; then
    docker-compose up -d postgres redis
    print_success "数据库服务已启动"

    # 等待数据库就绪
    print_status "等待数据库就绪..."
    sleep 5
else
    print_warning "Docker Compose 未找到，请手动启动 PostgreSQL 和 Redis"
fi

# 检查依赖是否已安装
if [ ! -d "node_modules" ]; then
    print_status "安装根目录依赖..."
    yarn install || npm install
    print_success "根目录依赖安装完成"
fi

if [ ! -d "frontend/node_modules" ]; then
    print_status "安装前端依赖..."
    cd frontend
    yarn install || npm install
    cd ..
    print_success "前端依赖安装完成"
fi

if [ ! -d "backend/node_modules" ]; then
    print_status "安装后端依赖..."
    cd backend
    yarn install || npm install
    cd ..
    print_success "后端依赖安装完成"
fi

# 初始化数据库
print_status "初始化数据库..."
cd backend

# 生成 Prisma 客户端
if yarn prisma generate; then
    print_success "Prisma 客户端生成完成"
else
    print_warning "Prisma 客户端生成失败，请检查配置"
fi

# 推送数据库模式
if yarn prisma db push; then
    print_success "数据库模式推送完成"
else
    print_warning "数据库模式推送失败，请检查数据库连接"
fi

# 填充种子数据
print_status "填充种子数据..."
if yarn db:seed; then
    print_success "种子数据填充完成"
else
    print_warning "种子数据填充失败，请检查数据库连接"
fi

cd ..

# 启动开发服务器
print_status "启动开发服务器..."
print_warning "前端将在 http://localhost:5678 启动"
print_warning "后端将在 http://localhost:9527 启动"

echo ""
echo "🎉 开发环境启动完成！"
echo ""
echo "📝 默认登录账号:"
echo "   管理员: admin@marketpro.ai / admin123"
echo "   演示用户: demo@marketpro.ai / demo123"
echo ""
echo "🔗 访问地址:"
echo "   前端: http://localhost:5678"
echo "   后端 API: http://localhost:9527"
echo "   健康检查: http://localhost:9527/health"
echo "   数据库管理: http://localhost:5050 (pgAdmin)"
echo ""
echo "按 Ctrl+C 停止开发服务器"
echo ""

# 启动开发服务器
if command -v yarn >/dev/null 2>&1; then
    yarn dev
else
    npm run dev
fi
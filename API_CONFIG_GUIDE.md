# API 配置指南

## 🔑 通义千问 (QWEN) API Key 配置

### 1. 获取通义千问 API Key

1. **访问阿里云控制台**: https://dashscope.console.aliyun.com/
2. **登录账号**: 使用阿里云账号登录
3. **开通服务**: 
   - 进入「模型服务灵积」控制台
   - 开通通义千问API服务
4. **创建API Key**:
   - 点击「API-KEY管理」
   - 点击「创建新的API-KEY」
   - 复制生成的API Key

### 2. 配置 API Key

#### 方式一: 使用环境变量文件 (推荐)

1. **复制配置模板**:
   ```bash
   cp .env.example .env.local
   ```

2. **编辑 .env.local 文件**:
   ```bash
   # 将 your_qwen_api_key_here 替换为你的真实 API Key
   QWEN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxx
   QWEN_API_BASE=https://dashscope.aliyuncs.com/api/v1
   QWEN_MODEL=qwen-max
   DEFAULT_AI_PROVIDER=qwen
   ```

#### 方式二: 系统环境变量

```bash
# macOS/Linux
export QWEN_API_KEY="your_actual_api_key"
export DEFAULT_AI_PROVIDER="qwen"

# Windows
set QWEN_API_KEY=your_actual_api_key
set DEFAULT_AI_PROVIDER=qwen
```

#### 方式三: 直接在代码中配置 (仅开发环境)

在 `backend/src/config/ai.config.ts` 文件中直接配置：

```typescript
export const aiConfig = {
  qwen: {
    apiKey: 'your_actual_api_key', // 仅开发环境！
    baseURL: 'https://dashscope.aliyuncs.com/api/v1',
    model: 'qwen-turbo'
  }
};
```

### 3. 验证配置

运行以下命令验证 API 配置是否正确：

```bash
# 进入后端目录
cd backend

# 运行测试脚本
npm run test:ai-service
```

### 4. 模型选择

通义千问支持多种模型，**推荐使用 qwen-max 获得最佳体验**：

| 模型 | 描述 | 性能 | 适用场景 |
|------|------|------|----------|
| qwen-turbo | 快速模型 | ⭐⭐⭐ | 简单对话、基础问答 |
| qwen-plus | 标准模型 | ⭐⭐⭐⭐ | 一般分析、标准报告 |
| **qwen-max** | **旗舰模型** | **⭐⭐⭐⭐⭐** | **🎯 深度分析、专业报告、创意写作** |

**💡 MarketPro AI 默认配置为 qwen-max**，以提供最佳的报告生成质量。

如需切换模型，修改 `.env.local` 中的 `QWEN_MODEL` 变量：

```bash
QWEN_MODEL=qwen-max    # 推荐：最强性能
# QWEN_MODEL=qwen-plus  # 标准性能
# QWEN_MODEL=qwen-turbo # 快速响应
```

## 🔧 其他 API 配置

### OpenAI API (备用)

如果需要配置 OpenAI 作为备用服务：

1. **获取 OpenAI API Key**: https://platform.openai.com/api-keys
2. **配置环境变量**:
   ```bash
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxx
   OPENAI_MODEL=gpt-3.5-turbo
   ```

### 文件存储 (阿里云 OSS)

配置文件存储服务：

1. **获取 OSS 凭证**: 阿里云控制台 → 对象存储OSS
2. **配置环境变量**:
   ```bash
   OSS_ACCESS_KEY_ID=your_access_key_id
   OSS_ACCESS_KEY_SECRET=your_access_key_secret
   OSS_BUCKET=your_bucket_name
   OSS_REGION=oss-cn-hangzhou
   ```

## 🚀 快速开始

1. **复制配置文件**:
   ```bash
   cp .env.example .env.local
   ```

2. **填写 API Key**:
   ```bash
   # 编辑 .env.local，填入你的 QWEN API Key
   vim .env.local
   ```

3. **启动服务**:
   ```bash
   # 后端
   cd backend && npm run dev

   # 前端 (新终端)
   cd frontend && npm run dev
   ```

4. **访问应用**: http://localhost:3000

## ⚠️ 安全注意事项

1. **不要提交 API Key 到代码仓库**
2. **使用 .env.local 文件，已加入 .gitignore**
3. **定期轮换 API Key**
4. **生产环境使用环境变量或密钥管理服务**

## 🛠️ 故障排除

### 常见错误

1. **API Key 无效**:
   - 检查 API Key 是否正确复制
   - 确认 API Key 未过期
   - 检查账号余额是否充足

2. **网络连接问题**:
   - 检查网络连接
   - 确认防火墙设置
   - 尝试更换网络环境

3. **模型不可用**:
   - 检查模型名称是否正确
   - 确认账号有相应模型的调用权限

### 调试命令

```bash
# 检查环境变量
echo $QWEN_API_KEY

# 测试 API 连接
curl -H "Authorization: Bearer $QWEN_API_KEY" \
     -H "Content-Type: application/json" \
     https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation

# 查看日志
tail -f backend/logs/ai-service.log
```

## 📞 支持

如果遇到问题，可以：

1. 查看 [通义千问官方文档](https://help.aliyun.com/zh/dashscope/)
2. 检查项目的 GitHub Issues
3. 联系技术支持

---

**配置完成后，你就可以在 MarketPro AI 中使用通义千问的强大功能了！** 🎉

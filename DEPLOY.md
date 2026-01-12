# 拾光校园 (Shiguang Campus) - 部署文档

本文档详细说明如何在不同环境中部署和运行《拾光校园》项目。

---

## 目录

- [一、环境要求](#一环境要求)
- [二、快速开始](#二快速开始)
- [三、详细安装步骤](#三详细安装步骤)
- [四、配置说明](#四配置说明)
- [五、运行项目](#五运行项目)
- [六、生产构建](#六生产构建)
- [七、部署到生产环境](#七部署到生产环境)
- [八、常见问题排查](#八常见问题排查)
- [九、项目结构说明](#九项目结构说明)

---

## 一、环境要求

### 必需环境

| 软件        | 最低版本 | 推荐版本 | 说明                                |
| ----------- | -------- | -------- | ----------------------------------- |
| **Node.js** | 18.0.0   | 18.0.0+  | JavaScript 运行时环境               |
| **npm**     | 8.0.0    | 9.0.0+   | Node.js 包管理器（随 Node.js 安装） |
| **Git**     | 2.0.0    | 2.30.0+  | 版本控制工具（用于克隆项目）        |

### 可选环境（云端功能）

| 服务              | 说明                                 |
| ----------------- | ------------------------------------ |
| **Supabase 账号** | 用于云端数据存储和用户认证（免费版即可） |

### 系统要求

- **操作系统**：Windows 10/11、macOS 10.15+、Linux (Ubuntu 18.04+)
- **内存**：至少 4GB RAM（推荐 8GB+）
- **磁盘空间**：至少 500MB 可用空间
- **浏览器**：Chrome 90+、Firefox 88+、Safari 14+、Edge 90+

### 验证环境

在终端/命令行中执行以下命令验证环境：

```bash
# 检查 Node.js 版本
node --version
# 应显示 v18.0.0 或更高版本

# 检查 npm 版本
npm --version
# 应显示 8.0.0 或更高版本

# 检查 Git 版本（可选）
git --version
```

---

## 二、快速开始

如果您只想快速体验平台，可以跳过 Supabase 配置，使用基础功能：

```bash
# 1. 克隆项目
git clone https://github.com/paeanoo/Shiguang-Campus.git
cd vuetoreactconversion

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 在浏览器中打开 http://localhost:9000
```

**注意**：不配置 Supabase 时，平台将使用本地存储，基础功能完全可用。

---

## 三、详细安装步骤

### 步骤 1：获取项目代码

#### 方式一：从 GitHub 仓库克隆（推荐）

```bash
# 克隆项目仓库
git clone https://github.com/paeanoo/Shiguang-Campus.git

# 进入项目目录
cd vuetoreactconversion
```

**GitHub 仓库地址**：https://github.com/paeanoo/Shiguang-Campus.git

#### 方式二：使用已有项目文件夹

如果您已经下载或拥有项目文件夹：

```bash
# 进入项目目录（根据实际路径调整）
cd vuetoreactconversion
```

### 步骤 2：安装 Node.js 依赖

在项目根目录执行：

```bash
npm install
```

**预期输出**：

```
added 150 packages in 30s
```

**如果遇到问题**：

- 网络问题：使用国内镜像 `npm install --registry=https://registry.npmmirror.com`
- 权限问题：Windows 使用管理员权限，macOS/Linux 使用 `sudo`（不推荐）

### 步骤 3：验证安装

检查 `node_modules` 文件夹是否已创建，并确认关键依赖：

```bash
# 检查依赖是否安装成功
ls node_modules | grep -E "(vue|react|supabase)"

# 或使用 npm 命令
npm list vue react @supabase/supabase-js
```

---

## 四、配置说明

### 4.1 基础配置（无需配置即可运行）

项目已包含默认配置，**无需任何配置即可运行**。平台将使用：

- 本地存储（localStorage）保存用户数据
- 默认功能配置

### 4.2 Supabase 配置（可选，用于云端功能）

如果您需要使用完整的云端功能，需要配置 Supabase：

#### 4.2.1 创建 Supabase 项目

1. 访问 [Supabase 官网](https://supabase.com/)
2. 注册/登录账号
3. 创建新项目
4. 记录项目 URL 和 API Key

#### 4.2.2 配置环境变量

在项目根目录创建 `.env` 文件：

```bash
# Windows (PowerShell)
New-Item -Path .env -ItemType File

# macOS/Linux
touch .env
```

编辑 `.env` 文件，添加以下内容：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**获取配置信息**：

1. 在 Supabase Dashboard 中，进入 **Settings** → **API**
2. 复制 **Project URL** 到 `VITE_SUPABASE_URL`
3. 复制 **anon public** key 到 `VITE_SUPABASE_ANON_KEY`

#### 4.2.3 初始化数据库

在 Supabase Dashboard 的 **SQL Editor** 中执行数据库初始化：

```bash
# 使用一键脚本（推荐）
node apply-comprehensive-fix.js
```

或手动执行迁移文件：

```bash
# 依次执行 migrations/ 目录下的 SQL 文件
```

详细步骤请参考 [SETUP_GUIDE.md](./SETUP_GUIDE.md)

#### 4.2.4 配置认证方式

在 Supabase Dashboard 中：

1. 进入 **Authentication** → **Providers**
2. 启用 **Email** 认证方式
3. 配置邮箱验证（可选）

---

## 五、运行项目

### 5.1 开发模式

启动开发服务器：

```bash
npm run dev
```

**预期输出**：

```
  VITE v6.0.0  ready in 500 ms

  ➜  Local:   http://localhost:9000/
  ➜  Network: use --host to expose
```

**访问地址**：

- 本地：http://localhost:9000
- 如果配置了自动打开，浏览器会自动打开

**开发模式特性**：

- 热模块替换（HMR）：代码修改后自动刷新
- 源代码映射：便于调试
- 详细错误信息

### 5.2 预览生产构建

构建生产版本并预览：

```bash
# 先构建
npm run build

# 预览构建结果
npm run preview
```

**访问地址**：http://localhost:4173（默认端口）

---

## 六、生产构建

### 6.1 构建命令

```bash
npm run build
```

**构建输出**：

- 输出目录：`dist/`
- 包含文件：
  - `index.html` - 入口 HTML
  - `assets/` - 打包后的 JS、CSS 文件
  - 静态资源文件

**构建优化**：

- 代码压缩和混淆
- 资源优化（图片、字体等）
- Tree-shaking（移除未使用代码）
- 代码分割（按需加载）

### 6.2 构建配置

构建配置位于 `vite.config.js`：

```javascript
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 9000,        // 开发服务器端口
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
      "@/lib": path.resolve(process.cwd(), "./lib"),
    },
  },
  build: {
    outDir: 'dist',           // 输出目录
  }
})
```

### 6.3 构建产物检查

构建完成后，检查 `dist` 目录：

```bash
# Windows
dir dist

# macOS/Linux
ls -la dist
```

**预期结构**：

```
dist/
├── assets/
│   ├── index-xxxxx.js
│   └── index-xxxxx.css
├── index.html
└── 其他静态文件...
```

---

## 七、部署到生产环境（可选）

如果您需要将项目部署到生产环境，可以参考以下方式：

### 7.1 GitHub Pages

1. 构建项目：`npm run build`
2. 在 GitHub 仓库设置中启用 Pages
3. 选择 `dist` 目录作为源
4. 配置 GitHub Actions 自动部署（可选）

### 7.2 传统 Web 服务器（Nginx/Apache）

1. 构建项目：`npm run build`
2. 将 `dist` 目录内容上传到服务器
3. 配置 Web 服务器指向 `dist` 目录

**Nginx 配置示例**：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 七、常见问题排查

### 8.1 依赖安装问题

**问题**：`npm install` 失败

**解决方案**：

```bash
# 清除 npm 缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

**问题**：网络连接超时

**解决方案**：

```bash
# 使用国内镜像
npm install --registry=https://registry.npmmirror.com

# 或配置 npm 镜像
npm config set registry https://registry.npmmirror.com
```

### 8.2 运行问题

**问题**：端口被占用

**解决方案**：

```bash
# 修改 vite.config.js 中的端口
server: {
  port: 9001  // 改为其他端口
}
```

**问题**：`npm run dev` 无法启动

**解决方案**：

```bash
# 检查 Node.js 版本
node --version  # 需要 v18+

# 检查依赖是否完整安装
npm list --depth=0

# 重新安装依赖
rm -rf node_modules
npm install
```

### 8.3 Supabase 配置问题

**问题**：无法连接 Supabase

**检查清单**：

1. 确认 `.env` 文件存在且格式正确
2. 确认环境变量名称正确（`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`）
3. 确认 Supabase 项目 URL 和 Key 正确
4. 确认 Supabase 项目未暂停
5. 检查浏览器控制台错误信息

**问题**：数据库表不存在

**解决方案**：

1. 在 Supabase Dashboard 的 SQL Editor 中执行建表 SQL
2. 参考 `supabase-schema.sql` 文件
3. 使用一键修复脚本：`node apply-comprehensive-fix.js`
4. 确认表创建成功

### 8.4 构建问题

**问题**：构建失败

**解决方案**：

```bash
# 清除构建缓存
rm -rf dist node_modules/.vite

# 重新构建
npm run build
```

**问题**：构建产物过大

**解决方案**：

- 检查是否有未使用的依赖
- 使用生产构建会自动优化打包大小

### 8.5 部署问题

**问题**：部署后页面空白

**解决方案**：

1. 检查构建是否成功
2. 检查路由配置（SPA 需要配置重定向到 `index.html`）
3. 检查浏览器控制台错误
4. 确认环境变量在生产环境中正确配置

**问题**：环境变量未生效

**解决方案**：

1. 确认环境变量以 `VITE_` 开头
2. 重新构建项目（环境变量在构建时注入）
3. 在 Vercel Dashboard 中检查环境变量配置
   - 进入项目 Settings → Environment Variables
   - 确认变量已添加到 Production 环境
   - 修改后需要重新部署才能生效

---

## 八、项目结构说明

```
vuetoreactconversion/
├── dist/                    # 构建输出目录（生产构建后生成）
├── node_modules/           # 依赖包目录
├── components/             # React 组件（渐进式迁移）
├── src/                    # Vue 3 源码目录
│   ├── components/         # Vue 组件
│   ├── views/              # Vue 视图
│   ├── router/             # 路由配置
│   ├── stores/             # Vue 状态管理
│   └── main.js            # Vue 入口文件
├── lib/                    # 工具库和配置
│   ├── auth.js            # 认证相关
│   ├── supabase.js        # Supabase 配置
│   └── utils.js           # 工具函数
├── migrations/             # 数据库迁移文件
├── public/                 # 静态资源目录
│   ├── apple-icon.png     # 应用图标
│   ├── icon.svg           # 网站图标
│   └── placeholder-*.png  # 占位图片
├── styles/                 # 样式文件
├── package.json           # 项目配置和依赖
├── vite.config.js         # Vite 构建配置
├── tailwind.config.js     # Tailwind CSS 配置
├── tsconfig.json          # TypeScript 配置
├── components.json        # 组件库配置
├── .env                   # 环境变量文件（需要手动创建）
├── index.html             # HTML 入口文件
├── App.vue                # Vue 根组件
├── README.md              # 项目说明文档
├── COINS_SYSTEM_README.md # 光币系统文档
├── SETUP_GUIDE.md         # 数据库设置指南
├── SUPABASE_SETUP.md      # Supabase 设置文档
├── RUN_MIGRATIONS.md      # 迁移运行指南
├── 拾光校园项目文档.md    # 项目信息文档
├── DEPLOY.md              # 部署文档（本文档）
└── 其他配置文件...
```

---

## 九、技术支持

### 相关文档

- **项目说明**：`README.md`
- **项目信息**：`拾光校园项目文档.md`
- **光币系统**：`COINS_SYSTEM_README.md`
- **数据库设置**：`SETUP_GUIDE.md`
- **Supabase 设置**：`SUPABASE_SETUP.md`

### 技术栈版本

- **Vue.js**: 3.5.26
- **React**: 19.2.3
- **Vite**: 6.0.0
- **Vue Router**: 4.6.4
- **Supabase JS**: 2.89.0
- **Tailwind CSS**: 4.1.9
- **Radix UI**: 1.2.12+

### 获取帮助

如果遇到问题：

1. 检查本文档的"常见问题排查"部分
2. 查看浏览器控制台的错误信息
3. 检查项目相关文档
4. 查看 Supabase 官方文档（如果使用云端功能）

---

## 附录：快速命令参考

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建
npm run preview

# 清除缓存并重新安装
rm -rf node_modules package-lock.json && npm install

# 清除构建缓存
rm -rf dist node_modules/.vite

# 数据库修复（需要 Supabase 配置）
node apply-comprehensive-fix.js
```

---

## 更新日志

### v0.1.0
- 初始版本发布
- 支持基础功能：活动浏览、物品交易、光币系统、搭子广场
- Vue 3 到 React 的渐进式迁移框架
- Supabase 后端集成

---

**最后更新**: 2025-01-12

**GitHub**: https://github.com/paeanoo/Shiguang-Campus.git
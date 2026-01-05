# 拾光志 - Supabase 配置指南

## 数据库设置

### 1. 在 Supabase 中创建项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 创建新项目
3. 等待项目初始化完成

### 2. 执行数据库表结构

1. 进入 Supabase 项目的 SQL Editor
2. 打开 `supabase-schema.sql` 文件
3. 将 SQL 代码复制并粘贴到 SQL Editor 中
4. 点击 "Run" 执行 SQL

这将创建以下表：
- `profiles` - 用户资料表
- `events` - 活动表
- `event_registrations` - 活动报名表
- `products` - 商品表
- `buddy_requests` - 搭子需求表
- `buddy_members` - 搭子成员表
- `coin_transactions` - 光币交易表
- `gifts` - 礼品表
- `gift_redemptions` - 礼品兑换表

### 3. 配置 Storage Buckets

需要在 Supabase Storage 中创建以下 buckets：

#### 创建 Buckets

1. 进入 Storage 页面
2. 点击 "New bucket" 创建以下 buckets：
   - `images` - 通用图片存储
   - `products` - 商品图片
   - `events` - 活动图片
   - `avatars` - 用户头像

#### 设置 Bucket 权限

对于每个 bucket，设置为 **Public**：
1. 点击 bucket 名称
2. 进入 "Configuration" 标签
3. 将 "Public bucket" 设置为 ON

#### 设置 Storage 策略

在 SQL Editor 中执行以下 SQL 为每个 bucket 设置 RLS 策略：

```sql
-- images bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- products bucket
CREATE POLICY "Public Access Products"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

CREATE POLICY "Authenticated Upload Products"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

-- events bucket
CREATE POLICY "Public Access Events"
ON storage.objects FOR SELECT
USING ( bucket_id = 'events' );

CREATE POLICY "Authenticated Upload Events"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'events' 
  AND auth.role() = 'authenticated'
);

-- avatars bucket
CREATE POLICY "Public Access Avatars"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

CREATE POLICY "Authenticated Upload Avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);
```

### 4. 获取项目凭证

1. 进入 Project Settings > API
2. 复制以下信息：
   - Project URL
   - anon public key

### 5. 配置环境变量

在项目根目录创建 `.env` 文件：

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 6. 配置认证设置

1. 进入 Authentication > Providers
2. 确保启用 Email provider
3. 可以根据需要配置：
   - Email confirmation（邮箱确认）
   - Site URL（重定向 URL）

## 功能说明

### 用户系统

- **普通用户**：可以浏览活动、报名活动、发布商品
- **活动负责人**：可以发布活动、管理活动

### 认证码

负责人注册需要提供认证码，默认认证码为：`SHIGUANGZHI2024`

可以在 `lib/auth.js` 中修改：

```javascript
const ORGANIZER_AUTH_CODE = 'SHIGUANGZHI2024'
```

### 默认头像

系统使用 DiceBear API 自动生成默认头像：

```javascript
avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + email
```

### 图片上传

- 商品图片上传到 `products` bucket
- 活动图片上传到 `events` bucket
- 用户头像上传到 `avatars` bucket

## 测试

1. 启动开发服务器：
```bash
npm run dev
```

2. 访问 http://localhost:5173

3. 测试功能：
   - 注册新用户（普通用户）
   - 使用认证码注册负责人用户
   - 发布活动（负责人）
   - 报名活动（所有用户）
   - 发布商品（所有用户）
   - 上传图片

## 注意事项

1. **邮箱确认**：如果启用了邮箱确认，用户需要先确认邮箱才能登录
2. **Storage 大小限制**：免费版 Supabase 有 1GB 存储限制
3. **认证码安全**：生产环境应使用更安全的认证码机制
4. **RLS 策略**：确保正确设置行级安全性策略以保护数据

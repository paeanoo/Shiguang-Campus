# 修复用户头像显示和私聊功能

## 问题诊断

经过测试，发现以下问题：

1. ✗ **数据库中没有 nickname 字段** - 需要执行迁移添加字段
2. ✗ **RLS 策略阻止插入** - event_registrations 表的 RLS 策略过于严格
3. ✗ **活动没有参与者** - 需要添加测试数据
4. ✗ **用户名显示为"未知用户"** - 代码已修复，会优先显示 username

## 已修复的代码问题

### 1. EventDetailModal.vue
- ✅ 修复了用户名显示逻辑，现在会优先显示 `username` 而不是只显示 `nickname`
- ✅ 添加了点击头像显示用户详情的功能
- ✅ 添加了调试日志

### 2. UserProfileModal.vue
- ✅ 添加了计算属性 `displayName` 和 `handleUsername`
- ✅ 改进了错误处理，防止 undefined 错误
- ✅ 添加了调试日志

### 3. MessageCenter.vue
- ✅ 整合了私聊和群聊消息
- ✅ 支持实时更新
- ✅ 显示未读消息数量

## 需要执行的数据库迁移

### 步骤 1：添加用户资料字段

在 Supabase Dashboard 的 SQL Editor 中执行：

```sql
-- 2026-01-14: Add nickname field to profiles table for user display

-- Add nickname column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'nickname'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN nickname VARCHAR(255);
        RAISE NOTICE 'Added nickname column to profiles table';
    END IF;
END $$;

-- Add bio column for user description
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'bio'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN bio TEXT;
        RAISE NOTICE 'Added bio column to profiles table';
    END IF;
END $$;

-- Add location column for user location
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'location'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN location VARCHAR(255);
        RAISE NOTICE 'Added location column to profiles table';
    END IF;
END $$;

-- Add website column for user website/social links
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'website'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN website TEXT;
        RAISE NOTICE 'Added website column to profiles table';
    END IF;
END $$;

-- Update RLS policies for profiles table to allow authenticated users to read profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_public ON public.profiles;
CREATE POLICY profiles_select_public ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS profiles_update_owner ON public.profiles;
CREATE POLICY profiles_update_owner ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_insert_auth ON public.profiles;
CREATE POLICY profiles_insert_auth ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
```

### 步骤 2：修复 event_registrations RLS 策略

在 Supabase Dashboard 的 SQL Editor 中执行：

```sql
-- 2026-01-14: Fix event_registrations RLS policies to allow authenticated users to join events

-- Enable RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own registrations
DROP POLICY IF EXISTS event_registrations_insert ON public.event_registrations;
CREATE POLICY event_registrations_insert ON public.event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own registrations
DROP POLICY IF EXISTS event_registrations_delete ON public.event_registrations;
CREATE POLICY event_registrations_delete ON public.event_registrations
    FOR DELETE USING (auth.uid() = user_id);

-- Allow authenticated users to view all registrations (for participant lists)
DROP POLICY IF EXISTS event_registrations_select ON public.event_registrations;
CREATE POLICY event_registrations_select ON public.event_registrations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON public.event_registrations TO authenticated;
GRANT SELECT ON public.event_registrations TO anon;
```

### 步骤 3：添加测试参与者数据（可选）

如果你想测试参与者显示功能，可以运行：

```bash
node add-test-participants-fixed.js
```

或者手动在 Supabase Dashboard 中添加一些 event_registrations 记录。

## 验证修复

执行迁移后，运行以下命令验证：

```bash
node test-profiles-data.js
```

你应该看到：
- ✅ profiles 表包含 nickname, bio, location, website 字段
- ✅ 可以查询 event_registrations 表
- ✅ 可以插入新的 event_registrations 记录

## 功能测试

### 1. 测试用户头像显示

1. 打开活动页面
2. 点击任意活动查看详情
3. 如果有参与者，应该能看到他们的头像和用户名
4. 悬停在头像上应该显示用户名

### 2. 测试用户详情弹窗

1. 在活动详情中点击参与者头像
2. 应该弹出用户详情弹窗
3. 显示用户信息：头像、用户名、金币、碳减排量
4. 点击"发送消息"按钮应该打开私聊窗口

### 3. 测试私聊功能

1. 在用户详情弹窗中点击"发送消息"
2. 应该打开聊天窗口
3. 发送消息应该成功
4. 消息中心应该显示新的会话

### 4. 测试消息中心

1. 导航到消息中心页面
2. 应该看到所有私聊和群聊会话
3. 点击会话可以查看消息
4. 可以发送新消息

## 常见问题

### Q: 为什么显示"未知用户"？

A: 可能的原因：
1. 数据库中没有 nickname 字段（需要执行步骤 1）
2. 用户没有设置 username
3. profiles 查询失败（检查 RLS 策略）

### Q: 点击头像没有反应？

A: 可能的原因：
1. 没有执行数据库迁移
2. 浏览器控制台有错误（按 F12 查看）
3. UserProfileModal 组件没有正确导入

### Q: 无法发送消息？

A: 可能的原因：
1. 没有登录
2. RLS 策略阻止了消息插入
3. 网络连接问题

## 调试技巧

### 查看浏览器控制台

1. 按 F12 打开开发者工具
2. 切换到 Console 标签
3. 查看是否有错误信息
4. 查看我们添加的调试日志：
   - `showUserProfile called with:`
   - `UserProfileModal props:`

### 查看网络请求

1. 在开发者工具中切换到 Network 标签
2. 执行操作（如点击头像）
3. 查看是否有失败的请求
4. 检查请求的响应状态码

### 测试数据库连接

运行以下脚本测试数据库连接：

```bash
node test-profiles-data.js
```

## 相关文件

- [migrations/20260114_add_user_profile_fields.sql](file:///e:/workspace/ai_qz/vuetoreactconversion%20(1)/migrations/20260114_add_user_profile_fields.sql) - 添加用户资料字段
- [migrations/20260114_fix_event_registrations_rls.sql](file:///e:/workspace/ai_qz/vuetoreactconversion%20(1)/migrations/20260114_fix_event_registrations_rls.sql) - 修复 RLS 策略
- [src/components/UserProfileModal.vue](file:///e:/workspace/ai_qz/vuetoreactconversion%20(1)/src/components/UserProfileModal.vue) - 用户详情弹窗
- [src/components/EventDetailModal.vue](file:///e:/workspace/ai_qz/vuetoreactconversion%20(1)/src/components/EventDetailModal.vue) - 活动详情弹窗
- [src/views/MessageCenter.vue](file:///e:/workspace/ai_qz/vuetoreactconversion%20(1)/src/views/MessageCenter.vue) - 消息中心

## 下一步

执行完数据库迁移后：
1. 刷新浏览器页面
2. 测试用户头像显示
3. 测试用户详情弹窗
4. 测试私聊功能
5. 测试消息中心

如果还有问题，请查看浏览器控制台的错误信息，并根据调试技巧进行排查。

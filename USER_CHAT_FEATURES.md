# 用户头像、私聊和消息中心功能实现

## 概述

本次更新实现了以下功能：
1. ✅ 显示真实用户的头像、用户名等信息
2. ✅ 点击用户头像显示用户详细信息
3. ✅ 支持私聊发消息
4. ✅ 消息中心整合私聊和群聊消息
5. ✅ 搭子广场群聊消息集成

## 新增文件

### 1. 数据库迁移文件

**[migrations/20260114_add_user_profile_fields.sql](file:///e:/workspace/ai_qz/vuetoreactconversion%20(1)/migrations/20260114_add_user_profile_fields.sql)**

为 `profiles` 表添加了以下字段：
- `nickname` - 用户昵称
- `bio` - 个人简介
- `location` - 用户位置
- `website` - 个人网站/社交链接

更新了 RLS 策略，允许所有用户查看公开的用户资料。

### 2. 用户详情弹窗组件

**[src/components/UserProfileModal.vue](file:///e:/workspace/ai_qz/vuetoreactconversion%20(1)/src/components/UserProfileModal.vue)**

功能特性：
- 显示用户头像、昵称、用户名
- 显示个人简介
- 显示金币数量和碳减排量
- 显示用户位置和个人网站
- 提供发送消息按钮（打开私聊）
- 提供查看主页按钮
- 管理员标识

### 3. 通用用户头像组件

**[src/components/UserAvatar.vue](file:///e:/workspace/ai_qz/vuetoreactconversion%20(1)/src/components/UserAvatar.vue)**

可复用的用户头像组件，支持：
- 自定义尺寸（xs, sm, md, lg, xl）
- 可选圆角或圆角矩形
- 点击事件处理
- 未读消息徽章
- 悬停提示
- 头像加载失败自动回退到默认头像

## 更新的文件

### 1. 消息中心

**[src/views/MessageCenter.vue](file:///e:/workspace/ai_qz/vuetoreactconversion%20(1)/src/views/MessageCenter.vue)**

重大改进：
- 整合私聊和群聊消息
- 左侧显示所有会话列表（私聊 + 群聊）
- 支持搜索联系人和群聊
- 显示未读消息数量
- 群聊消息显示发送者名称
- 实时消息更新
- 查看用户资料按钮
- 改进的 UI 设计

### 2. 活动详情弹窗

**[src/components/EventDetailModal.vue](file:///e:/workspace/ai_qz/vuetoreactconversion%20(1)/src/components/EventDetailModal.vue)**

更新内容：
- 参与者头像可点击
- 点击头像打开用户详情弹窗
- 显示完整的用户信息（昵称、简介等）
- 头像悬停效果

### 3. 搭子广场

**[src/components/BuddyPage.vue](file:///e:/workspace/ai_qz/vuetoreactconversion%20(1)/src/components/BuddyPage.vue)**

更新内容：
- 房间成员头像可点击
- 点击头像打开用户详情弹窗
- 集成用户详情弹窗组件

## 数据库表结构

### profiles 表

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT,
  nickname TEXT,          -- 新增
  avatar_url TEXT,
  user_type TEXT,
  coins INTEGER DEFAULT 0,
  carbon_reduced DECIMAL(10,2) DEFAULT 0.0,
  last_check_in_date DATE,
  check_in_streak INTEGER DEFAULT 0,
  bio TEXT,               -- 新增
  location TEXT,          -- 新增
  website TEXT,           -- 新增
  created_at TIMESTAMP WITH TIME ZONE
)
```

### messages 表（私聊）

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id),
  receiver_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE
)
```

### room_messages 表（群聊）

```sql
CREATE TABLE room_messages (
  id UUID PRIMARY KEY,
  room_id BIGINT REFERENCES partner_requests(id),
  sender_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE
)
```

## 使用说明

### 1. 应用数据库迁移

在 Supabase 控制台中执行以下 SQL：

```bash
# 方法 1：通过 Supabase Dashboard
1. 打开 Supabase Dashboard
2. 进入 SQL Editor
3. 复制并执行 migrations/20260114_add_user_profile_fields.sql

# 方法 2：使用 psql
psql -h your-project.supabase.co -U postgres -d postgres -f migrations/20260114_add_user_profile_fields.sql
```

### 2. 在组件中使用用户头像

```vue
<template>
  <UserAvatar
    :user="userObject"
    size="md"
    @click="handleAvatarClick"
  />
</template>

<script setup>
import UserAvatar from '@/components/UserAvatar.vue'

function handleAvatarClick(user) {
  // 处理点击事件
}
</script>
```

### 3. 显示用户详情弹窗

```vue
<template>
  <UserProfileModal
    :show="showModal"
    :user="selectedUser"
    :current-user="currentUser"
    @close="showModal = false"
  />
</template>

<script setup>
import UserProfileModal from '@/components/UserProfileModal.vue'

const showModal = ref(false)
const selectedUser = ref(null)
</script>
```

## 功能特性

### 用户详情弹窗
- ✅ 显示完整的用户信息
- ✅ 一键发送私聊消息
- ✅ 查看用户主页
- ✅ 管理员标识
- ✅ 响应式设计

### 消息中心
- ✅ 私聊和群聊统一管理
- ✅ 实时消息更新
- ✅ 未读消息提醒
- ✅ 搜索功能
- ✅ 查看用户资料
- ✅ 群聊显示发送者名称

### 用户头像
- ✅ 可复用组件
- ✅ 多种尺寸
- ✅ 点击事件
- ✅ 未读徽章
- ✅ 悬停提示
- ✅ 错误处理

## RLS 策略

### profiles 表
- **SELECT**: 所有人可以查看公开资料
- **UPDATE**: 用户只能更新自己的资料
- **INSERT**: 用户只能插入自己的资料

### messages 表
- **SELECT**: 用户只能查看自己发送或接收的消息
- **INSERT**: 用户只能以自己的身份发送消息
- **UPDATE**: 用户只能更新自己发送的消息
- **DELETE**: 用户只能删除自己发送的消息

### room_messages 表
- **SELECT**: 所有已认证用户可以查看群聊消息
- **INSERT**: 所有已认证用户可以发送群聊消息

## 注意事项

1. **数据库迁移**: 必须先执行数据库迁移才能使用新功能
2. **用户头像**: 确保用户上传了头像，否则会使用默认头像
3. **实时更新**: 消息中心依赖 Supabase Realtime 功能
4. **权限控制**: 确保 RLS 策略正确配置

## 后续改进建议

1. 添加用户主页页面
2. 支持用户搜索和发现
3. 添加消息已读状态
4. 支持消息撤回
5. 添加表情和图片消息
6. 支持语音消息
7. 添加消息通知
8. 支持群聊管理（踢人、禁言等）

## 相关文件

- [UserProfileModal.vue](file:///e:/workspace/ai_qz/vuetoreactconversion%20(1)/src/components/UserProfileModal.vue) - 用户详情弹窗
- [UserAvatar.vue](file:///e:/workspace/ai_qz/vuetoreactconversion%20(1)/src/components/UserAvatar.vue) - 通用头像组件
- [MessageCenter.vue](file:///e:/workspace/ai_qz/vuetoreactconversion%20(1)/src/views/MessageCenter.vue) - 消息中心
- [EventDetailModal.vue](file:///e:/workspace/ai_qz/vuetoreactconversion%20(1)/src/components/EventDetailModal.vue) - 活动详情弹窗
- [BuddyPage.vue](file:///e:/workspace/ai_qz/vuetoreactconversion%20(1)/src/components/BuddyPage.vue) - 搭子广场
- [chatStore.js](file:///e:/workspace/ai_qz/vuetoreactconversion%20(1)/src/stores/chatStore.js) - 聊天状态管理

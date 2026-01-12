# 运行数据库迁移脚本

## 问题说明

如果你遇到以下错误：
- `Could not find the 'related_event_id' column of 'buddy_requests' in the schema cache`
- 找搭子发布失败

这是因为数据库中存在旧版本的 `buddy_requests` 表，缺少 `related_event_id` 列。

## 解决方法

### 步骤 1：登录 Supabase

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单的 "SQL Editor"

### 步骤 2：运行迁移脚本

**重要：按顺序运行以下两个脚本**

#### 2.1 先运行添加列的脚本
1. 点击 "New query" 创建新查询
2. 复制以下文件的内容并粘贴到 SQL Editor 中：
   - `migrations/20260109_add_buddy_requests_columns.sql` ⭐ (必须先运行这个)
3. 点击 "Run" 按钮执行脚本

#### 2.2 再运行创建表的脚本（如果需要）
如果上面的脚本提示表不存在，则运行：
1. 点击 "New query" 创建新查询
2. 复制以下文件的内容并粘贴到 SQL Editor 中：
   - `migrations/20260109_create_buddy_requests_table.sql`
3. 点击 "Run" 按钮执行脚本

### 步骤 3：验证

运行成功后，你应该看到：
- `buddy_requests` 表已存在
- 包含以下字段：
  - `id` (BIGSERIAL, 主键)
  - `creator_id` (UUID, 外键关联 auth.users)
  - `title` (TEXT)
  - `description` (TEXT)
  - `tags` (TEXT[], 数组类型)
  - `slots_total` (INTEGER)
  - `slots_filled` (INTEGER)
  - `related_event_id` (BIGINT, 外键关联 events.id) ⭐
  - `category` (VARCHAR(50))
  - `created_at` (TIMESTAMP WITH TIME ZONE)
  - `updated_at` (TIMESTAMP WITH TIME ZONE)

## 标签功能说明

找搭子发布页面现在支持两种标签输入方式：

### 1. 快速选择预设标签
- 点击预设标签按钮即可添加/取消
- 预设标签包括：学习、运动、约饭、娱乐、音乐、电影、游戏、拼车、AA制、周末、限女生、限男生、长期、短期、图书馆、健身房、户外、室内、线上、线下

### 2. 自定义标签
- 在输入框中输入自定义标签
- 用逗号分隔多个标签（例如：`学习,音乐,周末`）
- 按回车键或点击其他地方（失去焦点）自动添加
- 已选标签会显示在下方，点击标签可以删除

## 其他迁移脚本

如果需要运行其他迁移脚本，请按以下顺序执行：

1. `20260106_fix_coin_transactions_type_check.sql`
2. `20260106_fix_gift_id.sql`
3. `20260107_create_partner_requests_and_messages.sql`
4. `20260109_create_buddy_requests_table.sql` ⭐ (本次修复)
5. `20260109_add_buddy_requests_columns.sql`
6. `20260109_fix_buddy_requests_delete.sql`
7. `20260110_upgrade_event_registration.sql`
8. `20260111_add_event_click_tracking.sql`
9. `20260111_fix_slots_filled.sql`
10. `20260114_create_room_messages.sql`
11. `20260114_add_user_profile_fields.sql`
12. `20260114_fix_event_participants_display.sql`
13. `20260114_fix_event_registrations_rls.sql`
14. `20260115_create_buddy_request_members.sql`
15. `20260115_add_creators_to_members.sql` ⭐ (将所有创建者添加到成员列表)
16. `20260115_fix_event_click_tracking.sql` ⭐ (修复活动热度计数)
17. `20260115_init_event_clicks.sql` ⭐ (初始化活动热度数据)

## 修复人数显示为0的问题

如果你发现搭子房间的人数显示为0，需要运行以下迁移脚本：

### 步骤：
1. 打开 Supabase Dashboard
2. 进入 SQL Editor
3. 复制 `migrations/20260111_fix_slots_filled.sql` 的内容
4. 粘贴到 SQL Editor 中并点击 "Run"

这个脚本会将所有 `slots_filled` 为 0 或 null 的记录更新为 1（创建者自己）。

### 如果人数仍然显示不正确

如果运行上面的脚本后，人数仍然显示不正确（例如明明有两个人却显示只有一个），需要运行以下脚本：

1. 复制 `migrations/20260115_add_creators_to_members.sql` 的内容
2. 粘贴到 SQL Editor 中并点击 "Run"

这个脚本会：
- 将所有房间的创建者添加到 `buddy_request_members` 表中
- 根据 `buddy_request_members` 表中的实际成员数量更新 `slots_filled` 字段

这样就能确保人数统计是基于实际的成员数据，而不是猜测的值。

## 修复活动热度显示为0的问题

如果你发现活动的热度一直显示为0，需要运行以下迁移脚本：

### 步骤：
1. 打开 Supabase Dashboard
2. 进入 SQL Editor
3. 复制 `migrations/20260115_fix_event_click_tracking.sql` 的内容
4. 粘贴到 SQL Editor 中并点击 "Run"

这个脚本会：
- 更新 `increment_event_clicks` 函数，使其对所有类型的活动（内部和外部）都进行计数
- 将所有 `click_count` 为 NULL 的记录更新为 0
- 显示当前热度最高的活动列表

这样就能确保活动热度正确显示，无论活动是内部还是外部类型。

### 如果热度仍然显示为0

如果运行上面的脚本后，热度仍然显示为0，这是因为还没有用户点击过活动。你可以运行以下脚本来初始化一些测试数据：

1. 复制 `migrations/20260115_init_event_clicks.sql` 的内容
2. 粘贴到 SQL Editor 中并点击 "Run"

这个脚本会：
- 为所有 `click_count` 为 0 或 NULL 的活动添加随机点击数（1-100之间）
- 显示更新后的热度排名

这样你就能看到活动的热度效果了。

## 常见问题

### Q: 运行脚本后还是报错？
A: 请刷新浏览器页面，清除缓存后重试。

### Q: 如何检查表是否创建成功？
A: 在 SQL Editor 中运行：
```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'buddy_requests';
```

### Q: 如何查看表结构？
A: 在 SQL Editor 中运行：
```sql
\d public.buddy_requests
```

或者运行 `inspect-database.sql` 中的查询语句。

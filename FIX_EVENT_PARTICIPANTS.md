# 修复活动参与者显示问题

## 问题诊断

通过测试发现，数据库的 RLS（Row Level Security）策略存在**无限递归**问题，导致：

1. ✗ 参与者列表无法显示
2. ✗ 点击"标记加入"按钮时出现 500 错误
3. ✗ 错误信息：`infinite recursion detected in policy for relation "event_registrations"`

## 根本原因

旧的 RLS 策略（在 `migrations/20260112_event_registration_rls.sql` 中）包含复杂的子查询，导致策略之间相互引用产生无限循环。

## 解决方案

### 方法 1：通过 Supabase 控制台执行（推荐）

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 在左侧导航栏中点击 **SQL Editor**
4. 点击 **New Query** 创建新查询
5. 复制以下 SQL 代码并粘贴到编辑器中：

```sql
-- 2026-01-14: Fix event participants display and RLS issues
-- This migration ensures all authenticated users can view event participants

-- 1. Add missing columns to events table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'organizer_id') THEN
        ALTER TABLE public.events ADD COLUMN organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added organizer_id column to events table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'show_participants') THEN
        ALTER TABLE public.events ADD COLUMN show_participants BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added show_participants column to events table';
    END IF;
END $$;

-- 2. Enable RLS on events table if not already enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 3. Update events table RLS policies
DROP POLICY IF EXISTS events_select ON public.events;
CREATE POLICY events_select ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS events_delete_owner ON public.events;
CREATE POLICY events_delete_owner ON public.events
    FOR DELETE USING (auth.uid() = organizer_id);

DROP POLICY IF EXISTS events_update_owner ON public.events;
CREATE POLICY events_update_owner ON public.events
    FOR UPDATE USING (auth.uid() = organizer_id);

-- 4. Simplify event_registrations RLS policies to allow all authenticated users to view participants     
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS event_registrations_select ON public.event_registrations;
CREATE POLICY event_registrations_select ON public.event_registrations
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS event_registrations_insert ON public.event_registrations;
CREATE POLICY event_registrations_insert ON public.event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS event_registrations_delete ON public.event_registrations;
CREATE POLICY event_registrations_delete ON public.event_registrations
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Ensure foreign key constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'event_registrations_user_id_fkey'
        AND table_name = 'event_registrations'
    ) THEN
        ALTER TABLE public.event_registrations
        ADD CONSTRAINT event_registrations_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.profiles(id)
        ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint to event_registrations.user_id';
    END IF;
END $$;

-- 6. Ensure unique constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'event_registrations_event_user_unique'
        AND table_name = 'event_registrations'
    ) THEN
        ALTER TABLE public.event_registrations
        ADD CONSTRAINT event_registrations_event_user_unique
        UNIQUE (event_id, user_id);
        RAISE NOTICE 'Added unique constraint to event_registrations';
    END IF;
END $$;

-- 7. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_registrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
```

6. 点击 **Run** 按钮执行 SQL
7. 等待执行完成，你应该看到类似以下的输出：
   ```
   NOTICE:  Added organizer_id column to events table
   NOTICE:  Added show_participants column to events table
   NOTICE:  Added foreign key constraint to event_registrations.user_id
   NOTICE:  Added unique constraint to event_registrations
   Success. No rows returned
   ```

### 方法 2：使用 psql 命令行工具

如果你有数据库访问权限，可以使用 psql 命令：

```bash
psql -h your-project.supabase.co -U postgres -d postgres -f migrations/20260114_fix_event_participants_display.sql
```

## 验证修复

执行迁移后，运行以下测试脚本验证修复是否成功：

```bash
node test-event-participants.js
```

你应该看到类似以下的输出：

```
Testing event participants functionality...

1. Checking events table structure...
  Error checking events table: Could not find the function public.get_table_columns(table_name) in the schema cache

2. Checking event_registrations table structure...
  Error checking event_registrations table: Could not find the function public.get_table_columns(table_name) in the schema cache

3. Testing participant fetch...
  Using event: 吉他社 2025 秋季招新宣讲会 (ID: 1)
  ✓ Successfully fetched X registrations

4. Checking RLS policies...
  Error checking policies: Could not find the function public.get_policies(table_name) in the schema cache
  Note: get_policies function may not exist, checking manually...
  ✓ Can query event_registrations table

✓ Test completed
```

## 迁移说明

这个迁移做了以下更改：

1. **添加缺失的列**：为 `events` 表添加 `organizer_id` 和 `show_participants` 列
2. **简化 RLS 策略**：移除了导致无限递归的复杂子查询
3. **开放参与者查看权限**：允许所有已认证用户查看活动参与者列表
4. **确保约束存在**：添加外键约束和唯一约束
5. **授予权限**：确保 `authenticated` 角色有必要的权限

## 新的 RLS 策略

### event_registrations 表

- **SELECT**：所有已认证用户可以查看所有注册记录（用于显示参与者列表）
- **INSERT**：用户只能插入自己的注册记录
- **DELETE**：用户只能删除自己的注册记录

### events 表

- **SELECT**：所有人可以查看活动（公开）
- **UPDATE**：只有活动组织者可以更新
- **DELETE**：只有活动组织者可以删除

## 故障排除

如果执行迁移后仍然有问题：

1. **清除浏览器缓存**：有时浏览器会缓存旧的 API 响应
2. **检查用户登录状态**：确保用户已登录（RLS 策略需要认证）
3. **查看浏览器控制台**：检查是否有其他错误信息
4. **重新加载页面**：确保前端使用了最新的代码

## 相关文件

- 迁移文件：`migrations/20260114_fix_event_participants_display.sql`
- 测试脚本：`test-event-participants.js`
- 前端组件：`src/components/EventDetailModal.vue`

-- 检查当前 Supabase 数据库结构和数据的 SQL 查询
-- 在 Supabase SQL Editor 中运行此脚本可查看所有表结构和数据

-- 1. 查看所有表
SELECT
    schemaname,
    tablename,
    tableowner,
    tablespace,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. 查看每个表的详细结构
SELECT
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.numeric_precision,
    c.numeric_scale,
    c.is_nullable,
    c.column_default,
    CASE WHEN pk.column_name IS NOT NULL THEN 'YES' ELSE 'NO' END as is_primary_key,
    CASE WHEN fk.column_name IS NOT NULL THEN 'YES' ELSE 'NO' END as is_foreign_key
FROM information_schema.columns c
LEFT JOIN information_schema.table_constraints tc
    ON tc.table_name = c.table_name
    AND tc.constraint_type = 'PRIMARY KEY'
LEFT JOIN information_schema.key_column_usage pk
    ON pk.constraint_name = tc.constraint_name
    AND pk.column_name = c.column_name
LEFT JOIN information_schema.key_column_usage fk
    ON fk.table_name = c.table_name
    AND fk.column_name = c.column_name
    AND fk.position_in_unique_constraint IS NOT NULL
JOIN information_schema.tables t
    ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- 3. 查看所有索引
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 4. 查看所有约束
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- 5. 查看所有函数
SELECT
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    obj_description(p.oid, 'pg_proc') as description
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;

-- 6. 查看行级安全策略
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 7. 查看表数据量统计
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- 8. 查看具体表数据 (请根据需要取消注释)

-- -- 查看 profiles 表数据
-- SELECT id, email, coins, carbon_reduced, last_check_in_date, check_in_streak,
--        created_at, updated_at
-- FROM profiles
-- LIMIT 10;

-- -- 查看 tasks 表数据
-- SELECT id, title, description, reward_coins, reward_carbon, task_type,
--        requirements, is_active, created_at, updated_at
-- FROM tasks;

-- -- 查看 gifts 表数据
-- SELECT id, title, description, image_url, price, stock, is_available,
--        category, redemption_instructions, created_at, updated_at
-- FROM gifts;

-- -- 查看 user_tasks 表数据
-- SELECT id, user_id, task_id, status, progress, completed_at, claimed_at,
--        created_at, updated_at
-- FROM user_tasks
-- LIMIT 20;

-- -- 查看 check_ins 表数据
-- SELECT id, user_id, check_in_date, reward_coins, reward_carbon, streak_day, created_at
-- FROM check_ins
-- ORDER BY created_at DESC
-- LIMIT 20;

-- -- 查看 gift_redemptions 表数据
-- SELECT id, user_id, gift_id, redemption_code, status, redeemed_at, created_at
-- FROM gift_redemptions
-- ORDER BY created_at DESC
-- LIMIT 20;

-- -- 查看 coin_transactions 表数据
-- SELECT id, user_id, amount, transaction_type, description, related_id, created_at
-- FROM coin_transactions
-- ORDER BY created_at DESC
-- LIMIT 20;

-- -- 查看 buddy_requests 表数据 (检查是否存在)
-- SELECT id, creator_id, title, description, tags, max_members, joined_count,
--        slots_total, current_slots, created_at
-- FROM buddy_requests
-- ORDER BY created_at DESC
-- LIMIT 20;

-- -- 查看 partner_requests 表数据 (检查是否存在)
-- SELECT id, creator_id, title, description, tags, max_slots, current_slots,
--        related_event_id, created_at
-- FROM partner_requests
-- ORDER BY created_at DESC
-- LIMIT 20;



-- 修复 events 表的 RLS 策略
-- 问题：活动发布时遇到 "new row violates row-level security policy" 错误

-- 1. 确保 RLS 已启用
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 2. 删除所有现有的 events 表策略
DROP POLICY IF EXISTS events_select ON public.events;
DROP POLICY IF EXISTS events_insert ON public.events;
DROP POLICY IF EXISTS events_update ON public.events;
DROP POLICY IF EXISTS events_delete ON public.events;
DROP POLICY IF EXISTS events_delete_owner ON public.events;
DROP POLICY IF EXISTS events_update_owner ON public.events;
DROP POLICY IF EXISTS events_insert_policy ON public.events;

-- 3. 创建新的 RLS 策略

-- SELECT 策略：允许所有人读取活动
CREATE POLICY events_select ON public.events
  FOR SELECT USING (true);

-- INSERT 策略：允许已认证用户创建活动
CREATE POLICY events_insert ON public.events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- UPDATE 策略：只允许活动创建者更新自己的活动
CREATE POLICY events_update ON public.events
  FOR UPDATE USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

-- DELETE 策略：只允许活动创建者删除自己的活动
CREATE POLICY events_delete ON public.events
  FOR DELETE USING (auth.uid() = organizer_id);

-- 4. 验证策略是否创建成功
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'events' 
        AND policyname = 'events_insert'
    ) THEN
        RAISE NOTICE 'events_insert policy created successfully';
    ELSE
        RAISE NOTICE 'Failed to create events_insert policy';
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'events' 
        AND policyname = 'events_select'
    ) THEN
        RAISE NOTICE 'events_select policy created successfully';
    ELSE
        RAISE NOTICE 'Failed to create events_select policy';
    END IF;
END $$;

SELECT 'Events 表 RLS 策略修复完成！' as status;

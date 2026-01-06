-- 检查 tasks 表的 requirements 字段类型
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
  AND column_name = 'requirements';

-- 检查 user_tasks 表的 progress 字段类型
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_tasks'
  AND column_name = 'progress';

-- 查看一个任务的 requirements 字段示例
SELECT id, title, requirements
FROM public.tasks
LIMIT 1;

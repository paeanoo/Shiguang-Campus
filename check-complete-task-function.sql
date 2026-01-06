-- 检查 complete_task 函数的定义
SELECT '检查 complete_task 函数定义:' as info;

-- 查看函数定义
SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'complete_task';

-- 查看函数参数
SELECT
  proname as function_name,
  proargnames as argument_names,
  proargtypes as argument_types
FROM pg_proc
WHERE proname = 'complete_task';

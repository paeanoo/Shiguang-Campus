-- 检查 gifts 表的 price 和 stock 字段类型
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'gifts'
  AND column_name IN ('price', 'stock');

-- 检查 profiles 表的 coins 字段类型
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name = 'coins';

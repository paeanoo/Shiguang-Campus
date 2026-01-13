-- 修复 profiles 表的 username 唯一约束问题
-- 问题：username 列有唯一约束，但触发器使用 email 作为默认值可能导致冲突

-- 1. 检查并删除 username 的唯一约束
DO $$
BEGIN
    -- 删除可能存在的 username 唯一约束
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_key') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_username_key;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'idx_profiles_username') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT idx_profiles_username;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_username_unique') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_username_unique;
    END IF;
END $$;

-- 2. 重新创建 handle_new_user 函数，确保 username 唯一性
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_user_type TEXT;
  v_auth_code TEXT;
  v_username TEXT;
  v_base_username TEXT;
  v_counter INTEGER := 1;
BEGIN
  -- 获取用户类型和认证码
  v_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'user');
  v_auth_code := NEW.raw_user_meta_data->>'auth_code';

  -- 生成唯一的 username
  v_base_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  v_username := v_base_username;

  -- 检查 username 是否已存在，如果存在则添加后缀
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
    v_username := v_base_username || v_counter;
    v_counter := v_counter + 1;
  END LOOP;

  -- 插入 profile 记录
  INSERT INTO public.profiles (id, email, username, user_type, avatar_url, coins, carbon_reduced)
  VALUES (
    NEW.id,
    NEW.email,
    v_username,
    v_user_type,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.email),
    0,
    0
  );

  -- 只有活动负责人才需要验证认证码
  IF v_user_type = 'organizer' THEN
    -- 检查是否提供了认证码
    IF v_auth_code IS NULL OR v_auth_code = '' THEN
      RAISE EXCEPTION '活动负责人必须提供认证码';
    END IF;

    -- 验证并使用认证码
    IF NOT public.validate_and_use_auth_code(v_auth_code, NEW.id) THEN
      RAISE EXCEPTION '认证码无效或已被使用';
    END IF;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 记录详细错误信息
    RAISE EXCEPTION '创建用户资料失败: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 重新创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

SELECT 'Username 唯一约束问题修复完成！' as status;

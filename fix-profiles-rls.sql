-- 修复 profiles 表的 RLS 策略
-- 问题：触发器无法在 profiles 表中插入数据

-- 1. 检查并修复 profiles 表的 RLS 策略
-- 允许触发器（SECURITY DEFINER）插入数据
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 创建新的 RLS 策略
CREATE POLICY "Enable insert for authenticated users" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable read for all users" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Enable update for own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. 确保 profiles 表有正确的结构
DO $$
BEGIN
    -- 检查并添加缺失的列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'coins') THEN
        ALTER TABLE profiles ADD COLUMN coins INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'carbon_reduced') THEN
        ALTER TABLE profiles ADD COLUMN carbon_reduced DECIMAL(10,2) DEFAULT 0.0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_check_in_date') THEN
        ALTER TABLE profiles ADD COLUMN last_check_in_date DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'check_in_streak') THEN
        ALTER TABLE profiles ADD COLUMN check_in_streak INTEGER DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_type') THEN
        ALTER TABLE profiles ADD COLUMN user_type VARCHAR(20) DEFAULT 'user';
    END IF;
END $$;

-- 3. 重新创建 handle_new_user 函数，添加更详细的错误处理
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_user_type TEXT;
  v_auth_code TEXT;
BEGIN
  -- 获取用户类型和认证码
  v_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'user');
  v_auth_code := NEW.raw_user_meta_data->>'auth_code';

  -- 先插入 profile 记录
  INSERT INTO public.profiles (id, email, username, user_type, avatar_url, coins, carbon_reduced)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
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

-- 4. 重新创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

SELECT 'Profiles 表 RLS 策略修复完成！' as status;

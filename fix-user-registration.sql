-- 修复用户注册问题的完整脚本
-- 问题：auth_codes 表不存在导致所有用户注册失败

-- 1. 创建 auth_codes 表
CREATE TABLE IF NOT EXISTS public.auth_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_auth_codes_code ON public.auth_codes(code);
CREATE INDEX IF NOT EXISTS idx_auth_codes_is_used ON public.auth_codes(is_used);

-- 启用 RLS
ALTER TABLE public.auth_codes ENABLE ROW LEVEL SECURITY;

-- RLS 策略
DROP POLICY IF EXISTS "Auth codes are readable" ON public.auth_codes;
CREATE POLICY "Auth codes are readable" ON public.auth_codes 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth codes insert by authenticated" ON public.auth_codes;
CREATE POLICY "Auth codes insert by authenticated" ON public.auth_codes 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 插入一些测试用的认证码
INSERT INTO public.auth_codes (code, is_used) VALUES
  ('TEST001', FALSE),
  ('TEST002', FALSE),
  ('TEST003', FALSE)
ON CONFLICT (code) DO NOTHING;

-- 2. 创建/更新 validate_and_use_auth_code 函数
CREATE OR REPLACE FUNCTION public.validate_and_use_auth_code(p_code TEXT, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_code_exists BOOLEAN;
  v_code_upper TEXT;
BEGIN
  -- 转换为大写
  v_code_upper := UPPER(TRIM(p_code));

  -- 检查认证码是否存在且未被使用
  SELECT EXISTS (
    SELECT 1 FROM public.auth_codes
    WHERE code = v_code_upper AND is_used = FALSE
  ) INTO v_code_exists;

  IF NOT v_code_exists THEN
    RAISE EXCEPTION '认证码无效或已被使用';
  END IF;

  -- 标记认证码为已使用
  UPDATE public.auth_codes
  SET
    is_used = TRUE,
    used_by = p_user_id,
    used_at = NOW()
  WHERE code = v_code_upper;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 创建/更新 handle_new_user 函数（确保普通用户不受影响）
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 重新创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

SELECT '用户注册问题修复完成！' as status;
SELECT 'auth_codes 表已创建' as step1;
SELECT 'validate_and_use_auth_code 函数已更新' as step2;
SELECT 'handle_new_user 触发器已更新' as step3;

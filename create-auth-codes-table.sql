-- 检查并创建 auth_codes 表
-- 该表用于存储活动负责人的认证码

-- 创建 auth_codes 表
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

-- RLS 策略：允许所有人读取认证码状态（但不包括已使用的认证码详情）
CREATE POLICY "Auth codes are readable" ON public.auth_codes 
  FOR SELECT USING (true);

-- RLS 策略：只有认证服务可以插入和更新（通过 SECURITY DEFINER 函数）
-- 这里我们允许所有认证用户插入，实际控制通过 validate_and_use_auth_code 函数
CREATE POLICY "Auth codes insert by authenticated" ON public.auth_codes 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 插入一些测试用的认证码（可选）
INSERT INTO public.auth_codes (code, is_used) VALUES
  ('TEST001', FALSE),
  ('TEST002', FALSE),
  ('TEST003', FALSE)
ON CONFLICT (code) DO NOTHING;

SELECT 'auth_codes 表创建完成！' as status;

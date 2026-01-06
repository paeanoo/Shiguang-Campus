-- 拾光志数据库表结构

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户资料表（更新）
DO $$
BEGIN
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
END $$;

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reward_coins INTEGER NOT NULL DEFAULT 0,
  reward_carbon DECIMAL(5,2) NOT NULL DEFAULT 0.0,
  task_type VARCHAR(50) NOT NULL, -- 'publish_product', 'complete_transaction', 'share', 'check_in', etc.
  requirements JSONB, -- 任务要求，如数量等
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 用户任务完成记录表
CREATE TABLE IF NOT EXISTS user_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'claimed'
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, task_id)
);

-- 签到记录表
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  check_in_date DATE NOT NULL,
  reward_coins INTEGER NOT NULL,
  reward_carbon DECIMAL(5,2) NOT NULL,
  streak_day INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, check_in_date)
);

-- 礼品表
CREATE TABLE IF NOT EXISTS gifts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  price INTEGER NOT NULL, -- 所需光币
  stock INTEGER DEFAULT -1, -- -1表示无限库存
  is_available BOOLEAN DEFAULT true,
  category VARCHAR(50), -- 'food', 'stationery', 'decoration', 'other'
  redemption_instructions TEXT, -- 兑换说明
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 为已存在的表添加缺失的列（如果不存在）
DO $$
BEGIN
    -- gifts表列检查
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifts' AND column_name = 'description') THEN
        ALTER TABLE gifts ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifts' AND column_name = 'image_url') THEN
        ALTER TABLE gifts ADD COLUMN image_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifts' AND column_name = 'stock') THEN
        ALTER TABLE gifts ADD COLUMN stock INTEGER DEFAULT -1;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifts' AND column_name = 'is_available') THEN
        ALTER TABLE gifts ADD COLUMN is_available BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifts' AND column_name = 'category') THEN
        ALTER TABLE gifts ADD COLUMN category VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifts' AND column_name = 'redemption_instructions') THEN
        ALTER TABLE gifts ADD COLUMN redemption_instructions TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifts' AND column_name = 'created_at') THEN
        ALTER TABLE gifts ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gifts' AND column_name = 'updated_at') THEN
        ALTER TABLE gifts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;
    END IF;

    -- gift_redemptions表列检查
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gift_redemptions' AND column_name = 'redemption_code') THEN
        ALTER TABLE gift_redemptions ADD COLUMN redemption_code VARCHAR(100) UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gift_redemptions' AND column_name = 'status') THEN
        ALTER TABLE gift_redemptions ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gift_redemptions' AND column_name = 'redeemed_at') THEN
        ALTER TABLE gift_redemptions ADD COLUMN redeemed_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gift_redemptions' AND column_name = 'created_at') THEN
        ALTER TABLE gift_redemptions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;
    END IF;
END $$;

-- 礼品兑换记录表（在列检查之后创建）
CREATE TABLE IF NOT EXISTS gift_redemptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gift_id BIGINT REFERENCES gifts(id) ON DELETE CASCADE NOT NULL,
  redemption_code VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'expired'
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 光币交易记录表
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- 正数为收入，负数为支出
  type VARCHAR(50) NOT NULL, -- 'check_in', 'task_reward', 'gift_redeem', 'admin_adjust'
  description TEXT,
  related_id UUID, -- 关联的任务ID、礼品兑换ID等
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ensure allowed values for type (keep in sync with migrations)
ALTER TABLE IF EXISTS public.coin_transactions
  DROP CONSTRAINT IF EXISTS coin_transactions_type_check;
ALTER TABLE IF EXISTS public.coin_transactions
  ADD CONSTRAINT coin_transactions_type_check CHECK (type IN ('check_in','task_reward','gift_redeem','redeem','admin_adjust'));

-- 插入默认任务数据
INSERT INTO tasks (title, description, reward_coins, reward_carbon, task_type, requirements) VALUES
('每日签到', '连续签到7天额外奖励', 10, 0.1, 'check_in', '{"streak_required": 1}'),
('发布闲置物品', '上传一件二手物品', 50, 0.5, 'publish_product', '{"count": 1}'),
('完成一笔交易', '成功买卖一件物品', 100, 1.0, 'complete_transaction', '{"count": 1}'),
('分享给好友', '邀请好友加入拾光志', 30, 0.3, 'share', '{"count": 1}'),
('完善个人资料', '上传头像并设置用户名', 20, 0.2, 'complete_profile', '{}'),
('参与校园活动', '报名并参加一次校园活动', 40, 0.4, 'join_event', '{"count": 1}')
ON CONFLICT DO NOTHING;

-- 插入默认礼品数据
INSERT INTO gifts (title, description, image_url, price, stock, category, redemption_instructions) VALUES
('校园咖啡券', '价值20元的校园咖啡店兑换券，可兑换热咖啡或冷饮', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop', 200, 50, 'food', '请凭兑换码到校园咖啡店出示此小票进行兑换'),
('精美笔记本', 'A5尺寸米色纸笔记本，环保材质', 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop', 300, 30, 'stationery', '请凭兑换码到学生服务中心领取'),
('多肉植物盆栽', '精致的多肉植物盆栽，净化空气', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop', 250, 20, 'decoration', '请凭兑换码到校园花园中心领取'),
('校园文具套装', '包含笔、尺子、胶带等基础文具', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop', 150, 100, 'stationery', '请凭兑换码到学生服务中心领取'),
('环保购物袋', '可重复使用的环保购物袋', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', 80, 200, 'other', '请凭兑换码到校园服务中心领取'),
('定制校园杯子', '印有校园Logo的保温杯', 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop', 400, 15, 'other', '请凭兑换码到学生服务中心领取'),
('校园书签套装', '精美书签和书夹组合，多种设计可选', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop', 120, 80, 'stationery', '请凭兑换码到图书馆服务台领取'),
('环保水杯', '304不锈钢保温杯，环保无毒', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop', 350, 25, 'other', '请凭兑换码到学生服务中心领取'),
('校园明信片', '精美校园风景明信片套装', 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=400&fit=crop', 60, 150, 'stationery', '请凭兑换码到校园书店领取'),
('环保帆布袋', '结实耐用的帆布购物袋', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', 100, 120, 'other', '请凭兑换码到校园服务中心领取')
ON CONFLICT DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_status ON user_tasks(status);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_date ON check_ins(check_in_date);
CREATE INDEX IF NOT EXISTS idx_gift_redemptions_user_id ON gift_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_redemptions_code ON gift_redemptions(redemption_code);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_type ON coin_transactions(type);

-- 创建函数：检查用户是否可以签到
CREATE OR REPLACE FUNCTION can_user_check_in(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    last_checkin DATE;
    today_date DATE := CURRENT_DATE;
BEGIN
    SELECT last_check_in_date INTO last_checkin
    FROM profiles
    WHERE id = user_uuid;

    RETURN last_checkin IS NULL OR last_checkin < today_date;
END;
$$;

-- 创建函数：领取任务奖励
CREATE OR REPLACE FUNCTION public.claim_task_reward(user_uuid UUID, task_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_task RECORD;
    v_task RECORD;
    v_reward_coins INTEGER;
    v_reward_carbon DECIMAL(5,2);
    v_today DATE := CURRENT_DATE;
    v_completion_count INTEGER;
BEGIN
    SELECT * INTO v_user_task
    FROM public.user_tasks
    WHERE user_id = user_uuid AND task_id = task_uuid;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', '任务记录不存在');
    END IF;

    IF v_user_task.status = 'claimed' THEN
        RETURN json_build_object('success', false, 'message', '奖励已领取');
    END IF;

    IF v_user_task.status != 'completed' THEN
        RETURN json_build_object('success', false, 'message', '任务尚未完成');
    END IF;

    SELECT * INTO v_task FROM public.tasks WHERE id = task_uuid;
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', '任务不存在');
    END IF;

    IF v_task.task_type IN ('publish_product', 'share', 'join_event') THEN
        SELECT COUNT(*) INTO v_completion_count
        FROM public.user_tasks
        WHERE user_id = user_uuid
          AND task_id = task_uuid
          AND DATE(created_at) = v_today
          AND status = 'claimed';

        IF v_completion_count >= 1 THEN
            RETURN json_build_object('success', false, 'message', '今日已完成此任务，请明天再来');
        END IF;
    END IF;

    v_reward_coins := v_task.reward_coins;
    v_reward_carbon := v_task.reward_carbon;

    UPDATE public.profiles
    SET coins = COALESCE(coins, 0) + v_reward_coins,
        carbon_reduced = COALESCE(carbon_reduced, 0) + v_reward_carbon
    WHERE id = user_uuid;

    UPDATE public.user_tasks
    SET status = 'claimed',
        updated_at = NOW(),
        claimed_at = NOW()
    WHERE user_id = user_uuid AND task_id = task_uuid;

    INSERT INTO public.coin_transactions (user_id, amount, type, description, related_id, created_at)
    VALUES (user_uuid, v_reward_coins, 'task_reward', v_task.title || '任务奖励', task_uuid, NOW());

    RETURN json_build_object('success', true, 'reward_coins', v_reward_coins, 'reward_carbon', v_reward_carbon);
END;
$$;

-- 创建函数：执行签到
CREATE OR REPLACE FUNCTION perform_check_in(user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
    reward_coins INTEGER := 0;
    reward_carbon DECIMAL(5,2) := 0.0;
    new_streak INTEGER;
    today_date DATE := CURRENT_DATE;
    last_checkin DATE;
BEGIN
    -- 检查是否已经签到
    SELECT last_check_in_date INTO last_checkin
    FROM profiles
    WHERE id = user_uuid;

    IF last_checkin = today_date THEN
        RETURN json_build_object('success', false, 'message', '今日已签到');
    END IF;

    -- 计算连续签到天数
    IF last_checkin = today_date - 1 THEN
        -- 连续签到
        UPDATE profiles
        SET check_in_streak = check_in_streak + 1,
            last_check_in_date = today_date
        WHERE id = user_uuid
        RETURNING check_in_streak INTO new_streak;
    ELSE
        -- 断签，重新开始
        UPDATE profiles
        SET check_in_streak = 1,
            last_check_in_date = today_date
        WHERE id = user_uuid
        RETURNING check_in_streak INTO new_streak;
    END IF;

    -- 不在此处发放奖励；奖励通过任务完成/领取流程发放，避免重复

    -- 记录签到（不包含直接奖励）
    INSERT INTO check_ins (user_id, check_in_date, reward_coins, reward_carbon, streak_day)
    VALUES (user_uuid, today_date, 0, 0.0, new_streak);

    -- 标记对应的签到任务为已完成（如果存在 task_type = 'check_in' 的任务）
    INSERT INTO user_tasks (user_id, task_id, status, completed_at, created_at, updated_at)
    SELECT user_uuid, t.id, 'completed', NOW(), NOW(), NOW()
    FROM tasks t
    WHERE t.task_type = 'check_in'
    ON CONFLICT (user_id, task_id) DO UPDATE
      SET status = 'completed', completed_at = NOW(), updated_at = NOW();

    RETURN json_build_object(
        'success', true,
        'reward_coins', reward_coins,
        'reward_carbon', reward_carbon,
        'streak', new_streak
    );
END;
$$;

-- 创建函数：完成任务
CREATE OR REPLACE FUNCTION complete_task(user_uuid UUID, task_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    task_record RECORD;
    reward_coins INTEGER;
    reward_carbon DECIMAL(5,2);
BEGIN
    -- 获取任务信息
    SELECT * INTO task_record FROM tasks WHERE id = task_uuid;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', '任务不存在');
    END IF;

    -- 如果已领取则阻止重复领取
    IF EXISTS (SELECT 1 FROM user_tasks WHERE user_id = user_uuid AND task_id = task_uuid AND status = 'claimed') THEN
        RETURN json_build_object('success', false, 'message', '任务已领取');
    END IF;

    -- 标记任务为完成（不直接发放奖励，奖励由 claim_task_reward 发放）
    INSERT INTO user_tasks (user_id, task_id, status, completed_at)
    VALUES (user_uuid, task_uuid, 'completed', NOW())
    ON CONFLICT (user_id, task_id)
    DO UPDATE SET
        status = 'completed',
        completed_at = NOW(),
        updated_at = NOW();

    reward_coins := task_record.reward_coins;
    reward_carbon := task_record.reward_carbon;

    RETURN json_build_object(
        'success', true,
        'reward_coins', reward_coins,
        'reward_carbon', reward_carbon,
        'task_title', task_record.title
    );
END;
$$;

-- 创建函数：兑换礼品
CREATE OR REPLACE FUNCTION redeem_gift(user_uuid UUID, gift_id BIGINT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    gift_record RECORD;
    user_coins INTEGER;
    redemption_code VARCHAR(100);
BEGIN
    -- 获取礼品信息
    SELECT * INTO gift_record FROM gifts WHERE id = gift_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', '礼品不存在');
    END IF;

    IF NOT gift_record.is_available THEN
        RETURN json_build_object('success', false, 'message', '礼品已下架');
    END IF;

    -- 检查库存
    IF gift_record.stock >= 0 AND gift_record.stock = 0 THEN
        RETURN json_build_object('success', false, 'message', '礼品库存不足');
    END IF;

    -- 获取用户光币
    SELECT coins INTO user_coins FROM profiles WHERE id = user_uuid;

    IF user_coins < gift_record.price THEN
        RETURN json_build_object('success', false, 'message', '光币不足');
    END IF;

    -- 生成兑换码
    redemption_code := 'SGZ' || UPPER(SUBSTRING(MD5(RANDOM()::text || NOW()::text) FROM 1 FOR 8));

    -- 扣除光币
    UPDATE profiles
    SET coins = coins - gift_record.price
    WHERE id = user_uuid;

    -- 减少库存
    IF gift_record.stock > 0 THEN
        UPDATE gifts
        SET stock = stock - 1
        WHERE id = gift_id;
    END IF;

    -- 记录兑换
    INSERT INTO gift_redemptions (user_id, gift_id, redemption_code)
    VALUES (user_uuid, gift_id, redemption_code);

    -- 记录交易
    INSERT INTO coin_transactions (user_id, amount, type, description, related_id)
    VALUES (user_uuid, -gift_record.price, 'gift_redeem', '兑换' || gift_record.title, NULL);

    RETURN json_build_object(
        'success', true,
        'redemption_code', redemption_code,
        'gift_title', gift_record.title,
        'price', gift_record.price
    );
END;
$$;

-- 设置行级安全策略 (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

-- 任务表策略 - 所有人可读，管理员可写
CREATE POLICY "Tasks are viewable by everyone" ON tasks FOR SELECT USING (true);
CREATE POLICY "Tasks are manageable by admins" ON tasks FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 用户任务策略 - 用户只能看到自己的记录
CREATE POLICY "Users can view own tasks" ON user_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON user_tasks FOR ALL USING (auth.uid() = user_id);

-- 签到记录策略 - 用户只能看到自己的记录
CREATE POLICY "Users can view own check-ins" ON check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own check-ins" ON check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 礼品表策略 - 所有人可读，管理员可写
CREATE POLICY "Gifts are viewable by everyone" ON gifts FOR SELECT USING (true);
CREATE POLICY "Gifts are manageable by admins" ON gifts FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 礼品兑换策略 - 用户只能看到自己的记录
CREATE POLICY "Users can view own redemptions" ON gift_redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create redemptions" ON gift_redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 交易记录策略 - 用户只能看到自己的记录
CREATE POLICY "Users can view own transactions" ON coin_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create transactions" ON coin_transactions FOR INSERT WITH CHECK (true);
 
-- 9. 兼容旧/反向参数顺序的函数重载（解决 schema cache 中可能的签名不匹配）
-- 如果某些客户端/代理以 (task_uuid, user_uuid) 的顺序调用 RPC，会导致找不到函数，添加一个重载来桥接两个顺序。
CREATE OR REPLACE FUNCTION complete_task(task_uuid UUID, user_uuid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN complete_task(user_uuid, task_uuid);
END;
$$;
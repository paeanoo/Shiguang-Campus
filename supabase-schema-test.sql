-- 拾光志数据库表结构 - 测试版本
-- 这个文件用于测试和逐步执行SQL语句

-- 首先执行表创建和列添加
-- 1. 添加profiles表的缺失列
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS carbon_reduced DECIMAL(10,2) DEFAULT 0.0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_check_in_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS check_in_streak INTEGER DEFAULT 0;

-- 2. 创建任务表
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reward_coins INTEGER NOT NULL DEFAULT 0,
  reward_carbon DECIMAL(5,2) NOT NULL DEFAULT 0.0,
  task_type VARCHAR(50) NOT NULL,
  requirements JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. 创建用户任务表
CREATE TABLE IF NOT EXISTS user_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, task_id)
);

-- 4. 创建签到表
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

-- 5. 创建礼品表
CREATE TABLE IF NOT EXISTS gifts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  price INTEGER NOT NULL,
  stock INTEGER DEFAULT -1,
  is_available BOOLEAN DEFAULT true,
  category VARCHAR(50),
  redemption_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. 修复gifts表，确保所有列都存在
DO $$
BEGIN
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
END $$;

-- 7. 创建礼品兑换表
CREATE TABLE IF NOT EXISTS gift_redemptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gift_id UUID REFERENCES gifts(id) ON DELETE CASCADE NOT NULL,
  redemption_code VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. 创建交易记录表
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  description TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 插入测试数据
-- 插入任务数据
INSERT INTO tasks (title, description, reward_coins, reward_carbon, task_type, requirements) VALUES
('每日签到', '连续签到7天额外奖励', 10, 0.1, 'check_in', '{"streak_required": 1}'),
('发布闲置物品', '上传一件二手物品', 50, 0.5, 'publish_product', '{"count": 1}'),
('完成一笔交易', '成功买卖一件物品', 100, 1.0, 'complete_transaction', '{"count": 1}')
ON CONFLICT DO NOTHING;

-- 插入礼品数据
INSERT INTO gifts (title, description, image_url, price, stock, category, redemption_instructions) VALUES
('校园咖啡券', '价值20元的校园咖啡店兑换券，可兑换热咖啡或冷饮', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop', 200, 50, 'food', '请凭兑换码到校园咖啡店出示此小票进行兑换'),
('精美笔记本', 'A5尺寸米色纸笔记本，环保材质', 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop', 300, 30, 'stationery', '请凭兑换码到学生服务中心领取')
ON CONFLICT DO NOTHING;



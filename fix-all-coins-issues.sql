-- 修复光币中心的所有问题
-- 1. 签到重复问题
-- 2. 签到后自动获得奖励但还能再次领取
-- 3. 刷新后数据归零
-- 4. 任务完成逻辑
-- 5. 任务完成次数限制
-- 6. 移除交易任务

-- 1. 修复 perform_check_in � - 确保一天只能签到一次
CREATE OR REPLACE FUNCTION public.perform_check_in(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  v_last_check_in_date TIMESTAMP WITH TIME ZONE;
  v_check_in_streak INTEGER;
  v_reward_coins INTEGER := 5;
  v_reward_carbon NUMERIC := 0.5;
  v_today DATE := CURRENT_DATE;
  v_last_check_date DATE;
BEGIN
  -- 获取用户最后签到日期和连续签到天数
  SELECT last_check_in_date, check_in_streak
  INTO v_last_check_in_date, v_check_in_streak
  FROM public.profiles
  WHERE id = user_uuid;

  -- 将 TIMESTAMP 转换为 DATE 进行比较
  v_last_check_date := v_last_check_in_date::DATE;

  -- 检查今天是否已经签到
  IF v_last_check_date = v_today THEN
    RETURN json_build_object(
      'success', false,
      'message', '今天已经签到过了'
    );
  END IF;

  -- 计算新的连续签到天数
  IF v_last_check_date = v_today - INTERVAL '1 day' THEN
    -- 如果昨天签到过，连续天数+1
    v_check_in_streak := v_check_in_streak + 1;
  ELSEIF v_last_check_date IS NULL OR v_last_check_date < v_today - INTERVAL '1 day' THEN
    -- 如果没有签到记录或断签，重置为1
    v_check_in_streak := 1;
  END IF;

  -- 连续签到奖励
  IF v_check_in_streak >= 7 THEN
    v_reward_coins := v_reward_coins + 5;
    v_reward_carbon := v_reward_carbon + 0.5;
  END IF;

  IF v_check_in_streak >= 30 THEN
    v_reward_coins := v_reward_coins + 10;
    v_reward_carbon := v_reward_carbon + 1.0;
  END IF;

  -- 更新用户资料
  UPDATE public.profiles
  SET
    coins = COALESCE(coins, 0) + v_reward_coins,
    carbon_reduced = COALESCE(carbon_reduced, 0) + v_reward_carbon,
    last_check_in_date = NOW(),
    check_in_streak = v_check_in_streak
  WHERE id = user_uuid;

  -- 返回结果
  RETURN json_build_object(
    'success', true,
    'reward_coins', v_reward_coins,
    'reward_carbon', v_reward_carbon,
    'check_in_streak', v_check_in_streak,
    'message', '签到成功'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 修复 complete_task � - 添加每日完成次数限制
CREATE OR REPLACE FUNCTION public.complete_task(user_uuid UUID, task_uuid UUID)
RETURNS JSON AS $$
DECLARE
  v_task RECORD;
  v_user_task RECORD;
  v_reward_coins INTEGER;
  v_reward_carbon NUMERIC;
  v_requirements_count INTEGER;
  v_today DATE := CURRENT_DATE;
  v_completion_count INTEGER;
BEGIN
  -- 获取任务信息
  SELECT * INTO v_task
  FROM public.tasks
  WHERE id = task_uuid AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', '任务不存在或已失效'
    );
  END IF;

  -- 安全地获取 requirements 中的 count 值
  BEGIN
    SELECT COALESCE((requirements->>'count')::INTEGER, 1) INTO v_requirements_count
    FROM public.tasks
    WHERE id = task_uuid;
  EXCEPTION WHEN OTHERS THEN
    v_requirements_count := 1;
  END;

  -- 检查用户任务记录
  SELECT * INTO v_user_task
  FROM public.user_tasks
  WHERE user_id = user_uuid AND task_id = task_uuid;

  IF FOUND THEN
    -- 如果任务已完成，返回错误
    IF v_user_task.status = 'claimed' THEN
      RETURN json_build_object(
        'success', false,
        'message', '任务奖励已领取'
      );
    END IF;

    -- 检查每日完成次数限制
    IF v_task.task_type IN ('publish_product', 'share', 'join_event') THEN
      SELECT COUNT(*) INTO v_completion_count
      FROM public.user_tasks
      WHERE user_id = user_uuid
        AND task_id = task_uuid
        AND DATE(created_at) = v_today
        AND status = 'claimed';

      IF v_completion_count >= 1 THEN
        RETURN json_build_object(
          'success', false,
          'message', '今日已完成此任务，请明天再来'
        );
      END IF;
    END IF;

    -- 更新任务状态为已完成
    UPDATE public.user_tasks
    SET
      status = 'completed',
      progress = v_requirements_count,
      updated_at = NOW()
    WHERE user_id = user_uuid AND task_id = task_uuid;
  ELSE
    -- 创建新的用户任务记录
    INSERT INTO public.user_tasks (user_id, task_id, status, progress, created_at, updated_at)
    VALUES (user_uuid, task_uuid, 'completed', v_requirements_count, NOW(), NOW());
  END IF;

  -- 获取奖励
  v_reward_coins := v_task.reward_coins;
  v_reward_carbon := v_task.reward_carbon;

  -- 更新用户光币和减碳量
  UPDATE public.profiles
  SET
    coins = COALESCE(coins, 0) + v_reward_coins,
    carbon_reduced = COALESCE(carbon_reduced, 0) + v_reward_carbon
  WHERE id = user_uuid;

  -- 返回结果
  RETURN json_build_object(
    'success', true,
    'reward_coins', v_reward_coins,
    'reward_carbon', v_reward_carbon,
    'message', '任务完成'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 创建 claim_task_reward 函数 - 领取任务奖励（新增）
CREATE OR REPLACE FUNCTION public.claim_task_reward(user_uuid UUID, task_uuid UUID)
RETURNS JSON AS $$
DECLARE
  v_user_task RECORD;
  v_task RECORD;
  v_reward_coins INTEGER;
  v_reward_carbon NUMERIC;
  v_today DATE := CURRENT_DATE;
  v_completion_count INTEGER;
BEGIN
  -- 获取用户任务记录
  SELECT * INTO v_user_task
  FROM public.user_tasks
  WHERE user_id = user_uuid AND task_id = task_uuid;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', '任务记录不存在'
    );
  END IF;

  -- 检查任务状态
  IF v_user_task.status = 'claimed' THEN
    RETURN json_build_object(
      'success', false,
      'message', '奖励已领取'
    );
  END IF;

  IF v_user_task.status != 'completed' THEN
    RETURN json_build_object(
      'success', false,
      'message', '任务尚未完成'
    );
  END IF;

  -- 获取任务信息
  SELECT * INTO v_task
  FROM public.tasks
  WHERE id = task_uuid;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', '任务不存在'
    );
  END IF;

  -- 检查每日完成次数限制
  IF v_task.task_type IN ('publish_product', 'share', 'join_event') THEN
    SELECT COUNT(*) INTO v_completion_count
    FROM public.user_tasks
    WHERE user_id = user_uuid
      AND task_id = task_uuid
      AND DATE(created_at) = v_today
      AND status = 'claimed';

    IF v_completion_count >= 1 THEN
      RETURN json_build_object(
        'success', false,
        'message', '今日已完成此任务，请明天再来'
      );
    END IF;
  END IF;

  -- 获取奖励
  v_reward_coins := v_task.reward_coins;
  v_reward_carbon := v_task.reward_carbon;

  -- 更新用户光币和减碳量
  UPDATE public.profiles
  SET
    coins = COALESCE(coins, 0) + v_reward_coins,
    carbon_reduced = COALESCE(carbon_reduced, 0) + v_reward_carbon
  WHERE id = user_uuid;

  -- 更新任务状态为已领取
  UPDATE public.user_tasks
  SET
    status = 'claimed',
    updated_at = NOW()
  WHERE user_id = user_uuid AND task_id = task_uuid;

  -- 返回结果
  RETURN json_build_object(
    'success', true,
    'reward_coins', v_reward_coins,
    'reward_carbon', v_reward_carbon,
    'message', '奖励领取成功'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 修复 redeem_gift 函数 - 使用 COALESCE 防止归零
CREATE OR REPLACE FUNCTION public.redeem_gift(user_uuid UUID, gift_uuid UUID)
RETURNS JSON AS $$
DECLARE
  v_gift RECORD;
  v_balance NUMERIC;
  v_price NUMERIC;
  v_stock INTEGER;
  v_redemption_code TEXT;
BEGIN
  -- 获取用户光币余额（使用 COALESCE 防止 NULL）
  SELECT COALESCE(coins, 0) INTO v_balance
  FROM public.profiles
  WHERE id = user_uuid;

  -- 获取礼品信息
  SELECT * INTO v_gift
  FROM public.gifts
  WHERE id = gift_uuid AND is_available = true;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', '礼品不存在或已下架'
    );
  END IF;

  -- 转换价格为 NUMERIC 类型
  v_price := v_gift.price::NUMERIC;
  v_stock := v_gift.stock::INTEGER;

  -- 检查库存
  IF v_stock <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'message', '礼品库存不足'
    );
  END IF;

  -- 检查光币余额（使用 NUMERIC 比较）
  IF v_balance < v_price THEN
    RETURN json_build_object(
      'success', false,
      'message', '光币余额不足'
    );
  END IF;

  -- 生成兑换码
  v_redemption_code := 'GIFT-' || UPPER(md5(random()::text || clock_timestamp()::text));

  -- 扣除光币
  UPDATE public.profiles
  SET coins = COALESCE(coins, 0) - v_price::INTEGER
  WHERE id = user_uuid;

  -- 减少库存
  UPDATE public.gifts
  SET stock = stock - 1
  WHERE id = gift_uuid;

  -- 创建兑换记录
  INSERT INTO public.gift_redemptions (user_id, gift_id, redemption_code, status, created_at)
  VALUES (user_uuid, gift_uuid, v_redemption_code, 'pending', NOW());

  -- 返回结果
  RETURN json_build_object(
    'success', true,
    'redemption_code', v_redemption_code,
    'price', v_price::INTEGER,
    'message', '兑换成功'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 更新任务数据 - 移除 complete_transaction 任务，添加每日限制
-- 删除交易相关任务
UPDATE public.tasks
SET is_active = false
WHERE task_type = 'complete_transaction';

-- 更新任务要求，添加每日限制
UPDATE public.tasks
SET requirements = jsonb_set(
  COALESCE(requirements, '{}'::jsonb),
  '{daily_limit}',
  '1'
)
WHERE task_type IN ('publish_product', 'share', 'join_event');

-- 6. 修复 handle_new_user 触发器 - 确保 coins 和 carbon_reduced 不为 NULL
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_user_type TEXT;
  v_auth_code TEXT;
BEGIN
  -- 获取用户类型和认证码
  v_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'user');
  v_auth_code := NEW.raw_user_meta_data->>'auth_code';

  -- 先插入 profile 记录，确保 coins 和 carbon_reduced 不为 NULL
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

  -- 如果是活动负责人，必须提供并验证认证码
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

-- 重新创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. 修复现有数据 - 确保 coins 和 carbon_reduced 不为 NULL
UPDATE public.profiles
SET
  coins = COALESCE(coins, 0),
  carbon_reduced = COALESCE(carbon_reduced, 0)
WHERE coins IS NULL OR carbon_reduced IS NULL;

SELECT '所有问题修复完成！' as status;

-- 创建光币中心所需的 RPC 函数（修复版）
-- 这些函数用于处理签到、完成任务、兑换礼品等功能

-- 1. 创建 perform_check_in 函数 - 每日签到
CREATE OR REPLACE FUNCTION public.perform_check_in(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  v_last_check_in_date DATE;
  v_check_in_streak INTEGER;
  v_reward_coins INTEGER := 5;
  v_reward_carbon NUMERIC := 0.5;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- 获取用户最后签到日期和连续签到天数
  SELECT last_check_in_date, check_in_streak
  INTO v_last_check_in_date, v_check_in_streak
  FROM public.profiles
  WHERE id = user_uuid;

  -- 检查今天是否已经签到
  IF v_last_check_in_date = v_today THEN
    RETURN json_build_object(
      'success', false,
      'message', '今天已经签到过了'
    );
  END IF;

  -- 计算新的连续签到天数
  IF v_last_check_in_date = v_today - INTERVAL '1 day' THEN
    -- 如果昨天签到过，连续天数+1
    v_check_in_streak := v_check_in_streak + 1;
  ELSEIF v_last_check_in_date IS NULL OR v_last_check_in_date < v_today - INTERVAL '1 day' THEN
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
    coins = coins + v_reward_coins,
    carbon_reduced = carbon_reduced + v_reward_carbon,
    last_check_in_date = v_today,
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

-- 2. 创建 complete_task 函数 - 完成任务（修复版）
CREATE OR REPLACE FUNCTION public.complete_task(user_uuid UUID, task_uuid UUID)
RETURNS JSON AS $$
DECLARE
  v_task RECORD;
  v_user_task RECORD;
  v_reward_coins INTEGER;
  v_reward_carbon NUMERIC;
  v_requirements_count INTEGER;
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
    SELECT (requirements->>'count')::INTEGER INTO v_requirements_count
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
    coins = coins + v_reward_coins,
    carbon_reduced = carbon_reduced + v_reward_carbon
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

-- 3. 创建 redeem_gift 函数 - 兑换礼品
CREATE OR REPLACE FUNCTION public.redeem_gift(user_uuid UUID, gift_uuid UUID)
RETURNS JSON AS $$
DECLARE
  v_gift RECORD;
  v_balance INTEGER;
  v_redemption_code TEXT;
BEGIN
  -- 获取用户光币余额
  SELECT coins INTO v_balance
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

  -- 检查库存
  IF v_gift.stock <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'message', '礼品库存不足'
    );
  END IF;

  -- 检查光币余额
  IF v_balance < v_gift.price THEN
    RETURN json_build_object(
      'success', false,
      'message', '光币余额不足'
    );
  END IF;

  -- 生成兑换码
  v_redemption_code := 'GIFT-' || UPPER(md5(random()::text || clock_timestamp()::text));

  -- 扣除光币
  UPDATE public.profiles
  SET coins = coins - v_gift.price
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
    'price', v_gift.price,
    'message', '兑换成功'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 创建 get_auth_code_status 函数 - 检查认证码状态
CREATE OR REPLACE FUNCTION public.get_auth_code_status(p_code TEXT)
RETURNS JSON AS $$
DECLARE
  v_status TEXT;
  v_is_used BOOLEAN;
BEGIN
  SELECT
    CASE
      WHEN NOT EXISTS (SELECT 1 FROM public.auth_codes WHERE code = p_code) THEN 'not_found'
      WHEN is_used THEN 'used'
      ELSE 'available'
    END AS status,
    COALESCE(is_used, FALSE) AS is_used
  INTO v_status, v_is_used
  FROM public.auth_codes
  WHERE code = p_code;

  RETURN json_build_object(
    'status', COALESCE(v_status, 'not_found'),
    'is_used', COALESCE(v_is_used, FALSE)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 创建 get_available_auth_codes_count 函数 - 获取可用认证码数量
CREATE OR REPLACE FUNCTION public.get_available_auth_codes_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.auth_codes
    WHERE is_used = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 创建 validate_and_use_auth_code 函数 - 验证并使用认证码
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

-- 7. 创建 handle_new_user 函数 - 用户注册触发器
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

-- 8. 重新创建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

SELECT '所有 RPC 函数和触发器创建完成！' as status;

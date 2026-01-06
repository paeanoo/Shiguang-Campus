# 拾光志 - 光币系统使用指南

## 概述

光币系统是拾光志平台的核心功能之一，用户可以通过完成各种任务赚取光币，然后用光币兑换各种礼品。同时系统还记录用户的碳排放减少量，并在排行榜中体现。

## 功能特性

### 1. 签到功能
- 每日签到可获得10光币和0.1kg碳减排值
- 连续签到7天可获得额外50光币和0.5kg碳减排值奖励
- 断签后重新开始计算连续天数

### 2. 任务系统
- **发布闲置物品**：上传一件二手物品，奖励50光币 + 0.5kg碳减排
- **完成一笔交易**：成功买卖一件物品，奖励100光币 + 1.0kg碳减排
- **分享给好友**：邀请好友加入拾光志，奖励30光币 + 0.3kg碳减排
- **完善个人资料**：上传头像并设置用户名，奖励20光币 + 0.2kg碳减排
- **参与校园活动**：报名并参加一次校园活动，奖励40光币 + 0.4kg碳减排

### 3. 兑换系统
- 支持10种不同的礼品兑换
- 包含真实的商品图片
- 兑换成功后生成唯一兑换码
- 提供打印小票功能用于线下兑换

### 4. 排行榜系统
- 实时显示碳减排排行榜
- 前三名有特殊标识
- 展示用户头像、用户名和碳减排量

## 数据库表结构

### tasks - 任务表
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reward_coins INTEGER DEFAULT 0,
  reward_carbon DECIMAL(5,2) DEFAULT 0.0,
  task_type VARCHAR(50) NOT NULL,
  requirements JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### user_tasks - 用户任务完成记录表
```sql
CREATE TABLE user_tasks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  task_id UUID REFERENCES tasks(id),
  status VARCHAR(20) DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### check_ins - 签到记录表
```sql
CREATE TABLE check_ins (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  check_in_date DATE NOT NULL,
  reward_coins INTEGER NOT NULL,
  reward_carbon DECIMAL(5,2) NOT NULL,
  streak_day INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE
);
```

### gifts - 礼品表
```sql
CREATE TABLE gifts (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  price INTEGER NOT NULL,
  stock INTEGER DEFAULT -1,
  is_available BOOLEAN DEFAULT true,
  category VARCHAR(50),
  redemption_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### gift_redemptions - 礼品兑换记录表
```sql
CREATE TABLE gift_redemptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  gift_id UUID REFERENCES gifts(id),
  redemption_code VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
);
```

### coin_transactions - 光币交易记录表
```sql
CREATE TABLE coin_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  description TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE
);
```

## 核心函数

### 签到函数
```sql
perform_check_in(user_uuid UUID) RETURNS JSON
```
- 检查用户是否可以签到
- 计算连续签到天数
- 更新用户光币和碳减排值
- 记录签到历史

### 任务完成函数
```sql
complete_task(user_uuid UUID, task_uuid UUID) RETURNS JSON
```
- 验证任务完成条件
- 更新用户任务状态
- 发放奖励

### 礼品兑换函数
```sql
redeem_gift(user_uuid UUID, gift_uuid UUID) RETURNS JSON
```
- 验证用户光币余额
- 检查礼品库存
- 生成唯一兑换码
- 扣除光币并记录兑换

## 前端组件

### React版本
- `components/coins-page.tsx` - 完整的光币中心页面

### Vue版本
- `src/components/CoinsPage.vue` - 完整的光币中心页面

### 主要功能
1. **实时数据显示**：光币余额、碳减排量、连续签到天数
2. **任务管理**：显示任务进度，点击"去完成"跳转到对应页面
3. **礼品兑换**：显示礼品列表，支持一键兑换
4. **兑换记录**：查看历史兑换记录和状态
5. **排行榜**：实时碳减排排行榜

## 部署步骤

1. **执行数据库迁移**
   ```bash
   # 在Supabase SQL Editor中执行
   # supabase-schema.sql 中的所有SQL语句
   ```

2. **更新环境变量**
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **启动应用**
   ```bash
   npm install
   npm run dev
   ```

## 测试数据

系统已预置以下测试数据：

### 默认任务
- 每日签到
- 发布闲置物品
- 完成一笔交易
- 分享给好友
- 完善个人资料
- 参与校园活动

### 默认礼品
- 校园咖啡券 (200光币)
- 精美笔记本 (300光币)
- 多肉植物盆栽 (250光币)
- 校园文具套装 (150光币)
- 环保购物袋 (80光币)
- 定制校园杯子 (400光币)
- 校园书签套装 (120光币)
- 环保水杯 (350光币)
- 校园明信片 (60光币)
- 环保帆布袋 (100光币)

## 注意事项

1. **数据库权限**：确保正确设置RLS策略
2. **图片存储**：礼品图片存储在Supabase Storage中
3. **兑换流程**：兑换码用于线下验证，需人工确认
4. **排行榜更新**：实时更新，无需手动刷新
5. **任务进度**：系统自动跟踪任务完成进度

## 扩展功能

未来可以扩展的功能：
- 更多任务类型
- 礼品分类筛选
- 兑换码二维码生成
- 积分商城
- 团队挑战赛
- 月度排行榜奖励



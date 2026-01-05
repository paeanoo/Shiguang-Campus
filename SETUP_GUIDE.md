# 拾光志 Supabase 数据库设置指南

## 概述

本指南将帮助你在 Supabase 中设置拾光志应用所需的数据库表、存储桶和安全策略。

## 执行步骤

请按照以下顺序在 Supabase SQL Editor 中执行每个步骤：

### 步骤 1: 创建数据表
文件: `step-1-create-tables.sql`
- 创建 9 个数据表：profiles, events, event_registrations, products, buddy_requests, buddy_members, coin_transactions, gifts, gift_redemptions

### 步骤 2: 创建索引
文件: `step-2-create-indexes.sql`
- 为常用查询字段创建索引以提高性能

### 步骤 3: 启用行级安全性 (RLS)
文件: `step-3-enable-rls.sql`
- 为所有表启用 RLS 以保护数据安全

### 步骤 4: 创建 RLS 策略
文件: `step-4-create-policies.sql`
- 定义谁可以访问、插入、更新和删除数据

### 步骤 5: 创建触发器和函数
文件: `step-5-create-triggers.sql`
- 自动创建用户 profile
- 自动更新活动参与人数
- 自动更新搭子已填人数

### 步骤 6: 创建存储桶
文件: `step-6-create-buckets.sql`
- 创建 4 个存储桶：avatars, products, events, images

### 步骤 7: 启用存储 RLS
文件: `step-7-enable-storage-rls.sql`
- 为存储对象启用 RLS

### 步骤 8: 创建存储 RLS 策略
文件: `step-8-create-storage-policies.sql`
- 定义谁可以上传、查看、更新和删除文件

### 步骤 9: 插入初始数据
文件: `step-9-insert-data.sql`
- 插入示例礼品数据

## 如何执行

### 方法 1: 通过 Supabase Dashboard

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **New Query**
5. 复制对应步骤的 SQL 文件内容
6. 粘贴到 SQL 编辑器中
7. 点击 **Run** 按钮执行
8. 等待显示 "Step X: ... successfully!" 消息
9. 重复步骤 1-9

### 方法 2: 使用 Supabase CLI

如果你安装了 Supabase CLI，可以运行：

```bash
# 执行所有步骤
supabase db execute --file step-1-create-tables.sql
supabase db execute --file step-2-create-indexes.sql
supabase db execute --file step-3-enable-rls.sql
supabase db execute --file step-4-create-policies.sql
supabase db execute --file step-5-create-triggers.sql
supabase db execute --file step-6-create-buckets.sql
supabase db execute --file step-7-enable-storage-rls.sql
supabase db execute --file step-8-create-storage-policies.sql
supabase db execute --file step-9-insert-data.sql
```

## 故障排除

### 错误: "relation does not exist"
- 确保按照顺序执行步骤
- 先执行 step-1 创建表，再执行后续步骤

### 错误: "permission denied"
- 确保你以项目所有者身份登录 Supabase Dashboard
- 检查你的账户是否有足够的权限

### 错误: "policy already exists"
- 这是正常的，表示策略已经存在
- 可以忽略此错误或使用 `DROP POLICY` 先删除

### 错误: "trigger already exists"
- 这是正常的，表示触发器已经存在
- SQL 中的 `DROP TRIGGER IF EXISTS` 会处理这种情况

## 验证安装

执行完所有步骤后，你可以通过以下方式验证：

1. 在 **Table Editor** 中查看是否创建了所有表
2. 在 **Storage** 中查看是否创建了所有存储桶
3. 尝试注册一个新用户，检查是否自动创建了 profile
4. 尝试创建一个活动，检查是否可以正常保存

## 数据表说明

### profiles
用户资料表，存储用户的基本信息和光币余额

### events
活动表，存储所有校园活动信息

### event_registrations
活动报名表，记录用户报名的活动

### products
商品表，存储二手商品信息

### buddy_requests
搭子需求表，存储用户发布的搭子需求

### buddy_members
搭子成员表，记录加入搭子的用户

### coin_transactions
光币交易表，记录光币的收支

### gifts
礼品表，存储可兑换的礼品

### gift_redemptions
礼品兑换表，记录用户的兑换记录

## 存储桶说明

### avatars
用户头像存储，最大文件大小 10MB

### products
商品图片存储，最大文件大小 10MB

### events
活动图片存储，最大文件大小 10MB

### images
通用图片存储，最大文件大小 10MB

## 完成

执行完所有步骤后，你的 Supabase 数据库就完全配置好了！
现在可以运行应用并测试所有功能。

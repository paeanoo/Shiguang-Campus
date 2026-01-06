import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSupabaseTablesDetailed() {
  console.log('详细检查 Supabase 表和函数')
  console.log('='.repeat(80))

  const requiredTables = [
    { name: 'profiles', description: '用户资料表（光币余额、减碳量、签到信息）' },
    { name: 'tasks', description: '任务表（任务列表、奖励）' },
    { name: 'user_tasks', description: '用户任务表（任务进度、状态）' },
    { name: 'gifts', description: '礼品表（礼品列表、库存）' },
    { name: 'gift_redemptions', description: '礼品兑换记录表（兑换历史）' },
    { name: 'coin_transactions', description: '光币交易记录表（交易历史）' },
    { name: 'auth_codes', description: '认证码表（活动负责人认证）' }
  ]

  const requiredFunctions = [
    { name: 'perform_check_in', description: '签到功能' },
    { name: 'complete_task', description: '完成任务' },
    { name: 'redeem_gift', description: '兑换礼品' },
    { name: 'get_auth_code_status', description: '检查认证码状态' },
    { name: 'get_available_auth_codes_count', description: '获取可用认证码数量' },
    { name: 'validate_and_use_auth_code', description: '验证并使用认证码' }
  ]

  console.log('\n1. 检查表是否存在:')
  console.log('-'.repeat(80))

  const tableStatus = {}

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(1)

      if (error) {
        tableStatus[table.name] = false
        console.log(`✗ ${table.name.padEnd(25)} - ${table.description}`)
        console.log(`  错误: ${error.message}`)
      } else {
        tableStatus[table.name] = true
        const count = data?.length || 0
        console.log(`✓ ${table.name.padEnd(25)} - ${table.description}`)
        console.log(`  记录数: ${count}`)
      }
    } catch (err) {
      tableStatus[table.name] = false
      console.log(`✗ ${table.name.padEnd(25)} - ${table.description}`)
      console.log(`  错误: ${err.message}`)
    }
  }

  console.log('\n2. 检查 RPC 函数是否存在:')
  console.log('-'.repeat(80))

  const functionStatus = {}

  for (const func of requiredFunctions) {
    try {
      const { data, error } = await supabase.rpc(func.name)

      if (error) {
        if (error.message.includes('function') && error.message.includes('does not exist')) {
          functionStatus[func.name] = false
          console.log(`✗ ${func.name.padEnd(35)} - ${func.description}`)
          console.log(`  错误: 函数不存在`)
        } else {
          functionStatus[func.name] = true
          console.log(`✓ ${func.name.padEnd(35)} - ${func.description}`)
          console.log(`  注意: 函数存在但执行可能需要参数`)
        }
      } else {
        functionStatus[func.name] = true
        console.log(`✓ ${func.name.padEnd(35)} - ${func.description}`)
      }
    } catch (err) {
      functionStatus[func.name] = false
      console.log(`✗ ${func.name.padEnd(35)} - ${func.description}`)
      console.log(`  错误: ${err.message}`)
    }
  }

  if (tableStatus['profiles']) {
    console.log('\n3. 检查 profiles 表字段:')
    console.log('-'.repeat(80))

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

      if (error) {
        console.log('✗ 无法查询 profiles 表')
      } else if (profile && profile.length > 0) {
        const fields = Object.keys(profile[0])
        const requiredFields = [
          { name: 'id', description: '用户ID' },
          { name: 'email', description: '邮箱' },
          { name: 'username', description: '用户名' },
          { name: 'user_type', description: '用户类型' },
          { name: 'avatar_url', description: '头像URL' },
          { name: 'coins', description: '光币余额' },
          { name: 'carbon_reduced', description: '累计减碳量' },
          { name: 'last_check_in_date', description: '最后签到日期' },
          { name: 'check_in_streak', description: '连续签到天数' }
        ]

        console.log('现有字段:')
        fields.forEach(field => {
          console.log(`  - ${field}`)
        })

        console.log('\n必需字段检查:')
        requiredFields.forEach(field => {
          const exists = fields.includes(field.name)
          console.log(`  ${exists ? '✓' : '✗'} ${field.name.padEnd(25)} - ${field.description}`)
        })
      }
    } catch (err) {
      console.log('✗ 检查 profiles 表字段时出错:', err.message)
    }
  }

  if (tableStatus['gifts']) {
    console.log('\n4. 检查 gifts 表字段:')
    console.log('-'.repeat(80))

    try {
      const { data: gift, error } = await supabase
        .from('gifts')
        .select('*')
        .limit(1)

      if (error) {
        console.log('✗ 无法查询 gifts 表')
      } else if (gift && gift.length > 0) {
        const fields = Object.keys(gift[0])
        const requiredFields = [
          { name: 'id', description: '礼品ID' },
          { name: 'title', description: '礼品标题' },
          { name: 'description', description: '礼品描述' },
          { name: 'image_url', description: '图片URL' },
          { name: 'price', description: '价格（光币）' },
          { name: 'stock', description: '库存' },
          { name: 'is_available', description: '是否可用' },
          { name: 'redemption_instructions', description: '兑换说明' }
        ]

        console.log('现有字段:')
        fields.forEach(field => {
          console.log(`  - ${field}`)
        })

        console.log('\n必需字段检查:')
        requiredFields.forEach(field => {
          const exists = fields.includes(field.name)
          console.log(`  ${exists ? '✓' : '✗'} ${field.name.padEnd(25)} - ${field.description}`)
        })
      }
    } catch (err) {
      console.log('✗ 检查 gifts 表字段时出错:', err.message)
    }
  }

  if (tableStatus['tasks']) {
    console.log('\n5. 检查 tasks 表字段:')
    console.log('-'.repeat(80))

    try {
      const { data: task, error } = await supabase
        .from('tasks')
        .select('*')
        .limit(1)

      if (error) {
        console.log('✗ 无法查询 tasks 表')
      } else if (task && task.length > 0) {
        const fields = Object.keys(task[0])
        const requiredFields = [
          { name: 'id', description: '任务ID' },
          { name: 'title', description: '任务标题' },
          { name: 'description', description: '任务描述' },
          { name: 'reward_coins', description: '光币奖励' },
          { name: 'reward_carbon', description: '碳减排奖励' },
          { name: 'task_type', description: '任务类型' },
          { name: 'is_active', description: '是否激活' },
          { name: 'requirements', description: '任务要求' }
        ]

        console.log('现有字段:')
        fields.forEach(field => {
          console.log(`  - ${field}`)
        })

        console.log('\n必需字段检查:')
        requiredFields.forEach(field => {
          const exists = fields.includes(field.name)
          console.log(`  ${exists ? '✓' : '✗'} ${field.name.padEnd(25)} - ${field.description}`)
        })
      }
    } catch (err) {
      console.log('✗ 检查 tasks 表字段时出错:', err.message)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('检查完成！')
  console.log('\n总结:')

  const missingTables = requiredTables.filter(t => !tableStatus[t.name])
  const missingFunctions = requiredFunctions.filter(f => !functionStatus[f.name])

  if (missingTables.length > 0) {
    console.log(`\n缺少的表 (${missingTables.length}):`)
    missingTables.forEach(t => {
      console.log(`  - ${t.name}: ${t.description}`)
    })
  }

  if (missingFunctions.length > 0) {
    console.log(`\n缺少的函数 (${missingFunctions.length}):`)
    missingFunctions.forEach(f => {
      console.log(`  - ${f.name}: ${f.description}`)
    })
  }

  if (missingTables.length === 0 && missingFunctions.length === 0) {
    console.log('\n✓ 所有必需的表和函数都已存在！')
  }
}

checkSupabaseTablesDetailed().catch(console.error)

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkSupabaseWithAnonKey() {
  console.log('使用 Anon Key 检查 Supabase 表和函数')
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

  console.log('\n1. 检查表是否存在（使用 Anon Key）:')
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
        console.log(`  可能原因: RLS 策略限制或表不存在`)
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

  console.log('\n2. 检查 RPC 函数是否存在（使用 Anon Key）:')
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

  console.log('\n提示:')
  console.log('- 如果表显示 ✗，可能是因为 RLS 策略限制')
  console.log('- 要查看完整的表结构，请在 Supabase 控制台的 SQL Editor 中执行查询')
  console.log('- 要创建缺失的表或函数，请使用 Service Role Key')
}

checkSupabaseWithAnonKey().catch(console.error)

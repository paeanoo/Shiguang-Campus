import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testCompleteTaskFunction() {
  console.log('测试 complete_task 函数')
  console.log('='.repeat(80))

  // 1. 尝试使用不同的参数名称调用函数
  console.log('\n1. 测试不同的参数名称:')

  const testCases = [
    { params: { user_uuid: 'test', task_uuid: 'test' }, desc: 'user_uuid, task_uuid' },
    { params: { user_id: 'test', task_id: 'test' }, desc: 'user_id, task_id' },
    { params: { userId: 'test', taskId: 'test' }, desc: 'userId, taskId' },
    { params: { user_uuid: 'test', task_id: 'test' }, desc: 'user_uuid, task_id' },
    { params: { user_id: 'test', task_uuid: 'test' }, desc: 'user_id, task_uuid' },
    { params: { p_user_id: 'test', p_task_id: 'test' }, desc: 'p_user_id, p_task_id' },
    { params: { p_user_uuid: 'test', p_task_uuid: 'test' }, desc: 'p_user_uuid, p_task_uuid' }
  ]

  for (const testCase of testCases) {
    console.log(`\n测试参数: ${testCase.desc}`)
    try {
      const { data, error } = await supabase.rpc('complete_task', testCase.params)

      if (error) {
        if (error.message.includes('Could not find function')) {
          console.log(`  ✗ 函数不存在或参数名称错误`)
          console.log(`  错误: ${error.message}`)
        } else if (error.message.includes('argument') || error.message.includes('parameter')) {
          console.log(`  ✗ 参数名称错误`)
          console.log(`  错误: ${error.message}`)
        } else {
          console.log(`  ✓ 函数存在，但执行失败（预期行为）`)
          console.log(`  错误: ${error.message}`)
        }
      } else {
        console.log(`  ✓ 函数存在且参数正确！`)
        console.log(`  返回数据:`, data)
        break
      }
    } catch (err) {
      console.log(`  ✗ 执行出错: ${err.message}`)
    }
  }

  // 2. 检查所有可用的 RPC 函数
  console.log('\n2. 查询所有可用的 RPC 函数:')

  try {
    const { data, error } = await supabase
      .rpc('get_available_auth_codes_count')

    if (error) {
      console.log('  ✗ 无法查询函数列表')
    } else {
      console.log(`  ✓ RPC 函数可以正常调用`)
    }
  } catch (err) {
    console.log(`  ✗ 查询出错: ${err.message}`)
  }

  console.log('\n' + '='.repeat(80))
  console.log('测试完成！')
  console.log('\n解决方案:')
  console.log('- 如果所有参数名称都失败，说明函数不存在或参数名称不匹配')
  console.log('- 需要在 Supabase SQL Editor 中检查函数定义')
  console.log('- 可能需要创建或修改 complete_task 函数')
}

testCompleteTaskFunction().catch(console.error)

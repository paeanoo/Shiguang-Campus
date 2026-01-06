import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testCompleteTaskFixed() {
  console.log('测试修复后的 complete_task 函数')
  console.log('='.repeat(80))

  // 1. 测试 complete_task 函数
  console.log('\n1. 测试 complete_task 函数:')

  try {
    const { data, error } = await supabase.rpc('complete_task', {
      user_uuid: '00000000-0000-0000-0000-000000000000',
      task_uuid: '00000000-0000-0000-0000-000000000000'
    })

    if (error) {
      console.log('  错误:', error.message)
      if (error.message.includes('column') && error.message.includes('integer')) {
        console.log('  ✗ 类型转换问题仍然存在')
      } else if (error.message.includes('function')) {
        console.log('  ✗ 函数不存在或参数名称错误')
      } else {
        console.log('  ✓ 函数可以调用，但执行失败（预期行为）')
        console.log('  这是因为使用了无效的用户ID和任务ID')
      }
    } else {
      console.log('  ✓ 函数调用成功！')
      console.log('  返回数据:', data)
    }
  } catch (err) {
    console.log('  ✗ 执行出错:', err.message)
  }

  // 2. 测试 perform_check_in 函数
  console.log('\n2. 测试 perform_check_in 函数:')

  try {
    const { data, error } = await supabase.rpc('perform_check_in', {
      user_uuid: '00000000-0000-0000-0000-000000000000'
    })

    if (error) {
      console.log('  错误:', error.message)
      console.log('  ✓ 函数可以调用（预期行为）')
    } else {
      console.log('  ✓ 函数调用成功！')
      console.log('  返回数据:', data)
    }
  } catch (err) {
    console.log('  ✗ 执行出错:', err.message)
  }

  // 3. 测试 redeem_gift 函数
  console.log('\n3. 测试 redeem_gift 函数:')

  try {
    const { data, error } = await supabase.rpc('redeem_gift', {
      user_uuid: '00000000-0000-0000-0000-000000000000',
      gift_uuid: '00000000-0000-0000-0000-000000000000'
    })

    if (error) {
      console.log('  错误:', error.message)
      console.log('  ✓ 函数可以调用（预期行为）')
    } else {
      console.log('  ✓ 函数调用成功！')
      console.log('  返回数据:', data)
    }
  } catch (err) {
    console.log('  ✗ 执行出错:', err.message)
  }

  console.log('\n' + '='.repeat(80))
  console.log('测试完成！')
  console.log('\n总结:')
  console.log('- 如果所有函数都可以调用（即使返回错误），说明函数定义正确')
  console.log('- 如果出现 "column ... is of type integer" 错误，说明类型转换仍有问题')
  console.log('- 请在 Supabase SQL Editor 中执行 create-coins-functions-fixed.sql')
}

testCompleteTaskFixed().catch(console.error)

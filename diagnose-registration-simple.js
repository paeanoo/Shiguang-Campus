import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少环境变量：VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnoseRegistration() {
  console.log('🔍 详细诊断用户注册问题...\n')

  try {
    // 1. 尝试直接插入 profiles 表（模拟触发器行为）
    console.log('1️⃣ 测试直接插入 profiles 表...')
    const testId = '00000000-0000-0000-0000-000000000001'
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: testId,
        email: 'test@example.com',
        username: 'testuser',
        user_type: 'user',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
        coins: 0,
        carbon_reduced: 0
      })
      .select()
      .single()

    if (insertError) {
      console.log('❌ 直接插入 profiles 表失败:', insertError.message)
      console.log('   错误详情:', JSON.stringify(insertError, null, 2))
    } else {
      console.log('✅ 直接插入 profiles 表成功')

      // 清理测试数据
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testId)
      console.log('   测试数据已清理')
    }

    // 2. 测试注册（带详细日志）
    console.log('\n2️⃣ 测试用户注册...')
    const testEmail = `test_${Date.now()}@example.com`
    const testPassword = 'Test123456'

    console.log(`   尝试注册: ${testEmail}`)

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          user_type: 'user',
          username: 'testuser',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + testEmail
        }
      }
    })

    if (signUpError) {
      console.log('❌ 注册失败:', signUpError.message)
      console.log('   错误代码:', signUpError.status)
      console.log('   错误详情:', JSON.stringify(signUpError, null, 2))
    } else {
      console.log('✅ 注册成功')
      console.log(`   用户ID: ${signUpData.user?.id}`)
      console.log(`   用户邮箱: ${signUpData.user?.email}`)
      console.log(`   用户元数据:`, signUpData.user?.user_metadata)

      // 检查 profiles 表中是否有对应记录
      if (signUpData.user?.id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signUpData.user.id)
          .single()

        if (profileError) {
          console.log('⚠️  无法获取用户资料:', profileError.message)
        } else {
          console.log('✅ 用户资料已创建')
          console.log('   资料详情:', profileData)
        }

        // 清理测试用户
        await supabase.auth.admin.deleteUser(signUpData.user.id)
        console.log('   测试用户已清理')
      }
    }

  } catch (error) {
    console.error('❌ 诊断过程中发生错误:', error)
  }
}

diagnoseRegistration()

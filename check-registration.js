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

async function checkRegistration() {
  console.log('🔍 检查注册相关表和函数...\n')

  try {
    // 1. 检查 auth_codes 表是否存在
    console.log('1️⃣ 检查 auth_codes 表...')
    const { data: authCodesData, error: authCodesError } = await supabase
      .from('auth_codes')
      .select('*')
      .limit(1)

    if (authCodesError) {
      console.log('❌ auth_codes 表不存在或无法访问:', authCodesError.message)
    } else {
      console.log('✅ auth_codes 表存在')
      const { count } = await supabase
        .from('auth_codes')
        .select('*', { count: 'exact', head: true })
      console.log(`   认证码数量: ${count}`)
    }

    // 2. 检查 profiles 表是否存在
    console.log('\n2️⃣ 检查 profiles 表...')
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profilesError) {
      console.log('❌ profiles 表不存在或无法访问:', profilesError.message)
    } else {
      console.log('✅ profiles 表存在')
    }

    // 3. 检查 validate_and_use_auth_code 函数
    console.log('\n3️⃣ 检查 validate_and_use_auth_code 函数...')
    const { data: funcData, error: funcError } = await supabase
      .rpc('validate_and_use_auth_code', { p_code: 'TEST', p_user_id: '00000000-0000-0000-0000-000000000000' })

    if (funcError) {
      console.log('❌ 函数调用失败:', funcError.message)
      if (funcError.message.includes('function')) {
        console.log('   可能函数不存在')
      }
    } else {
      console.log('✅ 函数存在（测试调用成功）')
    }

    // 4. 检查 get_available_auth_codes_count 函数
    console.log('\n4️⃣ 检查 get_available_auth_codes_count 函数...')
    const { data: countData, error: countError } = await supabase
      .rpc('get_available_auth_codes_count')

    if (countError) {
      console.log('❌ 函数调用失败:', countError.message)
    } else {
      console.log('✅ 函数存在')
      console.log(`   可用认证码数量: ${countData}`)
    }

    // 5. 测试普通用户注册（模拟）
    console.log('\n5️⃣ 测试普通用户注册...')
    const testEmail = `test_${Date.now()}@example.com`
    const testPassword = 'Test123456'

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
      console.log('   错误详情:', JSON.stringify(signUpError, null, 2))
    } else {
      console.log('✅ 注册成功')
      console.log(`   用户ID: ${signUpData.user?.id}`)

      // 清理测试用户
      if (signUpData.user?.id) {
        await supabase.auth.admin.deleteUser(signUpData.user.id)
        console.log('   测试用户已清理')
      }
    }

  } catch (error) {
    console.error('❌ 检查过程中发生错误:', error)
  }
}

checkRegistration()

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
    // 1. 检查 profiles 表的 RLS 策略
    console.log('1️⃣ 检查 profiles 表的 RLS 策略...')
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('get_policies_for_table', { p_table_name: 'profiles' })
      .catch(() => ({ data: null, error: { message: '函数不存在' } }))

    if (rlsError) {
      console.log('⚠️  无法获取 RLS 策略信息:', rlsError.message)
    } else {
      console.log('✅ RLS 策略信息已获取')
    }

    // 2. 检查 profiles 表的列
    console.log('\n2️⃣ 检查 profiles 表的列...')
    const { data: columnsData, error: columnsError } = await supabase
      .rpc('get_table_columns', { p_table_name: 'profiles' })
      .catch(() => ({ data: null, error: { message: '函数不存在' } }))

    if (columnsError) {
      console.log('⚠️  无法获取列信息:', columnsError.message)
    } else {
      console.log('✅ 列信息已获取')
    }

    // 3. 检查触发器是否存在
    console.log('\n3️⃣ 检查触发器...')
    const { data: triggerData, error: triggerError } = await supabase
      .rpc('check_trigger_exists', { p_trigger_name: 'on_auth_user_created' })
      .catch(() => ({ data: null, error: { message: '函数不存在' } }))

    if (triggerError) {
      console.log('⚠️  无法检查触发器:', triggerError.message)
    } else {
      console.log('✅ 触发器检查完成')
    }

    // 4. 尝试直接插入 profiles 表（模拟触发器行为）
    console.log('\n4️⃣ 测试直接插入 profiles 表...')
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

    // 5. 检查 handle_new_user 函数
    console.log('\n5️⃣ 检查 handle_new_user 函数...')
    const { data: funcData, error: funcError } = await supabase
      .rpc('check_function_exists', { p_function_name: 'handle_new_user' })
      .catch(() => ({ data: null, error: { message: '函数不存在' } }))

    if (funcError) {
      console.log('⚠️  无法检查函数:', funcError.message)
    } else {
      console.log('✅ 函数检查完成')
    }

    // 6. 测试注册（带详细日志）
    console.log('\n6️⃣ 测试用户注册...')
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

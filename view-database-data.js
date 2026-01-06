import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 环境变量未设置: VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

  async function viewTableData() {
    console.log('🔍 查看数据库表数据...\n');

    try {
      // 1. 查看 profiles 表数据
      console.log('📋 profiles 表数据:');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, coins, carbon_reduced, last_check_in_date, check_in_streak, created_at')
        .limit(10);

      if (profilesError) console.log('❌ profiles 查询错误:', profilesError.message);
      else {
        console.table(profiles);
        console.log(`总记录数: ${profiles.length}\n`);
      }

      // 2. 查看 tasks 表数据
      console.log('📋 tasks 表数据:');
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*');

      if (tasksError) console.log('❌ tasks 查询错误:', tasksError.message);
      else {
        console.table(tasks);
        console.log(`总记录数: ${tasks.length}\n`);
      }

      // 3. 查看 gifts 表数据
      console.log('📋 gifts 表数据:');
      const { data: gifts, error: giftsError } = await supabase
        .from('gifts')
        .select('id, title, description, price, stock, is_available, category')
        .limit(10);

      if (giftsError) console.log('❌ gifts 查询错误:', giftsError.message);
      else {
        console.table(gifts);
        console.log(`总记录数: ${gifts.length}\n`);
      }

      // 4. 查看 user_tasks 表数据
      console.log('📋 user_tasks 表数据:');
      const { data: userTasks, error: userTasksError } = await supabase
        .from('user_tasks')
        .select('*')
        .limit(10);

      if (userTasksError) console.log('❌ user_tasks 查询错误:', userTasksError.message);
      else {
        console.table(userTasks);
        console.log(`总记录数: ${userTasks.length}\n`);
      }

      // 5. 查看 check_ins 表数据
      console.log('📋 check_ins 表数据:');
      const { data: checkIns, error: checkInsError } = await supabase
        .from('check_ins')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (checkInsError) console.log('❌ check_ins 查询错误:', checkInsError.message);
      else {
        console.table(checkIns);
        console.log(`总记录数: ${checkIns.length}\n`);
      }

      // 6. 查看 coin_transactions 表数据
      console.log('📋 coin_transactions 表数据:');
      const { data: transactions, error: transactionsError } = await supabase
        .from('coin_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) console.log('❌ coin_transactions 查询错误:', transactionsError.message);
      else {
        console.table(transactions);
        console.log(`总记录数: ${transactions.length}\n`);
      }

      // 7. 查看 gift_redemptions 表数据
      console.log('📋 gift_redemptions 表数据:');
      const { data: redemptions, error: redemptionsError } = await supabase
        .from('gift_redemptions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (redemptionsError) console.log('❌ gift_redemptions 查询错误:', redemptionsError.message);
      else {
        console.table(redemptions);
        console.log(`总记录数: ${redemptions.length}\n`);
      }

    } catch (error) {
      console.error('❌ 连接或查询错误:', error.message);
    }
  }

  viewTableData();
} catch (error) {
  console.error('❌ 配置文件读取错误:', error.message);
}

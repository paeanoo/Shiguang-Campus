import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyEventsInsertPolicy() {
  console.log('=== 应用 events 表 INSERT 策略 ===\n')

  try {
    // 读取迁移文件
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const migrationPath = join(__dirname, 'migrations', '20260116_fix_events_insert_policy.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    console.log('正在执行 SQL...')
    console.log(migrationSQL)
    console.log('\n---\n')

    // 注意：这里我们无法直接执行 DDL 语句（CREATE POLICY）
    // 需要在 Supabase 的 SQL 编辑器中手动执行
    console.log('⚠️  重要提示：')
    console.log('由于 Supabase 客户端 API 的限制，无法通过代码直接执行 DDL 语句。')
    console.log('\n请按照以下步骤手动应用此迁移：\n')
    console.log('1. 打开 Supabase Dashboard')
    console.log('2. 进入 SQL Editor')
    console.log('3. 复制并粘贴以下 SQL 语句：\n')
    console.log('--- 开始 SQL ---')
    console.log(migrationSQL)
    console.log('--- 结束 SQL ---\n')
    console.log('4. 点击 "Run" 按钮执行\n')
    console.log('执行成功后，活动发布功能就可以正常使用了。')

  } catch (error) {
    console.error('❌ 错误:', error)
  }
}

applyEventsInsertPolicy()

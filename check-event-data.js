import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .limit(3);
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Found', data.length, 'events');
      data.forEach((ev, idx) => {
        console.log(`\n--- Event ${idx + 1} ---`);
        console.log('ID:', ev.id);
        console.log('Title:', ev.title);
        console.log('start_time:', ev.start_time);
        console.log('end_time:', ev.end_time);
        console.log('time:', ev.time);
        console.log('date:', ev.date);
        console.log('click_count:', ev.click_count);
        console.log('All fields:', Object.keys(ev));
      });
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

checkEvents();

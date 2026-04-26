import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://uikhccgnoahhlhottnbp.supabase.co', 'sb_publishable_4k7t3b2LTHbckbKTLA2J8g_rffsX4FY');
async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'raj+1777231202868@nearnerd.com',
    password: 'Password123!'
  });
  console.log("Login result:", data.session ? "Success" : "Failed", error);
}
test();

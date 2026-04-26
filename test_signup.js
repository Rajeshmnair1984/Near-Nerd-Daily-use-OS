import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://uikhccgnoahhlhottnbp.supabase.co',
  'sb_publishable_4k7t3b2LTHbckbKTLA2J8g_rffsX4FY'
);

async function testSignup() {
  const email = `raj+${Date.now()}@nearnerd.com`;
  
  console.log("Signing up...");
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'Password123!',
  });
  
  if (authError) {
    console.error("Auth error:", authError);
    return;
  }
  
  console.log("Auth success. Session:", !!authData.session);
  
  console.log("Creating org...");
  const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: 'Test Org',
      slug: `test-org-${Date.now()}`,
      description: null,
      is_active: true,
    })
    .select()
    .single();
    
  if (orgError) {
    console.error("Org error:", orgError);
    return;
  }
  
  console.log("Org success.");
  
  console.log("Creating profile...");
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: authData.user.id,
      organization_id: orgData.id,
      email: email,
      full_name: 'Test User',
      role: 'admin',
      is_active: true,
    })
    .select()
    .single();
    
  if (profileError) {
    console.error("Profile error:", profileError);
    return;
  }
  
  console.log("Profile success.");
}

testSignup();

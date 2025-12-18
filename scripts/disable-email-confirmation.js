/**
 * Script to disable email confirmation in Supabase
 * 
 * Note: This requires Supabase Management API access, which typically
 * requires a special access token. For most users, it's easier to do this
 * via the dashboard.
 * 
 * Direct link to settings:
 * https://supabase.com/dashboard/project/frxpbnoornbecjutllfv/auth/providers
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://frxpbnoornbecjutllfv.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function disableEmailConfirmation() {
  console.log('Attempting to disable email confirmation...\n');

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables');
    console.log('\n📝 Manual Steps Required:');
    console.log('1. Go to: https://supabase.com/dashboard/project/frxpbnoornbecjutllfv/auth/providers');
    console.log('2. Click on "Email" provider');
    console.log('3. Find "Confirm Email" toggle and turn it OFF');
    console.log('4. Click "Save"');
    process.exit(1);
  }

  try {
    // Try to use GoTrue Admin API to update auth settings
    // Note: This may not work as email confirmation is a project-level setting
    // that typically requires Management API access
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/auth/v1/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        enable_signup: true,
        enable_email_confirmations: false,
      }),
    });

    if (response.ok) {
      console.log('✅ Email confirmation disabled successfully!');
      return;
    }

    const errorText = await response.text();
    console.log('⚠️  API call failed. This setting may require dashboard access.');
    console.log('Response:', errorText);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n📝 Manual Steps Required:');
  console.log('Email confirmation settings must be changed via the Supabase Dashboard:');
  console.log('\n1. Go to: https://supabase.com/dashboard/project/frxpbnoornbecjutllfv/auth/providers');
  console.log('2. Click on "Email" provider');
  console.log('3. Find "Confirm Email" toggle and turn it OFF');
  console.log('4. Click "Save"');
  console.log('\n💡 Tip: The setting change takes effect immediately.');
}

// Run the script
disableEmailConfirmation()
  .then(() => {
    console.log('\n✅ Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });



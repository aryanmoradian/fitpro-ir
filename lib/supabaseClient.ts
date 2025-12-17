
import { createClient } from '@supabase/supabase-js';

// Access environment variables
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// DETECT MOCK MODE: If env vars are missing or set to placeholder values
export const isMock = !envUrl || !envKey || envUrl === 'mock-url' || envUrl.includes('placeholder');

if (isMock) {
  console.log('⚡ Running in AUTH MOCK MODE (Google AI Studio Compatibility)');
}

// Create client (if real) or a dummy object (if mock) to prevent crashes
export const supabase = isMock 
  ? {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: async ({ email, password }: any) => {
            // Mock Login Logic
            if(email && password) {
                // Determine user role and details based on credentials
                let role = 'athlete';
                let firstName = 'Aryan';
                let lastName = 'Admin';

                if (email === 'admin.test.dev' || email === 'arianmoradianofficial@gmail.com' || email.includes('admin') || email === 'aryan@gmail.com') {
                    role = 'admin';
                    firstName = email === 'admin.test.dev' ? 'Test' : 'Admin';
                    lastName = 'Dev';
                }

                return { 
                  data: { 
                    user: { 
                      id: 'mock-user-id', 
                      email, 
                      user_metadata: { 
                          role, 
                          first_name: firstName, 
                          last_name: lastName 
                      } 
                    } 
                  }, 
                  error: null 
                };
            }
            return { data: { user: null }, error: { message: 'Invalid credentials' } };
        },
        signUp: async ({ email }: any) => {
            // Mock Register Logic
            return { data: { user: null }, error: null }; // Simulate email confirmation required
        },
        signOut: async () => {}
      },
      from: () => ({
        select: () => ({ 
            eq: () => ({ 
                single: () => ({ data: null, error: null }),
                order: () => ({ limit: () => ({ data: [], error: null }) }) 
            }),
            order: () => ({ limit: () => ({ data: [], error: null }) }),
            or: () => ({ order: () => ({ data: [], error: null }) })
        }),
        insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
        update: () => ({ eq: () => ({ data: null, error: null }) }),
        delete: () => ({ eq: () => ({ data: null, error: null }) })
      }),
      storage: {
          from: () => ({
              upload: async () => ({ data: {}, error: null }),
              getPublicUrl: () => ({ data: { publicUrl: 'https://placehold.co/400' } })
          })
      }
    } as any
  : createClient(envUrl!, envKey!);

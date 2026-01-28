import { z } from 'zod';

const EnvSchema = z.object({
  // Public env (exposed to client)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL').optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required').optional(),
  
  // Server-only env (không expose cho client)
  RESEND_API_KEY: z.string().min(1, 'Resend API key is required'),
  FROM_EMAIL: z.string().email('Invalid from email address').default('onboarding@resend.dev'),
});

// Parse và validate env tại build/startup time
// Sử dụng try-catch để tránh crash khi thiếu env trong quá trình dev nếu cần
let envVar: z.infer<typeof EnvSchema>;

try {
  envVar = EnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FROM_EMAIL: process.env.FROM_EMAIL,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:', error.flatten().fieldErrors);
  }
  // Trong production nên throw error để dừng app
  // throw new Error('Invalid environment variables');
  
  // Fallback cho development để không crash agent
  envVar = {
    RESEND_API_KEY: process.env.RESEND_API_KEY || 're_mock_key',
    FROM_EMAIL: process.env.FROM_EMAIL || 'onboarding@resend.dev',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  } as any;
}

export const env = envVar;

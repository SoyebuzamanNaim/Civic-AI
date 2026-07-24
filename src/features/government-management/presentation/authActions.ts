'use server';

import { createServerClientAdapter } from '@/shared/infrastructure/supabase/server';
import { redirect } from 'next/navigation';

export async function loginOfficialAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email')?.toString() || '';
  const password = formData.get('password')?.toString() || '';

  if (!email || !password) {
    return { success: false as const, error: 'Email and password are required.' };
  }

  const supabase = await createServerClientAdapter();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false as const, error: error.message };
  }

  redirect('/government/dashboard');
}

export async function logoutOfficialAction() {
  const supabase = await createServerClientAdapter();
  await supabase.auth.signOut();
  redirect('/government/login');
}

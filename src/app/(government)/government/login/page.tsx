import { LoginForm } from '@/features/government-management/presentation/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Official Portal Login | Infrastructure AI Platform',
  description: 'Secure authentication for government dispatchers, department officers, and administrators.',
};

export default function GovernmentLoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <LoginForm />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-2xl max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-heading font-bold">Welcome Back</h1>
          <p className="text-sm text-muted mt-1">Sign in to your account</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-danger/10 text-danger text-sm p-3 rounded-lg mb-4">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-muted block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-field w-full"
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input-field w-full pr-10"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? (
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-primary hover:underline">Sign Up</Link>
        </p>

        <div className="mt-6 pt-6 border-t border-navy-border">
          <p className="text-xs text-center text-muted mb-3">Demo Accounts</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-muted">
              <span>Customer</span>
              <span className="font-mono">customer@test.com / password123</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Admin</span>
              <span className="font-mono">admin@test.com / password123</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Rider</span>
              <span className="font-mono">rider@test.com / password123</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Bike, BarChart3, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-navy/80 backdrop-blur-lg border-b border-navy-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ShoppingBag size={18} className="text-white" />
            </div>
            <span className="font-heading text-xl font-bold">Jalal Sons</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="btn-ghost text-sm">
              Sign In
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            AI-Powered Smart Delivery Platform
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold leading-tight mb-6">
            Smart Grocery & Restaurant{' '}
            <span className="text-primary">Delivery</span>
          </h1>
          <p className="text-lg md:text-xl text-secondary-text max-w-2xl mx-auto mb-10">
            AI-powered autonomous delivery platform with real-time tracking,
            intelligent substitutions, and predictive inventory management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-primary text-lg px-8 py-4">
              Start Shopping <ArrowRight size={20} className="inline ml-2" />
            </Link>
            <Link href="/auth/login" className="btn-secondary text-lg px-8 py-4">
              I&apos;m a Rider
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-navy-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">
            Powered by Advanced AI
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <ShoppingBag size={32} />,
                title: 'Smart Inventory',
                desc: 'AI predicts demand and prevents stockouts with real-time tracking',
              },
              {
                icon: <Bike size={32} />,
                title: 'Auto Dispatch',
                desc: 'LangChain-powered agent assigns optimal riders automatically',
              },
              {
                icon: <BarChart3 size={32} />,
                title: 'Live Analytics',
                desc: 'Real-time dashboard with ML-powered demand forecasting',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 text-center hover:border-primary/30 transition-all"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                  {f.icon}
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2">{f.title}</h3>
                <p className="text-secondary-text">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-navy-border text-center text-muted text-sm">
        <p>2026 Jalal Sons. All rights reserved.</p>
      </footer>
    </div>
  );
}

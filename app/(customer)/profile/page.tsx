'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, LogOut, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  async function handleSave() {
    try {
      await authApi.updateMe({ full_name: name, phone });
      setEditing(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    }
  }

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="glass-card p-6 rounded-xl text-center">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <User size={36} className="text-primary" />
        </div>
        {editing ? (
          <div className="space-y-3 max-w-sm mx-auto">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="input-field w-full text-center"
            />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="input-field w-full text-center"
            />
            <div className="flex gap-2 justify-center">
              <button onClick={handleSave} className="btn-primary text-sm px-6">Save</button>
              <button onClick={() => setEditing(false)} className="btn-secondary text-sm px-6">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-heading font-bold">{user?.full_name || 'User'}</h2>
            <p className="text-sm text-muted capitalize">{user?.role}</p>
            <button onClick={() => setEditing(true)} className="btn-ghost text-sm mt-2">
              Edit Profile
            </button>
          </>
        )}
      </div>

      {/* Info Cards */}
      <div className="space-y-3">
        {[
          { icon: <Mail size={18} />, label: 'Email', value: user?.email },
          { icon: <Phone size={18} />, label: 'Phone', value: user?.phone || 'Not set' },
          { icon: <MapPin size={18} />, label: 'Address', value: user?.default_address || 'Not set' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-4 rounded-xl flex items-center gap-4"
          >
            <div className="text-primary">{item.icon}</div>
            <div className="flex-1">
              <p className="text-xs text-muted">{item.label}</p>
              <p className="text-sm">{item.value}</p>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </motion.div>
        ))}
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full glass-card p-4 rounded-xl flex items-center justify-center gap-2 text-danger hover:bg-danger/5 transition-colors">
        <LogOut size={18} />
        Sign Out
      </button>
    </div>
  );
}

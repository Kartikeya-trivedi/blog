import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Database, 
  Layout, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Globe,
  Bell
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout';
import { supabase } from '@/src/lib/supabase';

export default function SettingsPage() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    async function checkConnection() {
      try {
        const { error } = await supabase.from('blogs').select('count', { count: 'exact', head: true });
        if (error) throw error;
        setStatus('connected');
      } catch (e) {
        console.error('Supabase connection check failed:', e);
        setStatus('error');
      }
    }
    checkConnection();
  }, []);

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-container-max px-margin-page py-12"
    >
      <AdminLayout>
        <header className="mb-12">
          <h2 className="text-headline-lg">System Settings</h2>
          <p className="text-secondary text-body-md">Configure your editorial infrastructure and environment.</p>
        </header>

        <div className="grid grid-cols-12 gap-12">
          {/* Main Settings Column */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-12">
            
            {/* General Section */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
                <Layout size={20} className="text-tertiary" />
                <h3 className="text-headline-sm uppercase tracking-widest text-[14px]">General Configuration</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-label-caps text-secondary text-[10px]">Site Title</label>
                  <input 
                    type="text" 
                    defaultValue="The Editorial"
                    className="bg-surface-container border-0 px-4 py-3 text-body-md"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-label-caps text-secondary text-[10px]">Editor Name</label>
                  <input 
                    type="text" 
                    defaultValue="Kartikeya Trivedi"
                    className="bg-surface-container border-0 px-4 py-3 text-body-md"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-label-caps text-secondary text-[10px]">Editorial Tagline</label>
                <input 
                  type="text" 
                  defaultValue="Notes on systems, machine learning, and building what matters."
                  className="bg-surface-container border-0 px-4 py-3 text-body-md"
                />
              </div>
            </section>

            {/* Security Section */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
                <Shield size={20} className="text-tertiary" />
                <h3 className="text-headline-sm uppercase tracking-widest text-[14px]">Security & Access</h3>
              </div>
              
              <div className="p-6 bg-surface-container-low border border-outline-variant flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-body-md font-bold">Passcode Authentication</p>
                    <p className="text-secondary text-[12px]">Access to the admin panel is restricted via a master passcode.</p>
                  </div>
                  <span className="text-[10px] font-mono bg-green-100 text-green-800 px-2 py-1 rounded">ACTIVE</span>
                </div>
                <div className="flex flex-col gap-2 opacity-50 pointer-events-none">
                  <label className="text-label-caps text-secondary text-[10px]">Change Master Passcode</label>
                  <input 
                    type="password" 
                    placeholder="••••••••••••"
                    className="bg-surface-container border-0 px-4 py-3 text-body-md"
                  />
                  <p className="text-[10px] italic">Passcode management is currently handled via environment variables.</p>
                </div>
              </div>
            </section>

            {/* Infrastructure Section */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
                <Database size={20} className="text-tertiary" />
                <h3 className="text-headline-sm uppercase tracking-widest text-[14px]">Cloud Infrastructure</h3>
              </div>
              
              <div className="p-6 border border-outline-variant flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-secondary" />
                    <div>
                      <p className="text-body-md font-bold">Supabase Backend</p>
                      <p className="text-secondary text-[11px]">Database, Storage, and Real-time Analytics</p>
                    </div>
                  </div>
                  {status === 'checking' ? (
                    <span className="text-[10px] font-mono animate-pulse">CHECKING...</span>
                  ) : status === 'connected' ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle size={14} />
                      <span className="text-[10px] font-mono">OPERATIONAL</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-error">
                      <AlertCircle size={14} />
                      <span className="text-[10px] font-mono">CONNECTION FAILED</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-secondary font-mono">API STATUS</span>
                    <span className="text-[12px] font-bold">PostgREST v12.0</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-secondary font-mono">STORAGE BUCKET</span>
                    <span className="text-[12px] font-bold">blog-images (Public)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Save Button */}
            <div className="flex justify-end pt-8">
              <button
                onClick={handleSave}
                disabled={saveStatus !== 'idle'}
                className="bg-tertiary text-white px-8 py-4 text-label-caps flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
              >
                {saveStatus === 'saving' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : saveStatus === 'saved' ? (
                  <CheckCircle size={16} />
                ) : (
                  <Save size={16} />
                )}
                {saveStatus === 'saving' ? 'Applying...' : saveStatus === 'saved' ? 'Settings Saved' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container p-8 flex flex-col gap-6">
              <div className="flex items-center gap-3 text-tertiary">
                <Bell size={20} />
                <h4 className="text-label-caps">System Notices</h4>
              </div>
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-white border-l-4 border-tertiary text-[12px] leading-relaxed">
                  <p className="font-bold mb-1">PROD DEPLOYMENT ACTIVE</p>
                  <p className="text-secondary italic">Your blog is currently being served via Vercel Edge. All configuration changes must be backed by environment variables for persistence.</p>
                </div>
                <div className="p-4 bg-white border-l-4 border-outline-variant text-[12px] leading-relaxed">
                  <p className="font-bold mb-1">DATABASE MIGRATION</p>
                  <p className="text-secondary italic">Schema is currently in sync with the editorial service layer. Avoid manual table renames in Supabase.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </motion.div>
  );
}

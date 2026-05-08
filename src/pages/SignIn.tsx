import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';

const PASSCODE = 'editorial2026';

export default function SignInPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a tiny delay for UX
    await new Promise(r => setTimeout(r, 400));

    if (code === PASSCODE) {
      sessionStorage.setItem('editorial_auth', 'true');
      navigate('/admin');
    } else {
      setError('Invalid passcode. Access denied.');
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[80vh] flex items-center justify-center px-margin-page"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="text-headline-lg mb-3">Editorial Access</h1>
          <p className="text-body-md text-secondary">
            Enter the editorial passcode to access the management dashboard.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-secondary" htmlFor="passcode-input">
              Passcode
            </label>
            <input
              id="passcode-input"
              type="password"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(''); }}
              placeholder="Enter editorial passcode"
              autoFocus
              className="w-full px-6 py-4 bg-white border border-outline-variant text-body-md 
                         focus:outline-none focus:border-tertiary transition-colors
                         placeholder:text-secondary/40 font-sans"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-[#c62828] text-[13px] bg-[#fce4ec] px-4 py-3"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading || !code}
            className="w-full bg-tertiary text-white px-6 py-4 text-label-caps 
                       hover:opacity-90 transition-all flex items-center justify-center gap-2
                       disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                Access Dashboard
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </motion.form>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-[12px] text-secondary/50 mt-8"
        >
          This area is restricted to authorized editors only.
        </motion.p>
      </div>
    </motion.div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import CONFIG from '../../config';

const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(CONFIG.api.admin.auth, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'auth', username, password }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('tag_admin_token', data.token);
        onLogin(data.token);
      } else {
        setError(data.message || 'Invalid credentials.');
      }
    } catch {
      setError('Server unreachable. Check your connection.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-6 font-sans">
      <span aria-hidden="true" className="fixed right-[-2rem] top-1/2 -translate-y-1/2 font-heading font-black text-[30vw] text-white/[0.015] select-none leading-none uppercase pointer-events-none">TAG</span>

      <div className="w-full max-w-[400px] relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-5">
            <span className="w-8 h-[3px] bg-[#FF4500]" />
            <p className="text-[#FF4500] font-black text-[11px] tracking-[0.35em] uppercase">The Auction Guy</p>
            <span className="w-8 h-[3px] bg-[#FF4500]" />
          </div>
          <h1 className="text-white font-heading font-black text-[3rem] uppercase tracking-[0.12em] leading-none">Admin</h1>
          <p className="text-[#696969] font-bold text-[12px] tracking-[0.15em] uppercase mt-2">Management Portal</p>
        </div>

        <div className="bg-[#1a1a1a] border-t-[5px] border-[#FF4500] shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
          <div className="p-10">
            <form onSubmit={submit} noValidate>
              <div className="mb-6">
                <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.28em] uppercase mb-3">Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  required autoFocus autoComplete="username" placeholder="admin"
                  className="w-full bg-[#696969]/60 border-[2px] border-[#808080] text-white font-bold text-[15px] px-5 py-4 placeholder-[#696969] focus:outline-none focus:border-[#FF4500] focus:bg-[#696969]/80 transition-all duration-200" />
              </div>

              <div className="mb-8">
                <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.28em] uppercase mb-3">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    required autoComplete="current-password" placeholder="••••••••"
                    className="w-full bg-[#696969]/60 border-[2px] border-[#808080] text-white font-bold text-[15px] px-5 py-4 pr-14 placeholder-[#696969] focus:outline-none focus:border-[#FF4500] focus:bg-[#696969]/80 transition-all duration-200" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#696969] hover:text-[#FF4500] transition-colors font-bold text-[12px] uppercase tracking-widest">
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-6 px-5 py-3 bg-red-900/30 border-l-[4px] border-red-500">
                  <p className="text-red-400 font-bold text-[13px]">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading || !username || !password}
                className="w-full bg-[#FF4500] text-white font-black text-[13px] uppercase tracking-[0.25em] py-4 hover:bg-[#E63F00] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing In...
                  </span>
                ) : 'Sign In'}
              </button>

              <div className="text-center mt-5">
                <Link to="/admin/forgot-password" className="text-[#696969] hover:text-[#FF4500] font-bold text-[12px] uppercase tracking-[0.15em] transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </form>
          </div>

          <div className="bg-[#111111] px-10 py-4 border-t border-[#696969]/20">
            <p className="text-[#696969] font-bold text-[11px] text-center">
              TAG · Johannesburg, South Africa · <a href="/" className="hover:text-[#FF4500] transition-colors">Return to Site</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
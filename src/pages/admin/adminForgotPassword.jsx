import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CONFIG from '../../config';

const STEP = { USERNAME: 0, METHOD: 1, OTP: 2, SECURITY: 3, RESET: 4, DONE: 5 };

const rules = [
  { label: 'At least 8 characters',      test: p => p.length >= 8            },
  { label: 'One uppercase letter (A–Z)',  test: p => /[A-Z]/.test(p)         },
  { label: 'One lowercase letter (a–z)',  test: p => /[a-z]/.test(p)         },
  { label: 'One number (0–9)',            test: p => /[0-9]/.test(p)         },
  { label: 'One special character',       test: p => /[\W_]/.test(p)         },
];

const StrengthBar = ({ password }) => {
  const passed = rules.filter(r => r.test(password)).length;
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];
  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-1">
        {rules.map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 transition-all duration-300 ${i < passed ? colors[passed - 1] : 'bg-[#696969]/30'}`} />
        ))}
      </div>
      <div className="space-y-1.5">
        {rules.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`text-[11px] font-black ${r.test(password) ? 'text-green-400' : 'text-[#696969]'}`}>
              {r.test(password) ? '✓' : '○'}
            </span>
            <span className={`text-[11px] font-bold ${r.test(password) ? 'text-green-400' : 'text-[#696969]'}`}>{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminForgotPassword = () => {
  const navigate = useNavigate();
  const [step,       setStep]       = useState(STEP.USERNAME);
  const [username,   setUsername]   = useState('');
  const [method,     setMethod]     = useState('');
  const [questions,  setQuestions]  = useState([]);
  const [answers,    setAnswers]    = useState(['', '', '']);
  const [otp,        setOtp]        = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPass,    setNewPass]    = useState('');
  const [confirmPass,setConfirmPass]= useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [info,       setInfo]       = useState('');

  const post = async (body) => {
    const res  = await fetch(CONFIG.auth, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return res.json();
  };

  const handleUsername = async () => {
    if (!username.trim()) return setError('Enter your username.');
    setLoading(true); setError('');
    const res = await fetch(`${CONFIG.auth}?action=security_questions&username=${encodeURIComponent(username)}`);
    const data = await res.json();
    if (data.success) {
      setQuestions(data.questions);
      setStep(STEP.METHOD);
    } else {
      setStep(STEP.METHOD);
    }
    setLoading(false);
  };

  const handleSendOtp = async () => {
    setLoading(true); setError(''); setInfo('');
    const data = await post({ action: 'send_otp', username });
    if (data.success) { setInfo(data.message); setStep(STEP.OTP); }
    else setError(data.message || 'Failed to send OTP.');
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return setError('Enter the OTP.');
    setLoading(true); setError('');
    const data = await post({ action: 'verify_otp', username, otp });
    if (data.success) { setResetToken(data.reset_token); setStep(STEP.RESET); }
    else setError(data.message || 'Invalid OTP.');
    setLoading(false);
  };

  const handleVerifySecurity = async () => {
    if (answers.some(a => !a.trim())) return setError('Answer all three questions.');
    setLoading(true); setError('');
    const data = await post({ action: 'verify_security', username, answers });
    if (data.success) { setResetToken(data.reset_token); setStep(STEP.RESET); }
    else setError(data.message || 'Incorrect answers.');
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (newPass !== confirmPass) return setError('Passwords do not match.');
    const failed = rules.find(r => !r.test(newPass));
    if (failed) return setError(failed.label + ' requirement not met.');
    setLoading(true); setError('');
    const data = await post({ action: 'reset_password', username, reset_token: resetToken, new_password: newPass });
    if (data.success) setStep(STEP.DONE);
    else setError(data.message || 'Reset failed.');
    setLoading(false);
  };

  const allRulesPassed = rules.every(r => r.test(newPass));

  return (
    <div className="min-h-screen bg-[#111111] flex items-center justify-center px-6 font-sans">
      <span aria-hidden="true" className="fixed right-[-2rem] top-1/2 -translate-y-1/2 font-heading font-black text-[30vw] text-white/[0.015] select-none leading-none uppercase pointer-events-none">TAG</span>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-5">
            <span className="w-8 h-[3px] bg-[#FF4500]" />
            <p className="text-[#FF4500] font-black text-[11px] tracking-[0.35em] uppercase">The Auction Guy</p>
            <span className="w-8 h-[3px] bg-[#FF4500]" />
          </div>
          <h1 className="text-white font-heading font-black text-[2.5rem] uppercase tracking-[0.1em] leading-none">Reset Password</h1>
          <p className="text-[#696969] font-bold text-[12px] tracking-[0.15em] uppercase mt-2">Admin Portal</p>
        </div>

        <div className="bg-[#1a1a1a] border-t-[5px] border-[#FF4500] shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
          <div className="p-10">

            {step === STEP.DONE ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 border-[2px] border-green-500 flex items-center justify-center mx-auto mb-6">
                  <span className="text-green-400 text-[28px]">✓</span>
                </div>
                <h2 className="text-white font-black text-[18px] uppercase tracking-[0.1em] mb-3">Password Reset</h2>
                <p className="text-[#A9A9A9] font-bold text-[13px] mb-8">Your password has been updated successfully.</p>
                <button onClick={() => navigate('/admin')}
                  className="w-full bg-[#FF4500] text-white font-black text-[12px] uppercase tracking-[0.22em] py-4 hover:bg-[#E63F00] transition-colors">
                  Back to Login
                </button>
              </div>
            ) : step === STEP.USERNAME ? (
              <>
                <p className="text-[#A9A9A9] font-bold text-[13px] leading-[1.7] mb-8">Enter your admin username to begin the password reset process.</p>
                <div className="mb-6">
                  <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.28em] uppercase mb-3">Username</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUsername()}
                    placeholder="admin"
                    className="w-full bg-[#696969]/60 border-[2px] border-[#808080] text-white font-bold text-[15px] px-5 py-4 placeholder-[#696969] focus:outline-none focus:border-[#FF4500] transition-colors" />
                </div>
                {error && <p className="text-red-400 font-bold text-[13px] mb-4">{error}</p>}
                <button onClick={handleUsername} disabled={loading}
                  className="w-full bg-[#FF4500] text-white font-black text-[12px] uppercase tracking-[0.22em] py-4 hover:bg-[#E63F00] transition-colors disabled:opacity-50">
                  {loading ? 'Checking...' : 'Continue'}
                </button>
              </>
            ) : step === STEP.METHOD ? (
              <>
                <p className="text-[#A9A9A9] font-bold text-[13px] leading-[1.7] mb-8">How would you like to verify your identity?</p>
                <div className="space-y-3 mb-8">
                  <button onClick={() => setMethod('otp')}
                    className={`w-full p-5 border-[2px] text-left transition-all ${method === 'otp' ? 'border-[#FF4500] bg-[#FF4500]/10' : 'border-[#696969] hover:border-[#808080]'}`}>
                    <p className={`font-black text-[13px] uppercase tracking-[0.12em] mb-1 ${method === 'otp' ? 'text-[#FF4500]' : 'text-white'}`}>Send OTP to Email</p>
                    <p className="text-[#696969] font-bold text-[12px]">Receive a 6-digit code via email</p>
                  </button>
                  {questions.length === 3 && (
                    <button onClick={() => setMethod('security')}
                      className={`w-full p-5 border-[2px] text-left transition-all ${method === 'security' ? 'border-[#FF4500] bg-[#FF4500]/10' : 'border-[#696969] hover:border-[#808080]'}`}>
                      <p className={`font-black text-[13px] uppercase tracking-[0.12em] mb-1 ${method === 'security' ? 'text-[#FF4500]' : 'text-white'}`}>Security Questions</p>
                      <p className="text-[#696969] font-bold text-[12px]">Answer your 3 security questions</p>
                    </button>
                  )}
                </div>
                {error && <p className="text-red-400 font-bold text-[13px] mb-4">{error}</p>}
                <button onClick={() => method === 'otp' ? handleSendOtp() : setStep(STEP.SECURITY)}
                  disabled={!method || loading}
                  className="w-full bg-[#FF4500] text-white font-black text-[12px] uppercase tracking-[0.22em] py-4 hover:bg-[#E63F00] transition-colors disabled:opacity-50">
                  {loading ? 'Sending...' : 'Continue'}
                </button>
              </>
            ) : step === STEP.OTP ? (
              <>
                {info && <p className="text-green-400 font-bold text-[13px] mb-6 bg-green-900/20 border-l-[3px] border-green-500 px-4 py-3">{info}</p>}
                <p className="text-[#A9A9A9] font-bold text-[13px] leading-[1.7] mb-8">Enter the 6-digit code sent to your email. Valid for 10 minutes.</p>
                <div className="mb-6">
                  <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.28em] uppercase mb-3">One-Time Code</label>
                  <input type="text" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full bg-[#696969]/60 border-[2px] border-[#808080] text-white font-black text-[28px] tracking-[0.5em] px-5 py-4 text-center placeholder-[#696969] focus:outline-none focus:border-[#FF4500] transition-colors" />
                </div>
                {error && <p className="text-red-400 font-bold text-[13px] mb-4">{error}</p>}
                <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6}
                  className="w-full bg-[#FF4500] text-white font-black text-[12px] uppercase tracking-[0.22em] py-4 hover:bg-[#E63F00] transition-colors disabled:opacity-50">
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button onClick={handleSendOtp} disabled={loading}
                  className="w-full mt-3 py-3 text-[#696969] font-black text-[11px] uppercase tracking-[0.2em] hover:text-white transition-colors disabled:opacity-40">
                  Resend Code
                </button>
              </>
            ) : step === STEP.SECURITY ? (
              <>
                <p className="text-[#A9A9A9] font-bold text-[13px] leading-[1.7] mb-8">Answer all three security questions. Answers are not case-sensitive.</p>
                <div className="space-y-5 mb-6">
                  {questions.map((q, i) => (
                    <div key={i}>
                      <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.2em] uppercase mb-2">{q}</label>
                      <input type="text" value={answers[i]} onChange={e => { const a = [...answers]; a[i] = e.target.value; setAnswers(a); }}
                        className="w-full bg-[#696969]/60 border-[2px] border-[#808080] text-white font-bold text-[14px] px-5 py-3 placeholder-[#696969] focus:outline-none focus:border-[#FF4500] transition-colors" />
                    </div>
                  ))}
                </div>
                {error && <p className="text-red-400 font-bold text-[13px] mb-4">{error}</p>}
                <button onClick={handleVerifySecurity} disabled={loading}
                  className="w-full bg-[#FF4500] text-white font-black text-[12px] uppercase tracking-[0.22em] py-4 hover:bg-[#E63F00] transition-colors disabled:opacity-50">
                  {loading ? 'Verifying...' : 'Verify Answers'}
                </button>
              </>
            ) : step === STEP.RESET ? (
              <>
                <p className="text-[#A9A9A9] font-bold text-[13px] leading-[1.7] mb-8">Choose a new strong password for your admin account.</p>
                <div className="mb-5">
                  <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.28em] uppercase mb-3">New Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)}
                      className="w-full bg-[#696969]/60 border-[2px] border-[#808080] text-white font-bold text-[15px] px-5 py-4 pr-14 placeholder-[#696969] focus:outline-none focus:border-[#FF4500] transition-colors" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#696969] hover:text-[#FF4500] font-bold text-[11px] uppercase tracking-widest transition-colors">
                      {showPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {newPass && <StrengthBar password={newPass} />}
                </div>
                <div className="mb-6">
                  <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.28em] uppercase mb-3">Confirm Password</label>
                  <input type={showPass ? 'text' : 'password'} value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                    className={`w-full bg-[#696969]/60 border-[2px] text-white font-bold text-[15px] px-5 py-4 placeholder-[#696969] focus:outline-none transition-colors ${
                      confirmPass && confirmPass !== newPass ? 'border-red-500' : 'border-[#808080] focus:border-[#FF4500]'
                    }`} />
                  {confirmPass && confirmPass !== newPass && (
                    <p className="text-red-400 font-bold text-[12px] mt-2">Passwords do not match.</p>
                  )}
                </div>
                {error && <p className="text-red-400 font-bold text-[13px] mb-4">{error}</p>}
                <button onClick={handleResetPassword} disabled={loading || !allRulesPassed || newPass !== confirmPass}
                  className="w-full bg-[#FF4500] text-white font-black text-[12px] uppercase tracking-[0.22em] py-4 hover:bg-[#E63F00] transition-colors disabled:opacity-50">
                  {loading ? 'Resetting...' : 'Set New Password'}
                </button>
              </>
            ) : null}

          </div>
          <div className="bg-[#111111] px-10 py-4 border-t border-[#696969]/20">
            <p className="text-[#696969] font-bold text-[11px] text-center">
              <Link to="/admin" className="hover:text-[#FF4500] transition-colors">Back to Login</Link>
              {' · '}
              <a href="/" className="hover:text-[#FF4500] transition-colors">Return to Site</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminForgotPassword;
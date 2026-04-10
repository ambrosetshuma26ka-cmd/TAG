import { useState, useEffect, useRef } from 'react';
import AdminLayout from './AdminLayout';
import CONFIG from '../../config';

const AdminProfile = () => (
  <AdminLayout>{(token) => <Content token={token} />}</AdminLayout>
);

const rules = [
  { label: 'At least 8 characters',     test: p => p.length >= 8   },
  { label: 'One uppercase letter (A–Z)', test: p => /[A-Z]/.test(p) },
  { label: 'One lowercase letter (a–z)', test: p => /[a-z]/.test(p) },
  { label: 'One number (0–9)',           test: p => /[0-9]/.test(p) },
  { label: 'One special character',      test: p => /[\W_]/.test(p) },
];

const StrengthBar = ({ password }) => {
  if (!password) return null;
  const passed = rules.filter(r => r.test(password)).length;
  const colors = ['bg-red-500','bg-orange-500','bg-yellow-400','bg-blue-400','bg-green-500'];
  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1">
        {rules.map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 transition-all ${i < passed ? colors[passed-1] : 'bg-[#696969]/30'}`} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-1">
        {rules.map((r, i) => (
          <span key={i} className={`text-[11px] font-bold flex items-center gap-2 ${r.test(password) ? 'text-green-400' : 'text-[#696969]'}`}>
            <span className="font-black">{r.test(password) ? '✓' : '○'}</span>{r.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-2">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-[#696969]/40 border-[2px] border-[#808080] text-white font-bold text-[14px] px-5 py-3.5 placeholder-[#696969] focus:outline-none focus:border-[#FF4500] transition-colors" />
  </div>
);

const Toast = ({ msg, ok }) => msg ? (
  <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] border-l-[5px] px-8 py-4 shadow-2xl font-black text-[13px] ${ok ? 'bg-[#1a1a1a] border-green-500 text-green-400' : 'bg-[#1a1a1a] border-red-500 text-red-400'}`}>
    {msg}
  </div>
) : null;

const Content = ({ token }) => {
  const headers     = { 'X-Admin-Token': token };
  const fileRef     = useRef();
  const [tab, setTab]         = useState('profile');
  const [profile, setProfile] = useState({ username:'', full_name:'', email:'', profile_photo:'', last_login:'' });
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoFile,    setPhotoFile]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState({ msg:'', ok:true });

  const [sq, setSq] = useState({ q1:'',a1:'', q2:'',a2:'', q3:'',a3:'' });
  const [cp, setCp] = useState({ current:'', newPass:'', confirm:'' });
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);

  const flash = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg:'', ok:true }), 4000);
  };

  useEffect(() => {
    fetch(`${CONFIG.auth}?action=profile`, { headers })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setProfile(d.data);
          setPhotoPreview(d.data.profile_photo ? `${import.meta.env.VITE_API_URL || "http://localhost/tag-api"}${d.data.profile_photo}` : '');
          setSq(prev => ({ ...prev, q1: d.data.security_q1 || '', q2: d.data.security_q2 || '', q3: d.data.security_q3 || '' }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    if (photoFile) {
      const fd = new FormData();
      fd.append('photo', photoFile);
      const r = await fetch(`${CONFIG.auth}?action=upload_photo`, {
        method: 'POST',
        headers: { 'X-Admin-Token': token },
        body: fd,
      });
      const d = await r.json();
      if (!d.success) { flash(d.message || 'Photo upload failed.', false); setSaving(false); return; }
    }
    const res  = await fetch(CONFIG.auth, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_profile', full_name: profile.full_name, email: profile.email }),
    });
    const data = await res.json();
    if (data.success) flash('Profile updated successfully.');
    else flash(data.message || 'Update failed.', false);
    setPhotoFile(null);
    setSaving(false);
  };

  const handleSaveSecurity = async () => {
    setSaving(true);
    const res  = await fetch(CONFIG.auth, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_security_questions', ...sq }),
    });
    const data = await res.json();
    if (data.success) flash('Security questions updated.');
    else flash(data.message || 'Update failed.', false);
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (cp.newPass !== cp.confirm) return flash('New passwords do not match.', false);
    const failed = rules.find(r => !r.test(cp.newPass));
    if (failed) return flash(failed.label + ' requirement not met.', false);
    setSaving(true);
    const res  = await fetch(CONFIG.auth, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'change_password', current_password: cp.current, new_password: cp.newPass }),
    });
    const data = await res.json();
    if (data.success) { flash('Password changed.'); setCp({ current:'', newPass:'', confirm:'' }); }
    else flash(data.message || 'Failed.', false);
    setSaving(false);
  };

  const tabs = [
    { key: 'profile',   label: 'Profile'           },
    { key: 'security',  label: 'Security Questions' },
    { key: 'password',  label: 'Change Password'    },
  ];

  if (loading) return <div className="p-10 text-[#A9A9A9] font-bold text-center py-24">Loading profile...</div>;

  return (
    <div className="p-8 lg:p-10 max-w-3xl">
      <div className="mb-8">
        <p className="text-[#FF4500] font-black text-[10px] tracking-[0.35em] uppercase mb-1">Admin</p>
        <h1 className="text-white font-heading font-black text-[1.8rem] uppercase tracking-[0.08em] mb-1">My Profile</h1>
        <p className="text-[#A9A9A9] font-bold text-[13px]">Manage your account settings, security questions, and password.</p>
      </div>

      <div className="flex border-b-[2px] border-[#696969]/30 mb-8 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-6 py-3.5 font-black text-[11px] tracking-[0.18em] uppercase whitespace-nowrap border-b-[3px] -mb-[2px] transition-all ${
              tab === t.key ? 'text-[#FF4500] border-[#FF4500]' : 'text-[#696969] border-transparent hover:text-[#A9A9A9]'
            }`}>{t.label}</button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="bg-[#111111] border-t-[4px] border-[#FF4500] p-8 space-y-6">
          <div className="flex items-center gap-8 pb-6 border-b border-[#696969]/20">
            <div className="relative shrink-0">
              <div className="w-24 h-24 bg-[#1a1a1a] border-[3px] border-[#696969] overflow-hidden flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#FF4500] font-heading font-black text-[2.5rem] uppercase">
                    {(profile.full_name || profile.username || 'A').charAt(0)}
                  </span>
                )}
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#FF4500] flex items-center justify-center hover:bg-[#E63F00] transition-colors">
                <span className="text-white font-black text-[13px]">+</span>
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
            </div>
            <div>
              <p className="text-white font-black text-[18px]">{profile.full_name || profile.username}</p>
              <p className="text-[#FF4500] font-bold text-[12px] uppercase tracking-widest mt-0.5">Administrator</p>
              {profile.last_login && (
                <p className="text-[#696969] font-bold text-[11px] mt-1">
                  Last login: {new Date(profile.last_login).toLocaleString('en-ZA')}
                </p>
              )}
              <p className="text-[#696969] font-bold text-[11px] mt-0.5">Click + to change photo (max 2MB, JPEG/PNG/WebP)</p>
            </div>
          </div>

          <Field label="Full Name"   value={profile.full_name} onChange={v => setProfile(p => ({...p, full_name: v}))} placeholder="Ventnor Goosen" />
          <Field label="Email Address" value={profile.email} onChange={v => setProfile(p => ({...p, email: v}))} type="email" placeholder="info@theauctionguyza.co.za" />
          <div>
            <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-2">Username</label>
            <div className="w-full bg-[#696969]/20 border-[2px] border-[#696969]/30 text-[#696969] font-bold text-[14px] px-5 py-3.5">{profile.username}</div>
            <p className="text-[#696969] font-bold text-[11px] mt-1">Username cannot be changed.</p>
          </div>

          <button onClick={handleSaveProfile} disabled={saving}
            className="w-full bg-[#FF4500] text-white font-black text-[12px] uppercase tracking-[0.22em] py-4 hover:bg-[#E63F00] transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}

      {tab === 'security' && (
        <div className="bg-[#111111] border-t-[4px] border-[#FF4500] p-8 space-y-6">
          <div className="bg-[#1a1a1a] border-l-[4px] border-[#FF4500] px-5 py-4 mb-2">
            <p className="text-[#A9A9A9] font-bold text-[13px] leading-[1.7]">
              Security questions allow you to reset your password without email access. Answers are stored securely and are not case-sensitive.
            </p>
          </div>

          {[1,2,3].map(n => (
            <div key={n} className="space-y-3">
              <p className="text-[#FF4500] font-black text-[10px] tracking-[0.3em] uppercase">Question {n}</p>
              <Field label="Question" value={sq[`q${n}`]} onChange={v => setSq(p => ({...p, [`q${n}`]: v}))} placeholder={`e.g. What was your first car?`} />
              <Field label="Answer" value={sq[`a${n}`]} onChange={v => setSq(p => ({...p, [`a${n}`]: v}))} placeholder="Your answer (not case-sensitive)" />
            </div>
          ))}

          <button onClick={handleSaveSecurity} disabled={saving}
            className="w-full bg-[#FF4500] text-white font-black text-[12px] uppercase tracking-[0.22em] py-4 hover:bg-[#E63F00] transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Security Questions'}
          </button>
        </div>
      )}

      {tab === 'password' && (
        <div className="bg-[#111111] border-t-[4px] border-[#FF4500] p-8 space-y-5">
          <div>
            <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-2">Current Password</label>
            <div className="relative">
              <input type={showCur ? 'text' : 'password'} value={cp.current} onChange={e => setCp(p => ({...p, current: e.target.value}))}
                className="w-full bg-[#696969]/40 border-[2px] border-[#808080] text-white font-bold text-[14px] px-5 py-3.5 pr-14 focus:outline-none focus:border-[#FF4500] transition-colors" />
              <button type="button" onClick={() => setShowCur(!showCur)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#696969] hover:text-[#FF4500] font-bold text-[11px] uppercase tracking-widest transition-colors">
                {showCur ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-2">New Password</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={cp.newPass} onChange={e => setCp(p => ({...p, newPass: e.target.value}))}
                className="w-full bg-[#696969]/40 border-[2px] border-[#808080] text-white font-bold text-[14px] px-5 py-3.5 pr-14 focus:outline-none focus:border-[#FF4500] transition-colors" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#696969] hover:text-[#FF4500] font-bold text-[11px] uppercase tracking-widest transition-colors">
                {showNew ? 'Hide' : 'Show'}
              </button>
            </div>
            <StrengthBar password={cp.newPass} />
          </div>

          <div>
            <label className="block text-[#A9A9A9] font-black text-[11px] tracking-[0.25em] uppercase mb-2">Confirm New Password</label>
            <input type={showNew ? 'text' : 'password'} value={cp.confirm} onChange={e => setCp(p => ({...p, confirm: e.target.value}))}
              className={`w-full bg-[#696969]/40 border-[2px] text-white font-bold text-[14px] px-5 py-3.5 focus:outline-none transition-colors ${
                cp.confirm && cp.confirm !== cp.newPass ? 'border-red-500' : 'border-[#808080] focus:border-[#FF4500]'
              }`} />
            {cp.confirm && cp.confirm !== cp.newPass && <p className="text-red-400 font-bold text-[12px] mt-1">Passwords do not match.</p>}
          </div>

          <button onClick={handleChangePassword}
            disabled={saving || !cp.current || !rules.every(r => r.test(cp.newPass)) || cp.newPass !== cp.confirm}
            className="w-full bg-[#FF4500] text-white font-black text-[12px] uppercase tracking-[0.22em] py-4 hover:bg-[#E63F00] transition-colors disabled:opacity-50">
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      )}

      <Toast msg={toast.msg} ok={toast.ok} />
    </div>
  );
};

export default AdminProfile;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { PBSLogo } from '../../components/institution/PBSBranding';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { INITIAL_USERS } from '../../services/storage/initialData';

export const LoginPage: React.FC = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('superadmin@polibanting.edu.my');
  const [password, setPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>('user-superadmin');

  // Email boleh diedit untuk setiap pengguna dalam panel RBAC
  const [userEmails, setUserEmails] = useState<Record<string, string>>(
    () => {
      const map: Record<string, string> = {};
      INITIAL_USERS.forEach((u) => { map[u.uid] = u.email; });
      return map;
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);
    const success = await login(email, password);
    setIsSubmitting(false);
    if (success) {
      navigate('/dashboard');
    }
  };

  // Klik peranan -> isi email ke form atas sahaja (bukan auto-login)
  const handleSelectRole = (uid: string) => {
    setSelectedRole(uid);
    setEmail(userEmails[uid]);
    setLocalError(null);
  };

  // Kemaskini email dalam panel RBAC
  const handleUserEmailChange = (uid: string, newEmail: string) => {
    setUserEmails((prev) => ({ ...prev, [uid]: newEmail }));
    if (selectedRole === uid) {
      setEmail(newEmail);
    }
  };

  const formatRole = (role: string) => role.split('_').join(' ');

  return (
    <div className="min-h-screen bg-appbg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <PBSLogo size="lg" variant="light" />
        </div>
        <h2 className="text-xl font-bold text-navy-900 tracking-tight">
          Sistem Arkib Produk Inovasi ePembelajaran (SAPIe)
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Portal Rasmi Pengurusan &amp; Pemeliharaan Inovasi Digital Pembelajaran
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-gray-200/80 rounded-2xl sm:px-10">
          {(error || localError) && (
            <div className="mb-4">
              <Alert type="danger" title="Ralat Log Masuk">
                {error || localError}
              </Alert>
            </div>
          )}

          {/* Form Log Masuk */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label-base">Alamat E-mel Institusi</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@polibanting.edu.my"
                  className="input-base pl-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="label-base">Kata Laluan</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-base pl-9 text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="w-full mt-2"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Log Masuk ke SAPIe
            </Button>
          </form>

          {/* Panel Ujian Akses Peranan (RBAC) */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              <UserCheck className="w-4 h-4 text-navy-700" />
              <span>Ujian Akses Peranan (RBAC)</span>
            </div>
            <p className="text-[11px] text-gray-500 mb-3">
              Pilih peranan, masukkan e-mel anda sendiri, kemudian klik Log Masuk:
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {INITIAL_USERS.map((u) => (
                <div
                  key={u.uid}
                  onClick={() => handleSelectRole(u.uid)}
                  className={
                    'w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer text-xs ' +
                    (selectedRole === u.uid
                      ? 'border-navy-500 bg-navy-50 ring-1 ring-navy-400'
                      : 'border-gray-200 hover:border-navy-300 hover:bg-gray-50')
                  }
                >
                  {/* Nama + Badge Peranan */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-gray-900 truncate">
                      {u.fullName}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-navy-100 text-navy-800 shrink-0 ml-2 whitespace-nowrap">
                      {formatRole(u.role)}
                    </span>
                  </div>

                  {/* Input E-mel Boleh Diedit */}
                  <div
                    className="relative"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Mail className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={userEmails[u.uid] || ''}
                      onChange={(e) => handleUserEmailChange(u.uid, e.target.value)}
                      onClick={() => handleSelectRole(u.uid)}
                      placeholder="emel@polibanting.edu.my"
                      className="w-full pl-6 pr-2 py-1 text-[11px] border border-gray-200 rounded-md bg-white focus:outline-none focus:border-navy-400 focus:ring-1 focus:ring-navy-300 text-gray-600"
                    />
                  </div>
                </div>
              ))}
            </div>

            {selectedRole && (
              <p className="text-[10px] text-navy-700 font-medium mt-2 text-center">
                ✅ Peranan dipilih &mdash; semak e-mel di atas dan klik{' '}
                <strong>Log Masuk ke SAPIe</strong>
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Hak Cipta Terpelihara &copy; {new Date().getFullYear()} Politeknik Banting Selangor.
        </div>
      </div>
    </div>
  );
};

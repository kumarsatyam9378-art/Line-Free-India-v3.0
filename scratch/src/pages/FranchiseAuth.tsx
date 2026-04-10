import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import BackButton from '../components/BackButton';

export default function FranchiseAuth() {
  const { signInWithGoogle, user, setRole } = useApp();
  const nav = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      setRole('franchise_admin');
      nav('/franchise/dashboard', { replace: true });
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Popup closed. Please try again.');
      } else {
        setError(err?.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex flex-col p-6 animate-fadeIn">
        <BackButton to="/role" />
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-lg font-semibold mb-8">{user.email}</p>
          <button onClick={() => nav('/franchise/dashboard', { replace: true })} className="btn-primary">
            Continue to Dashboard →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 animate-fadeIn">
      <BackButton to="/role" />
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-gold to-yellow-600 flex items-center justify-center mb-6 shadow-xl">
          <span className="text-5xl">🏢</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Franchise Owner</h1>
        <p className="text-text-dim mb-10 text-center">Login to manage multiple salon branches</p>

        {error && <div className="w-full max-w-xs mb-4 p-3 rounded-xl bg-danger/20 border border-danger/30 text-sm text-center">{error}</div>}

        <div className="w-full max-w-xs">
          <button onClick={handleGoogle} disabled={loading} className="w-full p-4 rounded-2xl bg-white text-gray-800 font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 transition-all shadow-md">
            {loading ? 'Logging in...' : 'Continue with Google'}
          </button>
        </div>
      </div>
    </div>
  );
}

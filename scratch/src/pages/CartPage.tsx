import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import { motion } from 'framer-motion';

// Cart removed — beauty platform uses Saved/Wishlist instead
export default function CartPage() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-bg text-text">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-40 h-40 mb-8 rounded-full border border-rose-500/20 flex items-center justify-center bg-rose-500/5"
      >
        <span className="text-6xl">💄</span>
      </motion.div>
      <h2 className="text-2xl font-black mb-2 text-text">Your Saved Looks</h2>
      <p className="text-text-dim text-xs font-bold tracking-widest uppercase mb-8">
        Save services from any salon to plan your visit
      </p>
      <button
        onClick={() => nav('/customer/home')}
        className="px-8 py-4 bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-full hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-rose-500/30"
      >
        Discover Salons ✨
      </button>
      <div className="mt-4">
        <BackButton to="/customer/home" />
      </div>
    </div>
  );
}

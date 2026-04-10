import { useState } from 'react';
import { motion } from 'framer-motion';
import BackButton from '../components/BackButton';
import AnimatedBackground from '../components/AnimatedBackground';
import SpinWheel from '../components/SpinWheel';
import ScratchCard from '../components/ScratchCard';
import ConfettiCelebration from '../components/ConfettiCelebration';

/**
 * Feature #92 + #94: Rewards Center (Spin Wheel + Scratch Cards)
 */

export default function RewardsCenter() {
  const [tab, setTab] = useState<'spin' | 'scratch' | 'history'>('spin');
  const [celebrate, setCelebrate] = useState(false);

  const rewards = [
    { date: '7 Apr', reward: '10% Off', emoji: '🎫' },
    { date: '5 Apr', reward: '50 Points', emoji: '⭐' },
    { date: '3 Apr', reward: 'Free Beard Trim', emoji: '💇' },
    { date: '1 Apr', reward: 'Try Again', emoji: '🔄' },
  ];

  return (
    <div className="min-h-screen pb-24 gradient-mesh-customer">
      <AnimatedBackground variant="customer" />

      <div className="p-4 flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="type-heading text-xl text-text">Rewards Center</h1>
          <p className="text-text-dim text-xs">Win exciting rewards daily!</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-6 flex gap-2">
        {[
          { key: 'spin' as const, label: '🎰 Spin', icon: '🎡' },
          { key: 'scratch' as const, label: '🎫 Scratch', icon: '✨' },
          { key: 'history' as const, label: '📋 History', icon: '📜' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all btn-haptic ${
              tab === t.key
                ? 'bg-primary text-white glow-rose'
                : 'glass-ultra text-text-dim'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ConfettiCelebration trigger={celebrate} type="confetti" onComplete={() => setCelebrate(false)}>
        <div className="px-4">
          {tab === 'spin' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="glass-ultra rounded-3xl p-6">
                <div className="text-center mb-4">
                  <h2 className="type-heading text-lg text-text">Daily Spin</h2>
                  <p className="text-text-dim text-xs">1 free spin every day</p>
                </div>
                <SpinWheel
                  onWin={() => setCelebrate(true)}
                />
              </div>
            </motion.div>
          )}

          {tab === 'scratch' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="glass-ultra rounded-2xl p-4">
                <h2 className="type-heading text-sm text-text mb-3">Today's Scratch Cards</h2>
                <ScratchCard
                  reward="₹100 Off!"
                  rewardEmoji="💰"
                  rewardSubtext="Valid for next booking"
                  onRevealed={() => setCelebrate(true)}
                />
              </div>

              <div className="glass-ultra rounded-2xl p-4">
                <h2 className="type-heading text-sm text-text mb-3">Bonus Card</h2>
                <ScratchCard
                  reward="Free Head Massage"
                  rewardEmoji="💆"
                  rewardSubtext="With any haircut"
                  onRevealed={() => setCelebrate(true)}
                />
              </div>

              <div className="glass-ultra rounded-2xl p-4 opacity-60">
                <h2 className="type-heading text-sm text-text mb-3">🔒 Premium Card</h2>
                <div className="h-[160px] rounded-2xl border border-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-2xl">👑</span>
                    <p className="text-xs text-text-dim mt-1">Available for Gold members</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {rewards.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-ultra rounded-xl p-4 flex items-center gap-3"
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text">{r.reward}</p>
                    <p className="text-xs text-text-dim">{r.date}</p>
                  </div>
                  <span className="badge badge-success text-xs">Won</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </ConfettiCelebration>
    </div>
  );
}

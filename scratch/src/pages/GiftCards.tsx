import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackButton from '../components/BackButton';
import AnimatedBackground from '../components/AnimatedBackground';

/**
 * Feature #59: Prepaid Gift Cards
 * Purchase beautiful digital gift cards
 */

const CARD_DESIGNS = [
  { id: 'birthday', name: 'Birthday', emoji: '🎂', gradient: 'from-pink-500 to-rose-500', pattern: '🎈🎁🎊' },
  { id: 'thankyou', name: 'Thank You', emoji: '💝', gradient: 'from-violet-500 to-purple-500', pattern: '💐🌸✨' },
  { id: 'festival', name: 'Festival', emoji: '🪔', gradient: 'from-amber-500 to-orange-500', pattern: '✨🪔🌟' },
  { id: 'wellness', name: 'Wellness', emoji: '🧘', gradient: 'from-emerald-500 to-teal-500', pattern: '🌿🍃💆' },
  { id: 'glowup', name: 'Glow Up', emoji: '✨', gradient: 'from-fuchsia-500 to-pink-500', pattern: '💅💇💄' },
  { id: 'classic', name: 'Classic', emoji: '🎁', gradient: 'from-slate-600 to-gray-700', pattern: '⭐🌟💎' },
];

const AMOUNTS = [250, 500, 1000, 2000, 5000];

export default function GiftCards() {
  const [selectedDesign, setSelectedDesign] = useState(CARD_DESIGNS[0]);
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="min-h-screen pb-24 gradient-mesh-customer">
      <AnimatedBackground variant="customer" />

      <div className="p-4 flex items-center gap-3">
        <BackButton />
        <div>
          <h1 className="type-heading text-xl text-text">Gift Cards</h1>
          <p className="text-text-dim text-xs">Send joy to your loved ones</p>
        </div>
      </div>

      {/* Card Preview */}
      <div className="px-4 mb-6">
        <motion.div
          layout
          className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${selectedDesign.gradient}`}
          style={{ minHeight: '180px' }}
        >
          <div className="absolute top-3 right-4 text-4xl opacity-20">{selectedDesign.pattern}</div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-white/10" />

          <div className="relative z-10">
            <span className="text-3xl">{selectedDesign.emoji}</span>
            <p className="text-white/80 text-xs font-medium mt-2">Line Free India Gift Card</p>
            <p className="text-white text-3xl font-black mt-1">₹{selectedAmount.toLocaleString()}</p>
            {recipientName && (
              <p className="text-white/70 text-sm mt-3">For: {recipientName}</p>
            )}
            {message && (
              <p className="text-white/60 text-xs mt-1 italic">"{message}"</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Design Selection */}
      <div className="px-4 mb-5">
        <h3 className="type-caption text-text-dim mb-2">Choose Design</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 horizontal-scroll">
          {CARD_DESIGNS.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDesign(d)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${d.gradient} flex items-center justify-center text-2xl border-2 btn-haptic ${
                selectedDesign.id === d.id ? 'border-white scale-110' : 'border-transparent'
              }`}
            >
              {d.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Amount Selection */}
      <div className="px-4 mb-5">
        <h3 className="type-caption text-text-dim mb-2">Select Amount</h3>
        <div className="flex gap-2 flex-wrap">
          {AMOUNTS.map(amt => (
            <button
              key={amt}
              onClick={() => setSelectedAmount(amt)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold btn-haptic transition-all ${
                selectedAmount === amt
                  ? 'bg-primary text-white glow-rose'
                  : 'glass-ultra text-text border border-border'
              }`}
            >
              ₹{amt.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Recipient Details */}
      <div className="px-4 space-y-3 mb-6">
        <div>
          <label className="type-caption text-text-dim mb-1 block">Recipient Name</label>
          <input
            type="text"
            value={recipientName}
            onChange={e => setRecipientName(e.target.value)}
            placeholder="Enter name..."
            className="input-field"
          />
        </div>
        <div>
          <label className="type-caption text-text-dim mb-1 block">Personal Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Add a personal message..."
            rows={2}
            className="input-field resize-none"
          />
        </div>
      </div>

      {/* Purchase Button */}
      <div className="px-4">
        <button className="btn-primary btn-haptic cta-pulse text-lg py-4 w-full">
          🎁 Purchase Gift Card — ₹{selectedAmount.toLocaleString()}
        </button>
      </div>
    </div>
  );
}

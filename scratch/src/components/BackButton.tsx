import { useNavigate } from 'react-router-dom';

export default function BackButton({ to }: { to?: string }) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => to ? nav(to) : nav(-1)}
      className="flex items-center gap-1.5 text-sm font-bold py-2 px-3 transition-all active:scale-95"
      style={{
        borderRadius: '14px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: '#A1A1AA'
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6"/>
      </svg>
      Back
    </button>
  );
}

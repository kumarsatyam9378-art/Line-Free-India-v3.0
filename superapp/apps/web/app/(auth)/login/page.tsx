"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep('otp');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Is API running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        // In a real app, store securely (e.g., cookies or Secure store)
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
        }

        if (data.is_new_user) {
          router.push('/onboarding/1');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
         <div className="w-12 h-12 rounded bg-gradient-to-tr from-blue-500 to-emerald-400 font-bold text-white text-2xl flex items-center justify-center mx-auto mb-4">S</div>
         <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">SuperApp</h2>
         <p className="text-sm text-gray-500 mt-2">Log in to manage your business.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-4 text-center border border-red-100">
          {error}
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-medium">
                +91
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                maxLength={10}
                className="pl-10 block w-full py-3 border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm border"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={phone.length !== 10 || isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div>
            <label htmlFor="otp" className="flex justify-between text-sm font-medium text-gray-700">
              <span>Enter OTP</span>
              <button 
                type="button" 
                onClick={() => setStep('phone')} 
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Change Number
              </button>
            </label>
            <div className="mt-1 input-otp-wrapper text-center">
              <input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength={6}
                className="block w-full py-3 text-center tracking-widest text-2xl font-bold border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm border"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">OTP sent to +91 {phone}</p>
          </div>
          
          <button
            type="submit"
            disabled={otp.length < 6 || isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify Securely'}
          </button>
        </form>
      )}
    </>
  );
}

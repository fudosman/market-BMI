import React, { useState, useEffect } from 'react';
import { User as FirebaseUser, signInAnonymously } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs, limit, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Activity, Smartphone, Scale, Ruler, CheckCircle2, Loader2, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

interface DeviceSimProps {
  user: FirebaseUser | null;
}

type Step = 'phone' | 'measuring' | 'results' | 'qr';

export function DeviceSim({ user }: DeviceSimProps) {
  const [step, setStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [measurementId, setMeasurementId] = useState<string | null>(null);

  const calculateBMI = (w: number, h: number) => {
    const heightInMeters = h / 100;
    return parseFloat((w / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 7) {
      setError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // In a real app, we'd check if user exists and sign them in
      // For this MVP, we'll use anonymous auth if not logged in
      if (!user) {
        await signInAnonymously(auth);
      }
      setStep('measuring');
      
      // Simulate hardware measurement delay
      setTimeout(() => {
        setStep('results');
        setLoading(false);
      }, 2000);
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  const saveMeasurement = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    
    const bmi = calculateBMI(weight, height);
    const timestamp = new Date().toISOString();

    try {
      const docRef = await addDoc(collection(db, 'measurements'), {
        userId: auth.currentUser.uid,
        deviceId: 'MARKET-STATION-001',
        weight,
        height,
        bmi,
        timestamp
      });
      setMeasurementId(docRef.id);
      setStep('qr');
    } catch (err) {
      setError('Failed to save measurement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden shadow-sm">
        {/* Device Header */}
        <div className="bg-black p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-800 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold">Station 001</h2>
              <p className="text-xs text-neutral-400">Main Marketplace</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-wider">Online</span>
          </div>
        </div>

        <div className="p-8 min-h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 'phone' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <Smartphone className="w-12 h-12 mx-auto text-neutral-300" />
                  <h3 className="text-2xl font-bold">Enter Phone Number</h3>
                  <p className="text-neutral-500">To track your progress over time</p>
                </div>
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +234 801 234 5678"
                    className="w-full px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-xl font-medium focus:ring-2 focus:ring-black outline-none transition-all"
                    required
                  />
                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                  <button
                    disabled={loading}
                    className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Continue'}
                  </button>
                </form>
              </motion.div>
            )}

            {step === 'measuring' && (
              <motion.div
                key="measuring"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="text-center space-y-8"
              >
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 border-4 border-neutral-100 rounded-full" />
                  <div className="absolute inset-0 border-4 border-black rounded-full border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Scale className="w-12 h-12 text-black" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Measuring...</h3>
                  <p className="text-neutral-500">Please stand still on the platform</p>
                </div>
              </motion.div>
            )}

            {step === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-neutral-50 rounded-3xl space-y-2">
                    <Scale className="w-6 h-6 text-neutral-400" />
                    <div className="text-3xl font-bold">{weight} <span className="text-sm font-normal text-neutral-500">kg</span></div>
                    <div className="text-xs font-medium uppercase text-neutral-400 tracking-wider">Weight</div>
                  </div>
                  <div className="p-6 bg-neutral-50 rounded-3xl space-y-2">
                    <Ruler className="w-6 h-6 text-neutral-400" />
                    <div className="text-3xl font-bold">{height} <span className="text-sm font-normal text-neutral-500">cm</span></div>
                    <div className="text-xs font-medium uppercase text-neutral-400 tracking-wider">Height</div>
                  </div>
                </div>
                
                <div className="p-8 bg-black text-white rounded-3xl text-center space-y-2">
                  <div className="text-5xl font-bold">{calculateBMI(weight, height)}</div>
                  <div className="text-sm font-medium uppercase tracking-widest text-neutral-500">Your BMI</div>
                  <div className="inline-block px-3 py-1 bg-neutral-800 rounded-full text-xs font-bold text-green-400 uppercase tracking-wider">
                    Healthy Range
                  </div>
                </div>

                <button
                  onClick={saveMeasurement}
                  disabled={loading}
                  className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Save & Track Progress'}
                </button>
              </motion.div>
            )}

            {step === 'qr' && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8"
              >
                <div className="space-y-2">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-500" />
                  <h3 className="text-2xl font-bold">Measurement Saved!</h3>
                  <p className="text-neutral-500">Scan to see your full history on your phone</p>
                </div>
                
                <div className="p-4 bg-white border-2 border-neutral-100 rounded-3xl inline-block shadow-sm">
                  <QRCodeSVG 
                    value={`${window.location.origin}/dashboard?token=${measurementId}`} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg hover:bg-neutral-800 transition-all"
                  >
                    Go to My Dashboard
                  </button>
                  <button
                    onClick={() => setStep('phone')}
                    className="text-neutral-500 font-medium hover:text-black transition-colors"
                  >
                    New Measurement
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Hardware Controls (Simulation Only) */}
      <div className="mt-8 p-6 bg-neutral-100 rounded-3xl border border-neutral-200 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Hardware Simulator</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Weight (kg)</label>
            <input 
              type="range" min="30" max="150" value={weight} 
              onChange={(e) => setWeight(parseInt(e.target.value))}
              className="w-full accent-black"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Height (cm)</label>
            <input 
              type="range" min="100" max="220" value={height} 
              onChange={(e) => setHeight(parseInt(e.target.value))}
              className="w-full accent-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

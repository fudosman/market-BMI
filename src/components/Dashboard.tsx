import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Measurement } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { format } from 'date-fns';
import { Scale, Ruler, Activity, TrendingUp, TrendingDown, History, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  user: FirebaseUser | null;
}

export function Dashboard({ user }: DashboardProps) {
  const [searchParams] = useSearchParams();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'measurements'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(20)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Measurement[];
        setMeasurements(data.reverse()); // Reverse for chronological chart
      } catch (err) {
        console.error(err);
        setError('Failed to load history. Make sure you are logged in.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-24 space-y-6">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto">
          <Activity className="w-10 h-10 text-neutral-300" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">No Profile Found</h2>
          <p className="text-neutral-500">Please complete a measurement to see your history.</p>
        </div>
        <a href="/device" className="inline-block bg-black text-white px-8 py-3 rounded-full font-medium">
          Start Now
        </a>
      </div>
    );
  }

  const latest = measurements[measurements.length - 1];
  const previous = measurements[measurements.length - 2];
  const weightDiff = previous ? latest.weight - previous.weight : 0;

  const chartData = measurements.map(m => ({
    date: format(new Date(m.timestamp), 'MMM d'),
    weight: m.weight,
    bmi: m.bmi
  }));

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Health Dashboard</h1>
          <p className="text-neutral-500">Real-time tracking for {user.phoneNumber || 'User'}</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-400">
          <History className="w-4 h-4" />
          Last updated: {latest ? format(new Date(latest.timestamp), 'MMM d, HH:mm') : 'Never'}
        </div>
      </header>

      {measurements.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-[32px] p-12 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-neutral-200 mx-auto" />
          <h3 className="text-xl font-bold">No measurements yet</h3>
          <p className="text-neutral-500">Your health journey starts with your first measurement.</p>
          <a href="/device" className="inline-block bg-black text-white px-6 py-2 rounded-full text-sm font-medium">
            Go to Station
          </a>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-neutral-200 rounded-[32px] p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center">
                  <Scale className="w-6 h-6 text-black" />
                </div>
                {weightDiff !== 0 && (
                  <div className={`flex items-center gap-1 text-sm font-bold ${weightDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {weightDiff > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(weightDiff).toFixed(1)}kg
                  </div>
                )}
              </div>
              <div>
                <div className="text-4xl font-bold">{latest.weight} <span className="text-lg font-normal text-neutral-400">kg</span></div>
                <div className="text-sm font-medium uppercase tracking-widest text-neutral-400 mt-1">Current Weight</div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-[32px] p-8 space-y-4">
              <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-black" />
              </div>
              <div>
                <div className="text-4xl font-bold">{latest.bmi}</div>
                <div className="text-sm font-medium uppercase tracking-widest text-neutral-400 mt-1">Current BMI</div>
                <div className="mt-2 inline-block px-2 py-0.5 bg-green-50 text-green-600 rounded text-[10px] font-bold uppercase tracking-wider">
                  Healthy
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-[32px] p-8 space-y-4">
              <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center">
                <Ruler className="w-6 h-6 text-black" />
              </div>
              <div>
                <div className="text-4xl font-bold">{latest.height} <span className="text-lg font-normal text-neutral-400">cm</span></div>
                <div className="text-sm font-medium uppercase tracking-widest text-neutral-400 mt-1">Height</div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-neutral-200 rounded-[32px] p-8 space-y-6">
              <h3 className="text-xl font-bold tracking-tight">Weight Trend</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#a3a3a3'}} />
                    <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="weight" stroke="#000" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-[32px] p-8 space-y-6">
              <h3 className="text-xl font-bold tracking-tight">BMI Progress</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#a3a3a3'}} />
                    <YAxis hide domain={[15, 35]} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="bmi" stroke="#000" strokeWidth={3} dot={{ r: 4, fill: '#000' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-neutral-200 rounded-[32px] overflow-hidden">
            <div className="p-8 border-b border-neutral-100">
              <h3 className="text-xl font-bold tracking-tight">Recent Measurements</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-neutral-50 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    <th className="px-8 py-4">Date</th>
                    <th className="px-8 py-4">Weight</th>
                    <th className="px-8 py-4">Height</th>
                    <th className="px-8 py-4">BMI</th>
                    <th className="px-8 py-4">Station</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {measurements.slice().reverse().map((m) => (
                    <tr key={m.id} className="hover:bg-neutral-50 transition-colors group">
                      <td className="px-8 py-4 text-sm font-medium">{format(new Date(m.timestamp), 'MMM d, yyyy')}</td>
                      <td className="px-8 py-4 text-sm font-bold">{m.weight}kg</td>
                      <td className="px-8 py-4 text-sm text-neutral-500">{m.height}cm</td>
                      <td className="px-8 py-4">
                        <span className="text-sm font-bold">{m.bmi}</span>
                      </td>
                      <td className="px-8 py-4 text-xs text-neutral-400 font-medium">{m.deviceId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

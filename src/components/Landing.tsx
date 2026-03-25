import { User as FirebaseUser } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { Activity, Shield, BarChart3, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingProps {
  user: FirebaseUser | null;
}

export function Landing({ user }: LandingProps) {
  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-semibold uppercase tracking-wider"
        >
          <Activity className="w-3 h-3" />
          Public Health Infrastructure
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight"
        >
          Measure. Track. <br />
          <span className="text-neutral-400 italic">Stay Healthy.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-neutral-500 max-w-xl mx-auto"
        >
          The smart marketplace station that turns your physical measurements into a digital health journey. No app required—just your phone number.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/device"
            className="w-full sm:w-auto bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 group"
          >
            Start Measurement
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto bg-white border border-neutral-200 text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-neutral-50 transition-all"
          >
            View My History
          </Link>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: Shield,
            title: "Phone-Based Identity",
            description: "No complex accounts. Your phone number is your key to your health data across any station."
          },
          {
            icon: BarChart3,
            title: "Continuous Tracking",
            description: "See your weight and BMI trends over time with interactive graphs and clear insights."
          },
          {
            icon: MapPin,
            title: "Market Presence",
            description: "Available in your local marketplaces. Quick, easy, and accurate measurements in under 30 seconds."
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 bg-white border border-neutral-200 rounded-3xl space-y-4"
          >
            <div className="w-12 h-12 bg-neutral-50 rounded-2xl flex items-center justify-center">
              <feature.icon className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xl font-bold">{feature.title}</h3>
            <p className="text-neutral-500 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </section>

      {/* Social Proof / Stats */}
      <section className="bg-black text-white rounded-[40px] p-12 md:p-24 text-center space-y-12">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-2xl mx-auto">
          Built for the community, <br />
          <span className="text-neutral-500">powered by data.</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Active Stations", value: "150+" },
            { label: "Measurements", value: "50k+" },
            { label: "Happy Users", value: "12k+" },
            { label: "Accuracy", value: "99.9%" }
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
              <div className="text-sm text-neutral-500 uppercase tracking-widest font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

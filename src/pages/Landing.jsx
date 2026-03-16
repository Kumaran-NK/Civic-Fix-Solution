import { useNavigate } from 'react-router-dom';
import { Wrench, ArrowRight, CheckCircle, Zap, Shield, BarChart3 } from 'lucide-react';

const features = [
  { icon: CheckCircle, title: 'Easy Reporting', desc: 'Submit civic issues with photos, location, and description in minutes.' },
  { icon: Zap, title: 'Real-time Tracking', desc: 'Track your issue from submission to resolution with live status updates.' },
  { icon: Shield, title: 'Secure & Transparent', desc: 'JWT-secured platform with full transparency in governance.' },
  { icon: BarChart3, title: 'Data-driven Insights', desc: 'Analytics help administrators improve city services efficiently.' },
];

const stats = [
  { label: 'Issues Resolved', value: '12,400+' },
  { label: 'Active Citizens', value: '45,000+' },
  { label: 'Cities Covered', value: '48' },
  { label: 'Avg. Resolution', value: '4.2 days' },  
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-civic-950 text-white overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-civic-500 rounded-xl flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span className="font-syne font-bold text-xl">CivicFix</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-civic-500 hover:bg-civic-400 transition-all shadow-lg"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-8 pt-20 pb-24 max-w-6xl mx-auto">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-civic-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm mb-8">
            <span className="w-2 h-2 bg-civic-400 rounded-full animate-pulse-slow" />
            <span className="text-white/80">Trusted by citizens across Tamil Nadu</span>
          </div>

          <h1 className="font-syne font-extrabold text-5xl md:text-7xl leading-none mb-6">
            From <span className="text-civic-400">Complaints</span><br />
            to <span className="text-civic-400">Solutions</span>
          </h1>

          <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            CivicFix bridges the gap between citizens and municipal authorities. Report issues, track resolutions, and build a better city — together.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 bg-civic-500 hover:bg-civic-400 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 shadow-xl hover:shadow-civic-500/30 text-base"
            >
              Report an Issue <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-2xl transition-all border border-white/20 text-base"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/10 bg-white/5">
        <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-syne font-bold text-3xl text-civic-400 mb-1">{s.value}</div>
              <div className="text-white/50 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="font-syne font-bold text-3xl mb-3">Why CivicFix?</h2>
          <p className="text-white/50">Everything you need to bridge the gap between citizens and governance</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all duration-200 hover:border-civic-500/40">
              <div className="w-10 h-10 bg-civic-500/20 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-civic-400" />
              </div>
              <h3 className="font-syne font-semibold text-base mb-2">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-8 pb-20 text-center">
        <div className="bg-civic-500/20 border border-civic-500/30 rounded-3xl p-12">
          <h2 className="font-syne font-bold text-3xl mb-4">Ready to make a difference?</h2>
          <p className="text-white/60 mb-8">Join thousands of citizens actively improving their communities.</p>
          <button
            onClick={() => navigate('/register')}
            className="bg-civic-500 hover:bg-civic-400 text-white font-semibold px-10 py-4 rounded-2xl transition-all duration-200 shadow-xl text-base"
          >
            Create Free Account
          </button>
        </div>
      </section>

      <footer className="border-t border-white/10 px-8 py-6 text-center text-white/30 text-sm">
        © 2025 CivicFix. Transforming civic engagement. 🧹
      </footer>
    </div>
  );
}
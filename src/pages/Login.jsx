import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wrench, Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/authApi';
import { getUserById } from '../api/userApi';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // POST /api/auth/login → { token, userId, role }
      const { token, userId, role } = await loginUser({
        email: form.email,
        password: form.password,
      });

      // Fetch full user profile
      // We temporarily set the token so axiosInstance can use it
      localStorage.setItem('token', token);
      const userData = await getUserById(userId);

      login(userData, token);
      navigate(`/${role.toLowerCase()}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          'Invalid email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-civic-950 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-civic-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-civic-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 bg-civic-500 rounded-xl flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span className="font-syne font-bold text-xl">CivicFix</span>
        </div>
        <div className="relative">
          <h2 className="font-syne font-extrabold text-4xl leading-tight mb-4">
            Your voice <span className="text-civic-400">shapes</span><br />your city.
          </h2>
          <p className="text-white/50 text-base leading-relaxed">
            Sign in to report issues, track resolutions, and connect with your municipal administration.
          </p>
          <div className="mt-10 space-y-3">
            {[
              { label: 'Issues Resolved Today', value: '42' },
              { label: 'Average Response Time', value: '4.2 days' },
              { label: 'Citizen Satisfaction', value: '94%' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-5 py-3">
                <span className="text-white/60 text-sm">{s.label}</span>
                <span className="font-syne font-bold text-civic-400">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-white/20 text-sm">© 2025 CivicFix</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-civic-500 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="font-syne font-bold text-xl text-gray-900">CivicFix</span>
          </div>

          <h1 className="font-syne font-bold text-2xl text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter password"
                  className="input-field pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-civic-600 hover:text-civic-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 text-base"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-civic-600 font-semibold hover:text-civic-700">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
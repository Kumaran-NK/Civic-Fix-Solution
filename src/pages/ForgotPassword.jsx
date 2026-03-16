import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Mail, Loader, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 bg-civic-500 rounded-xl flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <span className="font-syne font-bold text-xl text-gray-900">CivicFix</span>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <h2 className="font-syne font-bold text-xl text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm mb-6">We've sent an OTP to <strong>{email}</strong>. Use it to reset your password.</p>
              <Link to="/login" className="btn-primary inline-block">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-civic-50 rounded-2xl flex items-center justify-center mb-5">
                <Mail className="w-6 h-6 text-civic-600" />
              </div>
              <h1 className="font-syne font-bold text-2xl text-gray-900 mb-1">Forgot Password?</h1>
              <p className="text-gray-500 text-sm mb-6">Enter your registered email and we'll send you an OTP to reset your password.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="input-field"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full btn-primary py-3.5 flex items-center justify-center gap-2">
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Send OTP'}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-5">
                Remember it? <Link to="/login" className="text-civic-600 font-semibold">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
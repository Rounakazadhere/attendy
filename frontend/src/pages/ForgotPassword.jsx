import React, { useState } from 'react';
import axios from 'axios';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import config from '../config';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      console.log("Sending password reset request to:", `${config.API_URL}/api/auth/forgotpassword`);
      const res = await axios.post(`${config.API_URL}/api/auth/forgotpassword`, { email });
      setMessage(`✅ ${res.data.data}`); // "Email sent"
    } catch (err) {
      console.error("Forgot Password Error:", err);
      setError(err.response?.data?.message || "Failed to send email. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <Link
          to="/login"
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-gray-600 transition decoration-transparent"
        >
          <ArrowLeft size={20} /> Back to Login
        </Link>

        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Mail size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Forgot Password?</h2>
          <p className="text-gray-500 mt-2">Enter your email and we'll send you a reset link.</p>
        </div>

        {message && (
          <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-6 text-sm font-medium text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-900"
              placeholder="admin@school.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
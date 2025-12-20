import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RandomWords from '../effects/RandomWords.jsx';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending an email
    setTimeout(() => {
      alert(`Password reset link sent to ${email}`);
      setLoading(false);
      navigate('/login'); // Redirect back to login after sending
    }, 2000);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="bg-gray-900 p-8 rounded shadow-2xl w-96 border border-gray-800">

        <div className="text-2xl font-bold mb-4 text-center text-blue-500">
          <RandomWords text="Reset Password" />
        </div>

        <p className="text-gray-400 text-sm text-center mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-300 font-semibold mb-2">Email Address</label>
            <input
              type="email"
              className="w-full p-3 bg-gray-800 border border-gray-700 text-white rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@school.edu"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white font-bold p-2 rounded hover:bg-blue-700 transition duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Sending Link...' : 'Send Reset Link'}
          </button>

          <div className='mt-6 text-center'>
            <Link
              to="/login"
              className='text-gray-500 hover:text-blue-400 hover:underline text-sm font-semibold'
            >
              ← Back to Login
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ForgotPassword;
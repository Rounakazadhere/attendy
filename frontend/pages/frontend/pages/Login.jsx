import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import config from '../src/config';
import { useAuth } from '../src/context/AuthContext';
import { User, Lock, Shield } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // State
  const [step, setStep] = useState('LOGIN'); // 'LOGIN' or 'OTP'
  const [formData, setFormData] = useState({ loginId: '', password: '', otp: '', role: 'PRINCIPAL' });
  const [userEmail, setUserEmail] = useState(''); // Store email from ID lookup for OTP
  const [loading, setLoading] = useState(false);

  // Refs for Animation
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Staggered Entrance
    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 })
      .fromTo(imageRef.current, { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }, "-=0.5") // Image from right
      .fromTo(formRef.current, { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }, "-=0.8"); // Form from left

  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // STEP 1: VALIDATE CREDENTIALS & REQUEST OTP
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${config.API_URL}/api/auth/login`, {
        loginId: formData.loginId,
        password: formData.password,
        role: formData.role
      });

      // Response contains: { message: "OTP sent...", step: "OTP", email: "..." }
      if (res.data.step === 'OTP') {
        setStep('OTP');
        setUserEmail(res.data.email); // SAVE EMAIL FOR NEXT STEP

        // DEV HELPER: Show OTP if email fails
        if (res.data.debugOtp) {
          alert(`DEV MODE: Your OTP is ${res.data.debugOtp}`);
          console.log("DEV OTP:", res.data.debugOtp);
        }

        // Small success animation
        gsap.fromTo(formRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 });
      }
    } catch (err) {
      console.error(err);
      gsap.fromTo(formRef.current, { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true });
      alert(err.response?.data?.message || "Invalid User ID or Password");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY OTP & GET TOKEN
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use the stored email from step 1
      const res = await axios.post(`${config.API_URL}/api/auth/verify-otp`, {
        email: userEmail,
        otp: formData.otp
      });

      // Response contains: { token, user }
      login(res.data.user, res.data.token);

      const role = res.data.user.role ? res.data.user.role.toUpperCase() : 'STAFF';

      // Animation & Redirect
      gsap.to(containerRef.current, {
        y: -20, opacity: 0, duration: 0.5, onComplete: () => {
          if (role === 'PRINCIPAL') navigate('/principal/dashboard');
          else if (role === 'STAFF') navigate('/attendance');
          else if (role === 'PARENT') navigate('/parent/dashboard');
          else if (role.includes('ADMIN')) navigate('/admin/dashboard');
          else navigate('/dashboard');
        }
      });

    } catch (err) {
      console.error(err);
      gsap.fromTo(formRef.current, { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true });
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-green-900 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex overflow-hidden min-h-[600px] flex-row-reverse">

        {/* Right Side: Visual (Hidden on Mobile) */}
        <div ref={imageRef} className="w-1/2 bg-green-800 hidden md:flex flex-col items-center justify-center p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

          <div className="relative z-10 text-center">
            <h1 className="text-4xl font-extrabold mb-6">Welcome Back!</h1>
            <p className="text-lg opacity-90 leading-relaxed mb-8">
              Sign in to access your dashboard, manage smart attendance, and view real-time insights.
            </p>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 hover:bg-white/20 transition duration-300 transform hover:scale-105">
              <p className="font-bold text-xl mb-1">
                {step === 'LOGIN' ? 'Secure & Fast ⚡' : 'Extra Security 🔐'}
              </p>
              <p className="text-sm">
                {step === 'LOGIN' ? 'Your data is encrypted.' : 'Please verify only you can access.'}
              </p>
            </div>
          </div>

          {/* Decorative Blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-500 rounded-full blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-teal-500 rounded-full blur-3xl opacity-40 animate-pulse"></div>
        </div>

        {/* Left Side: Form */}
        <div ref={formRef} className="w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {step === 'LOGIN' ? 'Account Login' : 'Enter OTP'}
            </h2>
            <p className="text-gray-500">
              {step === 'LOGIN'
                ? 'Enter your User ID to access your portal.'
                : `We sent a 6-digit code to your email`
              }
            </p>
          </div>

          <form onSubmit={step === 'LOGIN' ? handleLoginSubmit : handleOtpSubmit} className="space-y-6">

            {step === 'LOGIN' && (
              <>
                {/* ROLE SELECTION */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pl-12 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium text-gray-700 appearance-none"
                    >
                      <option value="PRINCIPAL">Principal</option>
                      <option value="STAFF">Teacher</option>
                      <option value="STATE_ADMIN">Admin</option>
                      <option value="PARENT">Parent</option>
                    </select>
                  </div>
                </div>

                {/* USER ID INPUT */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">User ID / Email</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="loginId"
                      placeholder="e.g. 829102"
                      autoComplete="username"
                      onChange={handleChange}
                      value={formData.loginId}
                      required
                      className="w-full pl-12 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium text-gray-700"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>Password</span>
                    <a href="#" className="text-green-600 hover:text-green-800 text-xs">Forgot Password?</a>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      onChange={handleChange}
                      value={formData.password}
                      required
                      className="w-full pl-12 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium text-gray-700"
                    />
                  </div>
                </div>
              </>
            )}

            {step === 'OTP' && (
              <div className="relative group">
                <label className="block text-sm font-medium text-gray-700 mb-1">One-Time Password (OTP)</label>
                <input
                  type="text"
                  name="otp"
                  placeholder="123456"
                  maxLength="6"
                  autoComplete="one-time-code"
                  onChange={handleChange}
                  value={formData.otp}
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-medium text-gray-700 text-center tracking-widest text-2xl"
                  autoFocus
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-green-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : (step === 'LOGIN' ? 'Send OTP' : 'Verify & Login')}
            </button>

            {step === 'OTP' && (
              <button
                type="button"
                onClick={() => setStep('LOGIN')}
                className="w-full text-center text-gray-500 text-sm hover:text-gray-800"
              >
                Use a different ID
              </button>
            )}

          </form>

          {step === 'LOGIN' && (
            <div className="mt-8 text-center bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-gray-600 text-sm mb-2 font-medium">New here?</p>
              <div className="flex justify-center gap-4 text-sm">
                <Link to="/register" className="text-blue-600 font-bold hover:underline">Register New School / Staff</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
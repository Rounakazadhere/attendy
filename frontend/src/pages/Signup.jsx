import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import config from '@/config'; // Using Alias
import { Copy, CheckCircle } from 'lucide-react';

const Signup = () => {
  console.log("Signup Component Rendering");
  console.log("Config:", config);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const imageRef = useRef(null);

  // 'SCHOOL' (New School) or 'JOIN' (Teacher/Parent/Staff)
  const [activeTab, setActiveTab] = useState('SCHOOL');

  // Success Modal State
  const [successData, setSuccessData] = useState(null); // { userId, schoolCode, role }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    schoolName: '',   // For Principal
    address: '',      // For Principal
    schoolCode: '',   // For Joiners
    role: 'STAFF'     // For Joiners (Teacher=STAFF, PARENT)
  });

  useEffect(() => {
    // Entrance Animations
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 })
      .fromTo(imageRef.current, { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }, "-=0.5")
      .fromTo(formRef.current, { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }, "-=0.8");
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '';
      let payload = {};

      if (activeTab === 'SCHOOL') {
        // Register New School (Principal)
        endpoint = `${config.API_URL}/api/auth/register-school`;
        payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          schoolName: formData.schoolName,
          address: formData.address
        };
      } else {
        // Join School (Teacher/Parent) - NOW USES join-school
        endpoint = `${config.API_URL}/api/auth/join-school`;
        payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          schoolCode: formData.schoolCode,
          role: formData.role
        };
      }

      const res = await axios.post(endpoint, payload);

      // Store Success Data for Display
      setSuccessData({
        userId: res.data.userId, // KEY ID
        schoolCode: res.data.schoolCode, // Only for Principal
        type: activeTab
      });

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration Failed.");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // SUCCESS VIEW
  if (successData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle size={48} className="text-green-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Registration Complete!</h2>
          <p className="text-gray-500 mb-8">You have successfully registered.</p>

          <div className="space-y-4 text-left">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <label className="text-xs font-bold text-blue-500 uppercase tracking-wider block mb-1">Your User ID (For Login)</label>
              <div className="flex justify-between items-center">
                <span className="text-3xl font-mono font-bold text-gray-800">{successData.userId}</span>
                <button onClick={() => copyToClipboard(successData.userId)} className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg"><Copy size={20} /></button>
              </div>
              <p className="text-xs text-blue-400 mt-2"><b>Write this down!</b> You will use this ID to login.</p>
            </div>

            {successData.schoolCode && (
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <label className="text-xs font-bold text-purple-500 uppercase tracking-wider block mb-1">Your School Code</label>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-mono font-bold text-gray-800">{successData.schoolCode}</span>
                  <button onClick={() => copyToClipboard(successData.schoolCode)} className="text-purple-600 hover:bg-purple-100 p-2 rounded-lg"><Copy size={20} /></button>
                </div>
                <p className="text-xs text-purple-400 mt-2">Share this code with your Teachers so they can join.</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl mt-8 hover:bg-black transition-all"
          >
            Proceed to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl flex overflow-hidden min-h-[600px]">

        {/* Left Side: Visual & Context */}
        <div ref={imageRef} className="w-1/3 bg-blue-600 hidden md:flex flex-col items-center justify-center p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-pulse"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-3xl font-extrabold mb-6">
              {activeTab === 'SCHOOL' ? 'Start Your Journey.' : 'Join Your Team.'}
            </h1>
            <p className="text-md opacity-90 leading-relaxed mb-8">
              {activeTab === 'SCHOOL'
                ? 'Register your school today to automate attendance and track performance.'
                : 'Connect with your school using the unique code provided by your Principal.'
              }
            </p>

            <div className="space-y-4 w-full">
              <button
                onClick={() => setActiveTab('SCHOOL')}
                className={`w-full py-3 px-4 rounded-xl border-2 transition-all font-bold ${activeTab === 'SCHOOL' ? 'bg-white text-blue-600 border-white' : 'border-white/30 text-white hover:bg-white/10'}`}
              >
                Register New School
              </button>
              <button
                onClick={() => setActiveTab('JOIN')}
                className={`w-full py-3 px-4 rounded-xl border-2 transition-all font-bold ${activeTab === 'JOIN' ? 'bg-white text-blue-600 border-white' : 'border-white/30 text-white hover:bg-white/10'}`}
              >
                Join School
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div ref={formRef} className="w-full md:w-2/3 p-8 md:p-12 bg-white flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {activeTab === 'SCHOOL' ? 'Register New School' : 'Join Existing School'}
          </h2>
          <p className="text-gray-500 mb-6">
            {activeTab === 'SCHOOL' ? 'Create a designated space for your institution.' : 'Ask your Principal for the School Code.'}
          </p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* COMMON FIELDS */}
            <div className="col-span-2 md:col-span-1 group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" name="name" value={formData.name} placeholder="e.g. John Doe" onChange={handleChange} required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900" />
            </div>

            <div className="col-span-2 md:col-span-1 group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" name="email" value={formData.email} placeholder="you@example.com" onChange={handleChange} required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900" />
            </div>

            <div className="col-span-2 md:col-span-1 group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" name="password" value={formData.password} placeholder="Min. 6 chars" onChange={handleChange} required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900" />
            </div>

            {/* SCHOOL SPECIFIC */}
            {activeTab === 'SCHOOL' && (
              <>
                <div className="col-span-2 md:col-span-1 group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                  <input type="text" name="schoolName" value={formData.schoolName} placeholder="e.g. DPS R.K. Puram" onChange={handleChange} required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900" />
                </div>
                <div className="col-span-2 group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Address</label>
                  <input type="text" name="address" value={formData.address} placeholder="City, State" onChange={handleChange} required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900" />
                </div>
              </>
            )}

            {/* JOIN SPECIFIC */}
            {activeTab === 'JOIN' && (
              <>
                <div className="col-span-2 md:col-span-1 group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Code</label>
                  <input type="text" name="schoolCode" value={formData.schoolCode} placeholder="e.g. DPS-8291" onChange={handleChange} required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 font-mono tracking-wider" />
                </div>
                <div className="col-span-2 md:col-span-1 group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900"
                  >
                    <option value="STAFF">Teacher / Staff</option>
                    <option value="PRINCIPAL">Principal</option>
                  </select>
                </div>
              </>
            )}

            <div className="col-span-2 mt-4">
              <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                {activeTab === 'SCHOOL' ? 'Register School' : 'Join School'}
              </button>
            </div>
          </form>

          <p className="text-center mt-8 text-gray-500">
            Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
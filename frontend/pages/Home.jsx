import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const graphicRef = useRef(null);
  const featuresRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem('token');
      if (token) {
        navigate('/dashboard', { replace: true }); // Auto-redirect if logged in
      }
      setIsLoggedIn(!!token);
    };
    checkLogin();
    window.addEventListener('storage', checkLogin);
    window.addEventListener('login-success', checkLogin);
    return () => {
      window.removeEventListener('storage', checkLogin);
      window.removeEventListener('login-success', checkLogin);
    };
  }, [navigate]);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(heroRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1 }
    )
      .fromTo(textRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.5"
      )
      .fromTo(graphicRef.current,
        { x: 100, opacity: 0, rotation: 10 },
        { x: 0, opacity: 1, rotation: 3, duration: 1.2, ease: "elastic.out(1, 0.5)" },
        "-=1"
      )
      .fromTo(featuresRef.current.children,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2 },
        "-=0.5"
      );
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen text-white overflow-x-hidden">
      {/* Hero Section */}
      <div ref={heroRef} className="bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen flex items-center justify-center p-6 relative">
        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">

          {/* Left Side: Text Content */}
          <div ref={textRef} className="md:w-1/2 space-y-6">

            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
              Attendance <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                Reimagined.
              </span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-lg leading-relaxed">
              Empowering rural education with offline-first, GPS-verified attendance. Designed for connectivity-challenged environments.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              {isLoggedIn ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="group relative px-8 py-3 rounded-full bg-white text-black font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  <span className="relative z-10">Go to Dashboard →</span>
                </button>
              ) : (
                <Link to="/login" className="group relative px-8 py-3 rounded-full bg-blue-600 text-white font-bold text-lg overflow-hidden transition-all hover:bg-blue-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                  <span className="relative z-10">Login Now</span>
                </Link>
              )}
              <Link to="/register" className="px-8 py-3 rounded-full border border-gray-600 text-gray-300 font-medium text-lg hover:border-gray-400 hover:text-white transition-all">
                Join as Teacher
              </Link>
            </div>
          </div>

          {/* Right Side: Visual Graphic */}
          <div ref={graphicRef} className="md:w-1/2 flex justify-center relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-700 w-80 transform rotate-3 hover:rotate-0 transition duration-500 group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="space-y-4">
                <div className="h-2 bg-gray-600 rounded w-1/3"></div>
                <div className="h-8 bg-gray-700 rounded w-3/4"></div>

                <div className="space-y-3 pt-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-xl border border-gray-700/50 group-hover:border-blue-500/30 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${i === 2 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {i === 2 ? '✕' : '✓'}
                      </div>
                      <div className="h-2 bg-gray-600 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute -bottom-4 -right-4 bg-green-500 text-black font-bold px-4 py-2 rounded-lg shadow-lg transform group-hover:scale-110 transition">
                Online
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-20 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Why Choose Us?</h2>
            <div className="w-20 h-1 bg-blue-500 mx-auto mt-4"></div>
          </div>

          <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition duration-300 text-center group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition transform">⚡</div>
              <h3 className="text-xl font-bold mb-3 text-blue-400">Fast & Easy</h3>
              <p className="text-gray-400">Mark attendance for the whole class in seconds with our intuitive interface.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 hover:border-green-500 transition duration-300 text-center group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition transform">🔒</div>
              <h3 className="text-xl font-bold mb-3 text-green-400">Secure Data</h3>
              <p className="text-gray-400">Your student data is encrypted and stored safely in the cloud with role-based access.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition duration-300 text-center group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition transform">📊</div>
              <h3 className="text-xl font-bold mb-3 text-purple-400">Instant Reports</h3>
              <p className="text-gray-400">Generate monthly reports and track student performance effortlessly with charts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center border-t border-gray-800">
        <p>&copy; 2025 Rural Attendance System (SIH Edition). All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
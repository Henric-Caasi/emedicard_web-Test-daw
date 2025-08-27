// app/page.tsx
'use client';

import React, { useRef, useState, useEffect } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';

// It's great that you have this for structured error handling!
import { 
  getUserFriendlyErrorMessage, 
  logAuthError, 
  type ErrorContext 
} from '../utils/authErrorHandler';

export default function LandingPage() {
  // --- UI State ---
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const howToApplyRef = useRef<HTMLDivElement>(null);

  // --- Clerk Hooks ---
  const { signIn, setActive, isLoaded: isSignInLoaded } = useSignIn();
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();

  // --- Form State ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- EFFECT: Redirect if already logged in ---
  // This is crucial for a good user experience.
  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isUserLoaded, isSignedIn, router]);

  // --- EFFECT: Handle navbar style on scroll ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToHowToApply = () => {
    howToApplyRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // --- HANDLER: Login Submission ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignInLoaded) return; // Don't submit if Clerk isn't ready

    setError('');
    setLoading(true);

    try {
      // Start the sign-in process with Clerk
      const attempt = await signIn.create({
        identifier: email,
        password,
      });

      // If sign-in is complete, set the session as active
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        // Redirect to the dashboard after successful login
        router.push('/dashboard');
        setShowLoginModal(false); // Close the modal
      } else {
        // Handle cases like MFA if you have them enabled
        console.warn('Incomplete authentication:', { status: attempt.status });
        setError('Please complete the additional verification steps.');
      }
    } catch (err: any) {
      // This is a great pattern for handling auth errors
      const errorContext: ErrorContext = {
        email: email,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      const userFriendlyMessage = getUserFriendlyErrorMessage(err);
      setError(userFriendlyMessage);
      logAuthError(err, errorContext);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER: Loading Screen ---
  // This prevents the landing page from flashing while Clerk checks the user's status.
  if (!isUserLoaded || isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  // --- RENDER: Full Page ---
  // This only renders if Clerk is loaded and the user is confirmed to be logged out.
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex flex-col">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">eM</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">eMediCard</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-transparent flex-1">
        <div className="max-w-7xl gap-x-16 mx-auto px-6 flex flex-col lg:flex-row items-center min-h-[70vh]">
          <div className="flex-1 flex-col justify-center items-start mb-10 lg:mb-0">
            <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Your Health Card,<br />
              <span className="text-emerald-600">Digitized</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              A mobile health card system that puts your care in your pocket.
            </p>
            <div className="flex gap-4">
              <button
                className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-emerald-700"
                onClick={scrollToHowToApply}
              >
                Get Started
              </button>
              <button className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-xl font-semibold hover:bg-emerald-600 hover:text-white">
                Learn More
              </button>
            </div>
          </div>
          <div className="flex-1 flex justify-center lg:justify-end w-full">
            <img
              src="/images/human_mobile-application_uc2q.svg"
              alt="App Illustration"
              className="max-w-md w-full h-96"
              draggable={false}
            />
          </div>
        </div>
      </section>

      {/* How to Apply Section */}
      <section
        ref={howToApplyRef}
        className="py-20 bg-white"
        style={{ scrollMarginTop: '100px' }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How to Apply</h2>
          <p className="text-xl text-gray-600 mb-12">Simple steps to get your digital health card</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              ['Download App', 'Get the eMediCard app from the store', '1'],
              ['Complete Registration', 'Fill out your personal and health info', '2'],
              ['Get Verified', 'Verify your identity and activate your card', '3'],
            ].map(([title, desc, num]) => (
              <div key={num} className="text-center p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-lg">
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">{num}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-8 shadow-xl relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl absolute right-4 top-4"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
                  placeholder="email@emedicard.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <a href="#" className="text-emerald-600 hover:text-emerald-500">Forgot password?</a>
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
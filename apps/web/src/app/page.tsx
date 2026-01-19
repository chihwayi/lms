'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-10 bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">EduFlow</div>
          <div className="flex gap-4">
            <button 
              onClick={() => router.push('/login')}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => router.push('/register')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="text-center">
          <div className="inline-block mb-6">
            <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              🚀 Next-Generation Learning Platform
            </span>
          </div>
          <h1 className="text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Learning with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EduFlow
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience the future of education with AI-powered personalization, 
            innovation management, and intelligent mentorship matching.
          </p>
          <div className="flex gap-6 justify-center">
            <button 
              onClick={() => router.push('/register')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Get Started Free
            </button>
            <button 
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border-2 border-gray-300 text-gray-700 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:shadow-lg transition-all duration-200"
            >
              Learn More
            </button>
          </div>
        </div>
        
        {/* Features Grid */}
        <div id="features" className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">AI-Powered Learning</h3>
            <p className="text-gray-600 leading-relaxed">
              Intelligent content recommendations, automated assessments, and personalized learning paths that adapt to your unique style.
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Innovation Hub</h3>
            <p className="text-gray-600 leading-relaxed">
              Submit breakthrough ideas, collaborate with peers, and access funding opportunities in our comprehensive innovation ecosystem.
            </p>
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Smart Mentorship</h3>
            <p className="text-gray-600 leading-relaxed">
              AI-powered mentor matching based on 15+ factors, integrated scheduling, and progress tracking for meaningful connections.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 bg-white/50 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600">Expert Mentors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">1K+</div>
              <div className="text-gray-600">Courses Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
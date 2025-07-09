import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (email: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email);
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center font-sans p-4">
            <div className="relative w-full max-w-4xl flex flex-col md:flex-row bg-white shadow-2xl rounded-2xl overflow-hidden">
                {/* Left Panel: Animated Gradient */}
                <div className="relative md:w-1/2 p-8 md:p-12 text-white flex flex-col justify-between items-start bg-gray-900 overflow-hidden">
                    {/* Animated Shapes */}
                    <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-full opacity-50 animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-80 h-80 bg-gradient-to-br from-purple-600 to-violet-800 rounded-full opacity-40 animate-pulse delay-700"></div>
                    
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold tracking-tight">Task Dashboard</h1>
                        <p className="mt-4 text-lg text-gray-300 opacity-90">
                            Your centralized hub for tracking, managing, and completing tasks with unparalleled efficiency.
                        </p>
                    </div>

                    <div className="relative z-10 mt-12 text-sm text-gray-400">
                        &copy; {new Date().getFullYear()} Task Dashboard. All rights reserved.
                    </div>
                </div>

                {/* Right Panel: Login Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
                    <p className="text-slate-500 mb-8">Please enter your official Gmail to continue.</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base py-3 px-4 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full flex justify-center rounded-lg bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all hover:-translate-y-0.5"
                        >
                            Continue
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

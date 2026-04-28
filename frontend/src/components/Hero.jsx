import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'

// Utilitarian feature card — square, bordered, no rounded corners, no scale hover
function FeatureCard({ icon, title, description, isDarkMode }) {
    const cardBg     = isDarkMode ? 'bg-gray-950'  : 'bg-white';
    const textColor  = isDarkMode ? 'text-white'   : 'text-gray-900';
    const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-300';
    
    return (
        <div className={`${cardBg} border ${borderColor} p-6 transition-colors duration-150 hover:border-gray-500 dark:hover:border-gray-400`}>
            {/* Square icon container */}
            <div className={`w-10 h-10 flex items-center justify-center mb-4 border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-base`}>{icon}</span>
            </div>
            <h3
                className={`${textColor} text-sm font-semibold mb-2 uppercase tracking-wide`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
                {title}
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm leading-relaxed`}>{description}</p>
        </div>
    );
}

export default function Hero({ isDarkMode }) {
    const navigate = useNavigate();
    const textColor        = isDarkMode ? 'text-white'   : 'text-gray-900';
    const secondaryText    = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const sectionBg        = isDarkMode ? 'bg-gray-900'  : 'bg-gray-50';
    const sectionBorder    = isDarkMode ? 'border-gray-800' : 'border-gray-200';
    
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 80);
        return () => clearTimeout(timer);
    }, []);
    
    const features = [
        {
            icon: "⌗",
            title: "Smart Planning",
            description: "AI-powered workout plans customized to your specific fitness goals and experience level."
        },
        {
            icon: "↻",
            title: "Adaptive Training",
            description: "Workouts that evolve as you progress, ensuring continuous improvement and preventing plateaus."
        },
        {
            icon: "▦",
            title: "Progress Tracking",
            description: "Comprehensive tracking of your workout history and achievements to stay motivated."
        },
        {
            icon: "◎",
            title: "Goal-focused",
            description: "Specialized training approaches for strength, hypertrophy, or endurance based on your objectives."
        }
    ];
    
    return (
        <div className='flex flex-col w-full'>
            {/* ── Hero Section ─────────────────────────────── */}
            <div className={`min-h-[90vh] flex flex-col gap-8 items-start justify-center max-w-[860px] w-full mx-auto px-6 py-16 relative transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                
                {/* Overline monospace label */}
                <p
                    className={`${secondaryText} text-xs uppercase tracking-[0.2em]`}
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                    / Transform your fitness journey
                </p>

                {/* Title — sharp, tight, no glow */}
                <h1
                    className={`font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl ${textColor} leading-none tracking-tight uppercase`}
                >
                    Work<span className="font-black">Out</span><br />Master
                </h1>

                {/* Horizontal rule — utilitarian divider */}
                <div className={`w-16 h-[2px] ${isDarkMode ? 'bg-white' : 'bg-gray-900'}`} />

                <p className={`text-sm md:text-base font-light max-w-[520px] ${secondaryText} leading-relaxed`}>
                    Customized workouts tailored to your goals. Track progress and achieve results through a scientifically-backed, systematic approach.
                </p>

                <div className="flex gap-3 flex-wrap">
                    <Button
                        func={() => navigate('/generate')}
                        text="Create Workout"
                    />
                    <button
                        onClick={() => navigate('/history')}
                        className={`px-8 py-4 text-sm uppercase tracking-wider font-medium transition-colors duration-150 border-2
                            ${isDarkMode
                                ? 'border-gray-600 text-gray-300 hover:border-white hover:text-white'
                                : 'border-gray-300 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                            }`}
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                        View History
                    </button>
                </div>

                {/* Stats row — utilitarian data display */}
                <div className={`flex gap-8 pt-4 border-t ${sectionBorder} w-full`}>
                    {[
                        { value: '100+', label: 'Exercises' },
                        { value: 'AI',   label: 'Powered'   },
                        { value: '∞',    label: 'Plans'     },
                    ].map(stat => (
                        <div key={stat.label}>
                            <p
                                className={`text-2xl font-bold ${textColor}`}
                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                            >
                                {stat.value}
                            </p>
                            <p
                                className={`text-xs uppercase tracking-widest ${secondaryText}`}
                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                            >
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* ── Features Section ───────────────────────── */}
            <div className={`${sectionBg} border-t ${sectionBorder} py-16 px-6 w-full`}>
                <div className="max-w-7xl mx-auto">
                    <div className="mb-10">
                        <p
                            className={`text-xs uppercase tracking-[0.2em] ${secondaryText} mb-3`}
                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                            / Capabilities
                        </p>
                        <h2 className={`text-2xl font-bold ${textColor} uppercase tracking-tight`}>
                            Why WorkOut Master
                        </h2>
                    </div>
                    
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border ${sectionBorder}`}>
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`${index < features.length - 1 ? `border-r ${sectionBorder}` : ''}`}
                            >
                                <FeatureCard 
                                    icon={feature.icon}
                                    title={feature.title}
                                    description={feature.description}
                                    isDarkMode={isDarkMode}
                                />
                            </div>
                        ))}
                    </div>

                    {/* CTA Row */}
                    <div className={`mt-0 border border-t-0 ${sectionBorder} p-6 flex items-center justify-between flex-wrap gap-4`}>
                        <p
                            className={`text-xs uppercase tracking-widest ${secondaryText}`}
                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                            Ready to begin?
                        </p>
                        <Button 
                            func={() => navigate('/generate')}
                            text="Start Fitness Journey"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

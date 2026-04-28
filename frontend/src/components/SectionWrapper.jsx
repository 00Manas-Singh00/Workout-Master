import React from 'react'

export default function SectionWrapper(props) {
    const { children, header, title, id, isDarkMode } = props
    
    // Utilitarian: solid borders, no gradients
    const headerBg = isDarkMode 
        ? 'bg-gray-950 border-b border-gray-800' 
        : 'bg-[#f5f0eb] border-b border-gray-200';
    
    const contentBg = isDarkMode
        ? 'bg-[#0d0d0d]'
        : 'bg-[#f5f0eb]';
    
    const textColor        = isDarkMode ? 'text-gray-100' : 'text-gray-900';
    const headerTextColor  = isDarkMode ? 'text-gray-400' : 'text-gray-500';

    const renderHeader = () => {
        if (!header && !title) return null;
        
        return (
            <div className={`${headerBg} py-10 sm:py-12 flex flex-col gap-3 justify-start items-start px-6 transition-colors duration-150`}>
                {header && (
                    <p
                        className={`uppercase font-medium tracking-[0.2em] ${headerTextColor} text-xs`}
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                        / {header}
                    </p>
                )}
                {title && (
                    <h2
                        className={`font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl ${textColor} uppercase tracking-tight`}
                    >
                        {Array.isArray(title) ? (
                            <>
                                {title[0]} <span className="font-black">{title[1]}</span> {title[2] || ''}
                            </>
                        ) : (
                            title
                        )}
                    </h2>
                )}
                {/* Utilitarian rule — 2px solid bar, not rounded pill */}
                <div className={`w-12 h-[2px] ${isDarkMode ? 'bg-white' : 'bg-gray-900'} mt-2`}></div>
            </div>
        );
    };
    
    return (
        <section id={id} className={`min-h-screen flex flex-col ${contentBg} transition-colors duration-150`}>
            {renderHeader()}
            <div className='max-w-[1200px] w-full flex flex-col mx-auto gap-8 p-4 sm:p-6 md:p-8 flex-grow'>
                {children}
            </div>
        </section>
    )
}

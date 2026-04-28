import React from 'react'

export default function Button(props) {
    const { text, func, className = '' } = props
    return (
        <button 
            onClick={func} 
            className={`px-8 mx-auto py-4 font-medium transition-colors duration-150
            bg-gray-900 hover:bg-gray-700 text-white
            border-2 border-gray-900 hover:border-gray-700
            rounded-none uppercase tracking-wider text-sm
            active:bg-gray-600 ${className}`}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
            {text}
        </button>
    )
}

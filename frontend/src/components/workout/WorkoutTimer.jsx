import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

const WorkoutTimer = ({
  initialSeconds = 90,
  onComplete,
  className = '',
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Create audio context for beep sound
    audioRef.current = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && !isPaused && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  const handleComplete = () => {
    setIsRunning(false);
    setIsPaused(false);
    playSound();
    if (onComplete) {
      onComplete();
    }
  };

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(initialSeconds);
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((initialSeconds - seconds) / initialSeconds) * 100;

  return (
    <Card variant="elevated" className={`p-6 ${className}`}>
      <div className="flex flex-col items-center">
        {/* Timer Display */}
        <div className="relative mb-6">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="text-primary-500 transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-bold text-gray-900 dark:text-white font-mono">
              {formatTime(seconds)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!isRunning && !isPaused && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleStart}
              icon={Play}
              iconPosition="left"
            >
              Start
            </Button>
          )}
          
          {isRunning && !isPaused && (
            <Button
              variant="warning"
              size="lg"
              onClick={handlePause}
              icon={Pause}
              iconPosition="left"
            >
              Pause
            </Button>
          )}
          
          {isPaused && (
            <>
              <Button
                variant="primary"
                size="lg"
                onClick={handleResume}
                icon={Play}
                iconPosition="left"
              >
                Resume
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleReset}
                icon={RotateCcw}
              >
                Reset
              </Button>
            </>
          )}
          
          {isRunning && !isPaused && (
            <Button
              variant="ghost"
              size="lg"
              onClick={handleReset}
              icon={RotateCcw}
            >
              Reset
            </Button>
          )}
        </div>

        {/* Quick Presets */}
        <div className="mt-6 flex gap-2 flex-wrap justify-center">
          {[
            { label: '30s', value: 30 },
            { label: '60s', value: 60 },
            { label: '90s', value: 90 },
            { label: '2m', value: 120 },
            { label: '3m', value: 180 },
          ].map((preset) => (
            <Button
              key={preset.value}
              variant="outline"
              size="sm"
              onClick={() => {
                setSeconds(preset.value);
                setIsRunning(false);
                setIsPaused(false);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default WorkoutTimer;

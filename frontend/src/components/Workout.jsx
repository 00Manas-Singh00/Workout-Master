import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import SectionWrapper from './SectionWrapper';
import Button from './ui/Button';
import Card from './ui/Card';
import { useToast } from './ui/Toast';
import { useWorkout } from '../context/WorkoutContext';
import { logWorkoutSet, startWorkoutSession } from '../utils/api';
import { useSessionTimer } from '../utils/useSessionTimer';

// ── WebSocket-backed rest timer overlay ─────────────────────────────────────
const RestTimerOverlay = ({ remaining, total, isDarkMode, onSkip }) => {
  const isDone = remaining === 0;
  const pct = total > 0 ? remaining / total : 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * pct;

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const mono = { fontFamily: "'IBM Plex Mono', monospace" };
  const accent = isDarkMode ? '#e5e7eb' : '#111111';
  const gridColor = isDarkMode ? '#2d2d2d' : '#e5e7eb';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-fadeIn">
      <div
        className={`relative w-72 p-8 border-2 flex flex-col items-center gap-5 ${
          isDarkMode ? 'bg-gray-950 border-gray-700' : 'bg-white border-gray-300'
        }`}
      >
        {/* Label */}
        <p
          className={`text-xs uppercase tracking-widest ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}
          style={mono}
        >
          {isDone ? '/ Rest Complete' : '/ Rest Timer'}
        </p>

        {/* SVG Arc */}
        <svg width={130} height={130} viewBox="0 0 130 130">
          {/* Track */}
          <circle cx={65} cy={65} r={radius} fill="none" stroke={gridColor} strokeWidth={6} />
          {/* Progress arc */}
          {!isDone && (
            <circle
              cx={65}
              cy={65}
              r={radius}
              fill="none"
              stroke={accent}
              strokeWidth={6}
              strokeLinecap="butt"
              strokeDasharray={`${dash} ${circumference}`}
              transform="rotate(-90 65 65)"
              style={{ transition: 'stroke-dasharray 0.95s linear' }}
            />
          )}
          {/* Centre text */}
          <text
            x={65}
            y={68}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={accent}
            fontSize={isDone ? 14 : 26}
            fontWeight={900}
            fontFamily="IBM Plex Mono, monospace"
          >
            {isDone ? 'DONE' : formatTime(remaining)}
          </text>
        </svg>

        {/* Skip / Next button */}
        <button
          onClick={onSkip}
          className={`w-full py-2.5 text-xs uppercase tracking-widest font-medium border transition-colors duration-150 ${
            isDone
              ? isDarkMode
                ? 'bg-white text-gray-900 border-white hover:bg-gray-200'
                : 'bg-gray-900 text-white border-gray-900 hover:bg-gray-700'
              : isDarkMode
              ? 'text-gray-400 border-gray-700 hover:text-white hover:border-white'
              : 'text-gray-500 border-gray-300 hover:text-gray-900 hover:border-gray-900'
          }`}
          style={mono}
        >
          {isDone ? 'Next Set →' : 'Skip Rest'}
        </button>
      </div>
    </div>
  );
};


const Workout = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const {
    currentWorkout,
    setCurrentWorkout,
    saveWorkout,
    markWorkoutComplete,
    markWorkoutSkipped,
    loadAIGeneratedWorkout,
    error,
    setError
  } = useWorkout();
  const { success: toastSuccess, error: toastError } = useToast();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutId, setWorkoutId] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [sets, setSets] = useState([]);
  const [isSkipping, setIsSkipping] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const saveInFlightRef = useRef(false);
  const autoSaveDoneRef = useRef(false);

  // WebSocket rest timer
  const { remaining, total, isRunning, startTimer, cancelTimer } = useSessionTimer(
    user?.id
  );

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  // Load AI-generated workout on mount if available
  useEffect(() => {
    const loadAIWorkout = async () => {
      if (!currentWorkout) {
        const loaded = loadAIGeneratedWorkout();
        if (loaded) {
          // Show overview for AI-generated workouts
          setShowOverview(true);
        } else {
          // Check if there's an AI workout in localStorage that failed to load
          const aiWorkout = localStorage.getItem('aiGeneratedWorkout');
          if (aiWorkout) {
            console.error('Failed to load AI workout from localStorage');
            localStorage.removeItem('aiGeneratedWorkout');
          }
          // No AI workout and no current workout, redirect to generator
          navigate('/generate');
        }
      } else if (currentWorkout._id?.startsWith('ai-')) {
        // Show overview for AI workouts that haven't been saved to database yet
        if (!workoutId) {
          setShowOverview(true);
        }
      }
    };
    loadAIWorkout();
  }, [currentWorkout, navigate, workoutId]);

  // Hide overview when workout is in progress
  useEffect(() => {
    if (sessionStarted && showOverview) {
      setShowOverview(false);
    }
  }, [sessionStarted, showOverview]);

  useEffect(() => {
    if (!currentWorkout?._id) {
      autoSaveDoneRef.current = false;
      return;
    }
    setWorkoutId(currentWorkout._id);
    autoSaveDoneRef.current = true;
  }, [currentWorkout?._id]);

  // Update sets state when current exercise changes
  useEffect(() => {
    if (currentWorkout && currentWorkout.exercises && currentWorkout.exercises[currentExerciseIndex]) {
      const exerciseSets = currentWorkout.exercises[currentExerciseIndex].sets || [];
      setSets(exerciseSets);
    }
  }, [currentWorkout, currentExerciseIndex]);

  // Check if workout has been saved and get the ID
  useEffect(() => {
    const saveCurrentWorkout = async () => {
      if (currentWorkout && !currentWorkout._id && !workoutId && !saveInFlightRef.current && !autoSaveDoneRef.current) {
        try {
          saveInFlightRef.current = true;
          setIsSaving(true);
          const savedWorkout = await saveWorkout();
          if (savedWorkout && savedWorkout._id) {
            setWorkoutId(savedWorkout._id);
            autoSaveDoneRef.current = true;
          }
        } catch (err) {
          setLocalError('Failed to save workout. Your progress may not be saved.');
        } finally {
          saveInFlightRef.current = false;
          setIsSaving(false);
        }
      }
    };

    saveCurrentWorkout();
  }, [currentWorkout, workoutId, saveWorkout]);

  useEffect(() => {
    const startSession = async () => {
      const id = workoutId || currentWorkout?._id;
      // Skip session start for AI-generated workouts (not saved to database yet)
      if (!id || sessionStarted || id.startsWith('ai-')) return;

      try {
        await startWorkoutSession(id, {});
        setSessionStarted(true);
      } catch (err) {
        // Do not block workout UI if start endpoint fails; completion call remains authoritative.
        console.error('Failed to mark session as in progress:', err);
      }
    };

    startSession();
  }, [workoutId, currentWorkout, sessionStarted]);

  if (!currentWorkout || !currentWorkout.exercises || currentWorkout.exercises.length === 0) {
    return (
      <SectionWrapper isDarkMode={isDarkMode}>
        <div className="text-center py-16">
          <div className={`max-w-md mx-auto p-8 rounded-xl ${isDarkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white shadow-lg border border-gray-100'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <h2 className="text-2xl font-bold mb-4">No Active Workout</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Time to build those muscles! Create a new workout to get started.</p>
            <button
              onClick={() => navigate('/generate')}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-500 transition-all duration-200 font-medium shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Create Workout
            </button>
          </div>
        </div>
      </SectionWrapper>
    );
  }

  // Show overview for AI-generated workouts
  if (showOverview) {
    return (
      <SectionWrapper isDarkMode={isDarkMode}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className={`p-8 rounded-xl ${isDarkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white shadow-lg border border-gray-100'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">AI Generated Workout</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Personalized workout based on your fitness level and goals
                </p>
              </div>
            </div>

            <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <h3 className="font-semibold mb-2">Workout Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className={`block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Type</span>
                  <span className="font-medium capitalize">{currentWorkout.type || 'Individual'}</span>
                </div>
                <div>
                  <span className={`block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Goal</span>
                  <span className="font-medium capitalize">{currentWorkout.goal?.replace('_', ' ') || 'Strength'}</span>
                </div>
                <div>
                  <span className={`block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Exercises</span>
                  <span className="font-medium">{currentWorkout.exercises?.length || 0}</span>
                </div>
                <div>
                  <span className={`block ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Muscle Groups</span>
                  <span className="font-medium capitalize">{currentWorkout.muscles?.slice(0, 3).join(', ') || 'Full Body'}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-4">Exercises</h3>
              <div className="space-y-3">
                {currentWorkout.exercises?.map((exercise, index) => (
                  <div key={index} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{exercise.name}</h4>
                        <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {exercise.muscles?.join(', ') || 'Full Body'}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <span>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sets:</span> {exercise.sets?.length || 3}
                          </span>
                          <span>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Reps:</span> {exercise.sets?.[0]?.reps || '10'}
                          </span>
                          <span>
                            <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rest:</span> {exercise.rest || 60}s
                          </span>
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={async () => {
                  setShowOverview(false);
                  setSessionStarted(true);
                  // Save AI workout to database immediately when starting
                  if (currentWorkout?._id?.startsWith('ai-')) {
                    try {
                      const savedWorkout = await saveWorkout();
                      if (savedWorkout) {
                        setWorkoutId(savedWorkout._id);
                      }
                    } catch (err) {
                      console.error('Failed to save AI workout:', err);
                    }
                  }
                }}
                variant="primary"
                size="lg"
                className="flex-1"
              >
                Start Workout
              </Button>
              <Button
                onClick={() => {
                  setCurrentWorkout(null);
                  navigate('/generate');
                }}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </SectionWrapper>
    );
  }

  // Access the exercises array from the workout object
  const exercises = currentWorkout.exercises || [];
  const currentExercise = exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === exercises.length - 1;

  // Safety check - if no current exercise exists, show an error
  if (!currentExercise) {
    return (
      <SectionWrapper isDarkMode={isDarkMode}>
        <div className="text-center py-16">
          <div className={`max-w-md mx-auto p-8 rounded-xl ${isDarkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white shadow-lg border border-gray-100'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold mb-4">Exercise Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">There was a problem loading this exercise. Let's start fresh!</p>
            <button
              onClick={() => navigate('/generate')}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-500 transition-all duration-200 font-medium shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Create New Workout
            </button>
          </div>
        </div>
      </SectionWrapper>
    );
  }

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      cancelTimer();
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handlePrevExercise = () => {
    if (currentExerciseIndex > 0) {
      cancelTimer();
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleSetCompleted = async (setIndex, isCompleted) => {
    const updatedSets = [...sets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      completed: isCompleted
    };
    setSets(updatedSets);
    
    // Update the current workout exercise sets
    if (currentWorkout && currentWorkout.exercises) {
      const updatedWorkout = {
        ...currentWorkout,
        exercises: currentWorkout.exercises.map((exercise, idx) => {
          if (idx === currentExerciseIndex) {
            return {
              ...exercise,
              sets: updatedSets
            };
          }
          return exercise;
        })
      };
      // Update workout context
      setCurrentWorkout(updatedWorkout);
    }

    if (!isCompleted) return;

    // Start rest timer after a completed set
    const restSec = currentExercise?.rest || 90;
    startTimer(restSec);

    const id = workoutId || currentWorkout?._id;
    const currentExerciseId = currentExercise?.sessionExerciseId;
    // Skip backend logging for AI workouts that haven't been saved yet
    if (!id || !currentExerciseId || (id.startsWith('ai-') && !workoutId)) return;

    try {
      await logWorkoutSet(id, {
        sessionExerciseId: currentExerciseId,
        setNo: setIndex + 1,
        reps: Number(updatedSets[setIndex]?.reps || 0),
      });
    } catch (err) {
      console.error('Failed to log set to backend:', err);
    }
  };

  const handleCompleteWorkout = async () => {
    if (isCompleting) return;
    
    try {
      setIsCompleting(true);
      setLocalError(null);
      
      let id = workoutId || (currentWorkout._id ? currentWorkout._id : null);
      
      // For AI-generated workouts, save them to database first
      if (id?.startsWith('ai-')) {
        const savedWorkout = await saveWorkout();
        if (savedWorkout) {
          id = savedWorkout._id;
          setWorkoutId(id);
        } else {
          throw new Error('Failed to save AI workout');
        }
      }
      
      if (!id) {
        // Try to save the workout first
        const savedWorkout = await saveWorkout();
        if (savedWorkout) {
          id = savedWorkout._id;
        } else {
          throw new Error('Failed to save workout');
        }
      }
      
      await markWorkoutComplete(id);
      toastSuccess('Workout completed successfully!');
      navigate('/history');
    } catch (err) {
      toastError('Failed to complete workout: ' + (err.message || 'Unknown error'));
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSkipWorkout = async () => {
    if (isSkipping) return;

    try {
      setIsSkipping(true);
      setLocalError(null);

      let id = workoutId || (currentWorkout?._id ? currentWorkout._id : null);
      
      // For AI-generated workouts, save them to database first
      if (id?.startsWith('ai-')) {
        const savedWorkout = await saveWorkout();
        if (savedWorkout?._id) {
          id = savedWorkout._id;
          setWorkoutId(id);
        } else {
          throw new Error('Failed to save AI workout');
        }
      }
      
      if (!id) {
        const savedWorkout = await saveWorkout();
        if (savedWorkout?._id) {
          id = savedWorkout._id;
          setWorkoutId(id);
        }
      }

      if (!id) {
        throw new Error('Failed to save workout before skipping');
      }

      await markWorkoutSkipped(id, 'user_skipped');
      toastSuccess('Workout skipped');
      navigate('/history');
    } catch (err) {
      toastError('Failed to skip workout: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSkipping(false);
    }
  };

  // Get rest time from exercise, default to 60 seconds
  const restTime = currentExercise.rest || 60;

    return (
    <SectionWrapper isDarkMode={isDarkMode}>
      {localError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-xl dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{localError}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row mb-6 items-start gap-6">
        {/* Exercise Progress Indicator */}
        <div className={`w-full md:w-1/3 p-5 rounded-xl ${isDarkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white shadow-lg border border-gray-100'}`}>
          <h2 className="text-xl font-bold mb-4">Workout Progress</h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Exercise</span>
            <span className="text-sm font-medium">{currentExerciseIndex + 1} of {exercises.length}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%` }}
            ></div>
            </div>
            
          <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pr-2">
            {exercises.map((exercise, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg flex items-center gap-2 transition-all duration-200
                  ${index === currentExerciseIndex 
                    ? (isDarkMode ? 'bg-blue-900/40 border border-blue-700' : 'bg-blue-50 border border-blue-200')
                    : index < currentExerciseIndex
                      ? (isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200')
                      : (isDarkMode ? 'bg-gray-700/50 border border-gray-700' : 'bg-gray-100 border border-gray-200')
                  }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                  ${index === currentExerciseIndex 
                    ? 'bg-blue-600 text-white'
                    : index < currentExerciseIndex
                      ? 'bg-green-600 text-white'
                      : (isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-600')
                  }`}
                >
                  {index + 1}
                </div>
                <span className="font-medium truncate">{exercise.name}</span>
              </div>
                ))}
            </div>
        </div>

        {/* Current Exercise */}
        <div className={`w-full md:w-2/3 p-5 rounded-xl ${isDarkMode ? 'bg-gray-800/80 border border-gray-700' : 'bg-white shadow-lg border border-gray-100'}`}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-1">{currentExercise.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">{currentExercise.description || 'Perform this exercise with proper form'}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Target Muscles</span>
                <span className="font-medium capitalize">{Array.isArray(currentExercise.muscles) ? currentExercise.muscles.join(', ') : currentExercise.muscles || 'Multiple'}</span>
              </div>
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">Equipment</span>
                <span className="font-medium capitalize">{currentExercise.equipment || currentExercise.type || 'None'}</span>
              </div>
            </div>
          </div>
          
          {/* Sets */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Sets</h3>
            <div className="space-y-3">
              {sets.map((set, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg flex justify-between items-center transition-all duration-200
                    ${set.completed
                      ? (isDarkMode ? 'bg-green-900/30 border border-green-800' : 'bg-green-50 border border-green-200')
                      : (isDarkMode ? 'bg-gray-700/50 border border-gray-700' : 'bg-gray-100 border border-gray-200')
                    }`}
                >
                  <div>
                    <span className="font-medium text-sm">Set {index + 1}</span>
                    <div className="flex gap-4 mt-1">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">Reps</span>
                        <span className="font-medium">{set.reps}</span>
                      </div>
                      {set.duration && (
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 block">Duration</span>
                          <span className="font-medium">{set.duration}s</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleSetCompleted(index, !set.completed)}
                      className={`p-2 rounded-lg transition-all duration-200
                        ${set.completed
                          ? (isDarkMode ? 'bg-green-800 text-green-200 hover:bg-green-700' : 'bg-green-500 text-white hover:bg-green-600')
                          : (isDarkMode ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' : 'bg-gray-200 text-gray-600 hover:bg-gray-300')
                        }`}
                    >
                      {set.completed ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Rest timer overlay — WebSocket backed */}
          {(isRunning || remaining === 0) && (
            <RestTimerOverlay
              remaining={remaining ?? 0}
              total={total ?? 90}
              isDarkMode={isDarkMode}
              onSkip={cancelTimer}
            />
          )}
        </div>
      </div>

      {/* Navigation and Complete Buttons */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-3">
          <Button
            onClick={handlePrevExercise}
            disabled={currentExerciseIndex === 0}
            variant="outline"
            size="lg"
          >
            Previous
          </Button>
          
          {!isLastExercise && (
            <Button
              onClick={handleNextExercise}
              variant="primary"
              size="lg"
            >
              Next
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSkipWorkout}
            loading={isSkipping}
            variant="outline"
            size="lg"
          >
            Skip Workout
          </Button>

          <Button
            onClick={handleCompleteWorkout}
            loading={isCompleting}
            variant="success"
            size="lg"
          >
            Complete Workout
          </Button>
        </div>
            </div>
        </SectionWrapper>
  );
};

export default Workout;

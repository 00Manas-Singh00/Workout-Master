import { createContext, useState, useEffect, useContext } from 'react';
import { createWorkout, getWorkout, getWorkouts, completeWorkout, deleteWorkout, skipWorkoutSession } from '../utils/api';
import { useUser } from '@clerk/clerk-react';
import { generateWorkout } from '../utils/functions';

const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
  const { isSignedIn, isLoaded } = useUser();
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Workout creation settings
  const [poison, setPoison] = useState('individual');
  const [muscles, setMuscles] = useState([]);
  const [goal, setGoal] = useState('strength_power');

  // Fetch workout history when authenticated
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      loadWorkoutHistory();
    } else if (isLoaded && !isSignedIn) {
      // Clear workout history when signed out
      setWorkoutHistory([]);
    }
  }, [isSignedIn, isLoaded]);

  // Load workout history from API
  const loadWorkoutHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWorkouts();
      if (response.success) {
        setWorkoutHistory(response.data);
      } else {
        setError(response.message || 'Failed to load workout history');
      }
    } catch (error) {
      setError(error.message || 'Failed to load workout history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Generate a new workout (locally)
  const generateNewWorkout = (overrides = {}) => {
    try {
      setError(null);
      setLoading(true);

      const selectedWorkoutType = overrides.workoutType || poison;
      const selectedMuscles = overrides.muscleGroups || muscles;
      const selectedGoal = overrides.goal || goal;
      
      console.log("Generating workout with:", { selectedWorkoutType, selectedMuscles, selectedGoal });
      
      // Ensure muscles array exists and has values
      if (!selectedMuscles || !Array.isArray(selectedMuscles) || selectedMuscles.length === 0) {
          console.error("No muscles selected for workout generation");
          setError("Please select at least one muscle group");
          setLoading(false);
          return false;
      }
      
      // Map goal to the expected format if needed
      const mappedGoal = selectedGoal.includes('_') ? selectedGoal : 
                        (selectedGoal === 'strength' ? 'strength_power' : 
                        selectedGoal === 'hypertrophy' ? 'growth_hypertrophy' : 
                        selectedGoal === 'endurance' ? 'cardiovascular_endurance' : selectedGoal);
      
      // Generate the workout
      const newWorkout = generateWorkout({
          muscleGroups: selectedMuscles,
          workoutType: selectedWorkoutType,
          goal: mappedGoal
      });
      
      console.log("Generated workout:", newWorkout);
      
      if (!newWorkout) {
          setError("Failed to generate workout. Please try again.");
          setLoading(false);
          return false;
      }
      
      if (!newWorkout.exercises || newWorkout.exercises.length === 0) {
          console.error("No exercises found in generated workout");
          setError("No exercises found matching the selected muscle groups. Please try different selections.");
          setLoading(false);
          return false;
      }
      
      // Set the new workout in state
      setCurrentWorkout(newWorkout);
      setLoading(false);
      return true;
    } catch (error) {
      console.error("Error generating workout:", error);
      setError(error.message || "Failed to generate workout");
      setLoading(false);
      return false;
    }
  };

  // Load AI-generated workout from localStorage
  const loadAIGeneratedWorkout = () => {
    try {
      const aiWorkout = localStorage.getItem('aiGeneratedWorkout');
      console.log('loadAIGeneratedWorkout called, aiWorkout:', aiWorkout);
      if (aiWorkout) {
        const parsed = JSON.parse(aiWorkout);
        console.log('Parsed AI workout:', parsed);
        console.log('Parsed exercises:', parsed.exercises);
        
        // Check if exercises exist
        if (!parsed.exercises || parsed.exercises.length === 0) {
          console.error('No exercises found in AI workout');
          return false;
        }
        
        // Convert AI format to workout format
        const workout = {
          _id: 'ai-' + Date.now(),
          name: 'AI Generated Workout',
          type: 'individual',
          goal: 'strength_power',
          muscles: parsed.exercises?.flatMap(e => e.muscles || []) || [],
          exercises: parsed.exercises?.map(exercise => ({
            name: exercise.name,
            muscles: exercise.muscles || [],
            type: exercise.type || 'compound',
            sets: Array.from({ length: exercise.sets || 3 }).map(() => ({
              reps: Math.min(parseInt(exercise.reps) || 10, 50),
              completed: false
            })),
            rest: exercise.rest || 60,
            description: exercise.description || ''
          })) || []
        };
        console.log('Converted workout:', workout);
        console.log('Converted exercises:', workout.exercises);
        if (workout.exercises.length === 0) {
          console.error('No exercises in converted workout');
          return false;
        }
        
        // Set workout immediately and synchronously
        setCurrentWorkout(workout);
        localStorage.removeItem('aiGeneratedWorkout');
        
        // Force a re-render by checking the state was set
        setTimeout(() => {
          console.log('Workout should now be set in context');
        }, 0);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading AI workout:', error);
      setError('Failed to load AI-generated workout');
      return false;
    }
  };

  // Save workout to database
  const saveWorkout = async () => {
    if (!currentWorkout) {
      setError('No workout to save');
      return null;
    }

    // Always save AI workouts to get a real database ID
    if (currentWorkout._id && !currentWorkout._id.startsWith('ai-')) {
      return { _id: currentWorkout._id };
    }

    try {
      setLoading(true);
      setError(null);
      const workoutData = {
        name: currentWorkout.name || `${goal} ${poison} Workout`,
        type: currentWorkout.type || poison,
        goal: currentWorkout.goal || goal,
        muscles: currentWorkout.muscles || muscles || [],
        exercises: currentWorkout.exercises || [],
        completed: false,
        date: currentWorkout.date || new Date().toISOString()
      };
      
      console.log("Saving workout:", workoutData);
      const response = await createWorkout(workoutData);
      
      if (response.success) {
        const savedId = response.data._id;
        let hydratedWorkout = null;
        try {
          const fullWorkoutResponse = await getWorkout(savedId);
          if (fullWorkoutResponse.success) {
            hydratedWorkout = fullWorkoutResponse.data;
          }
        } catch (hydrateError) {
          console.warn('Failed to hydrate saved workout details:', hydrateError);
        }

        // Update the workout history
        await loadWorkoutHistory();
        
        // Add the workout ID to the current workout
        if (hydratedWorkout) {
          setCurrentWorkout(hydratedWorkout);
          return hydratedWorkout;
        }

        setCurrentWorkout((prev) => ({
          ...prev,
          _id: savedId
        }));
        return response.data;
      } else {
        setError(response.message || 'Failed to save workout');
        return null;
      }
    } catch (error) {
      setError(error.message || 'Failed to save workout');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mark workout as completed
  const markWorkoutComplete = async (workoutId) => {
    if (!workoutId) {
      setError('No workout ID provided');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await completeWorkout(workoutId);
      
      if (response.success) {
        // Update workout history
        await loadWorkoutHistory();
        setCurrentWorkout(null);
        return response;
      } else {
        setError(response.message || 'Failed to complete workout');
        return null;
      }
    } catch (error) {
      setError(error.message || 'Failed to complete workout');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const markWorkoutSkipped = async (workoutId, reason = '') => {
    if (!workoutId) {
      setError('No workout ID provided');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await skipWorkoutSession(workoutId, reason);

      if (response.success) {
        await loadWorkoutHistory();
        setCurrentWorkout(null);
        return response;
      }

      setError(response.message || 'Failed to skip workout');
      return null;
    } catch (error) {
      setError(error.message || 'Failed to skip workout');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a workout
  const removeWorkout = async (workoutId) => {
    if (!workoutId) {
      setError('No workout ID provided');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await deleteWorkout(workoutId);
      
      if (response.success) {
        setWorkoutHistory(workoutHistory.filter(workout => workout._id !== workoutId));
        return response;
      } else {
        setError(response.message || 'Failed to delete workout');
        return null;
      }
    } catch (error) {
      setError(error.message || 'Failed to delete workout');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Clear the current error message
  const clearError = () => setError(null);
  
  // Reset workout state (useful for starting fresh)
  const resetWorkout = () => {
    setCurrentWorkout(null);
    setError(null);
  };

  return (
    <WorkoutContext.Provider
      value={{
        currentWorkout,
        setCurrentWorkout,
        workoutHistory,
        loading,
        error,
        setError,
        poison,
        setPoison,
        muscles,
        setMuscles,
        goal,
        setGoal,
        generateNewWorkout,
        loadAIGeneratedWorkout,
        saveWorkout,
        markWorkoutComplete,
        markWorkoutSkipped,
        removeWorkout,
        clearError,
        resetWorkout
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
};

// Custom hook to use the workout context
export const useWorkout = () => useContext(WorkoutContext);

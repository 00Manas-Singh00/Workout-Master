import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

const genAI = env.geminiApiKey ? new GoogleGenerativeAI(env.geminiApiKey) : null;

/**
 * Generate a personalized workout recommendation using Gemini AI
 * @param {Object} userProfile - User's profile data (fitness level, goals, preferences)
 * @param {Array} workoutHistory - User's workout history
 * @param {String} planType - 'session' for single session, 'week' for weekly plan
 * @returns {Promise<Object>} - Generated workout plan
 */
export async function generateWorkoutRecommendation(userProfile, workoutHistory, planType = 'session') {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Analyze workout history for patterns
    const historyAnalysis = analyzeWorkoutHistory(workoutHistory);

    // Build the prompt
    const prompt = buildWorkoutPrompt(userProfile, historyAnalysis, planType);

    logger.info('Generating AI workout recommendation', { 
      userId: userProfile.userId,
      planType,
      fitnessLevel: userProfile.fitnessLevel
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the AI response into structured format
    const workoutPlan = parseWorkoutResponse(text, planType);

    logger.info('AI workout recommendation generated successfully', { 
      userId: userProfile.userId,
      planType,
      workoutCount: planType === 'week' ? workoutPlan.length : 1
    });

    return workoutPlan;
  } catch (error) {
    logger.error('Failed to generate AI workout recommendation', { 
      error: error.message,
      userId: userProfile.userId 
    });
    throw new Error(`AI recommendation failed: ${error.message}`);
  }
}

/**
 * Analyze workout history to extract patterns
 */
function analyzeWorkoutHistory(history) {
  if (!history || history.length === 0) {
    return {
      totalWorkouts: 0,
      muscleGroupFrequency: {},
      averageDuration: 45,
      completedWorkouts: 0,
      skippedWorkouts: 0,
      goals: [],
      recentMuscleGroups: []
    };
  }

  const muscleGroupFrequency = {};
  let totalDuration = 0;
  let completed = 0;
  let skipped = 0;
  const goals = new Set();
  const recentMuscleGroups = [];

  history.forEach((workout, index) => {
    // Count muscle groups
    if (workout.muscles && Array.isArray(workout.muscles)) {
      workout.muscles.forEach(muscle => {
        muscleGroupFrequency[muscle] = (muscleGroupFrequency[muscle] || 0) + 1;
      });
    }

    // Track goals
    if (workout.goal) {
      goals.add(workout.goal);
    }

    // Track completion status
    if (workout.status === 'completed' || workout.completed) {
      completed++;
    } else if (workout.status === 'skipped') {
      skipped++;
    }

    // Estimate duration (45 mins default)
    totalDuration += 45;

    // Get recent muscle groups (last 5 workouts)
    if (index < 5 && workout.muscles) {
      recentMuscleGroups.push(...(workout.muscles || []));
    }
  });

  return {
    totalWorkouts: history.length,
    muscleGroupFrequency,
    averageDuration: Math.round(totalDuration / history.length),
    completedWorkouts: completed,
    skippedWorkouts: skipped,
    goals: Array.from(goals),
    recentMuscleGroups: [...new Set(recentMuscleGroups)]
  };
}

/**
 * Build the prompt for Gemini AI
 */
function buildWorkoutPrompt(userProfile, historyAnalysis, planType) {
  const { fitnessLevel, fitnessGoals, preferences } = userProfile;
  const { muscleGroupFrequency, averageDuration, goals, recentMuscleGroups } = historyAnalysis;

  const muscleGroupString = Object.entries(muscleGroupFrequency)
    .map(([muscle, count]) => `${muscle}: ${count} times`)
    .join(', ');

  const goalsString = goals.length > 0 ? goals.join(', ') : 'General fitness';
  const recentMusclesString = recentMuscleGroups.length > 0 ? recentMuscleGroups.join(', ') : 'None';

  const basePrompt = `You are an expert fitness trainer. Create a ${planType === 'week' ? '7-day weekly workout plan' : 'single workout session'} for a user with the following profile:

**User Profile:**
- Fitness Level: ${fitnessLevel || 'Beginner'}
- Fitness Goals: ${fitnessGoals ? fitnessGoals.join(', ') : 'General fitness'}
- Preferred Workout Duration: ${averageDuration} minutes

**Workout History:**
- Total Workouts Completed: ${historyAnalysis.totalWorkouts}
- Muscle Group Frequency: ${muscleGroupString || 'No history'}
- Recent Muscle Groups Targeted: ${recentMusclesString}
- Goals from History: ${goalsString}
- Completion Rate: ${historyAnalysis.totalWorkouts > 0 ? Math.round((historyAnalysis.completedWorkouts / historyAnalysis.totalWorkouts) * 100) : 0}%

**Requirements:**
1. The workout should be ${planType === 'week' ? 'structured for 7 days with rest days included' : 'a single session focused on appropriate muscle groups'}
2. Include warm-up and cool-down exercises
3. Each exercise should have: name, target muscle groups, sets, reps (maximum 50), rest time, and brief description
4. Progressively overload based on fitness level
5. Balance muscle groups to avoid overtraining
6. Include variety to keep workouts engaging
7. Consider recent muscle groups to avoid overworking the same areas
8. IMPORTANT: Reps should be between 5-50 for all exercises

**Response Format:**
Respond ONLY with valid JSON in the following format (no markdown, no additional text):

${planType === 'week' ? `
{
  "plan": [
    {
      "day": 1,
      "focus": "e.g., Upper Body",
      "exercises": [
        {
          "name": "Exercise Name",
          "muscles": ["muscle1", "muscle2"],
          "type": "strength/cardio/flexibility",
          "sets": 3,
          "reps": "10-12",
          "rest": 60,
          "description": "Brief description of proper form"
        }
      ]
    }
  ]
}
` : `
{
  "session": {
    "focus": "e.g., Full Body",
    "exercises": [
      {
        "name": "Exercise Name",
        "muscles": ["muscle1", "muscle2"],
        "type": "strength/cardio/flexibility",
        "sets": 3,
        "reps": "10-12",
        "rest": 60,
        "description": "Brief description of proper form"
      }
    ]
  }
}
`}`;

  return basePrompt;
}

/**
 * Parse the AI response into structured format
 */
function parseWorkoutResponse(text, planType) {
  try {
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (planType === 'week') {
      return {
        type: 'weekly',
        plan: parsed.plan || []
      };
    } else {
      return {
        type: 'session',
        session: parsed.session || { focus: 'Full Body', exercises: [] }
      };
    }
  } catch (error) {
    logger.error('Failed to parse AI workout response', { error: error.message });
    throw new Error('Failed to parse workout recommendation');
  }
}

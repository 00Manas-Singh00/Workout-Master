import axios from 'axios';

const MOCK_MODE = false;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let authTokenGetter = async () => localStorage.getItem('clerk-token');

export const setAuthTokenGetter = (getter) => {
  authTokenGetter = typeof getter === 'function' ? getter : authTokenGetter;
};

const initializeMockData = () => {
  try {
    const savedData = localStorage.getItem('workout-master-mock-data');
    if (savedData) return JSON.parse(savedData);
  } catch (error) {
    console.error('Error loading mock data from localStorage:', error);
  }

  return {
    workouts: [],
    profile: {
      name: 'Demo User',
      email: 'demo@example.com',
      preferences: { darkMode: true, units: 'metric' },
    },
  };
};

const MOCK_DATA = initializeMockData();

const saveMockData = () => {
  try {
    localStorage.setItem('workout-master-mock-data', JSON.stringify(MOCK_DATA));
  } catch (error) {
    console.error('Error saving mock data to localStorage:', error);
  }
};

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await authTokenGetter();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const clerkUserId = localStorage.getItem('clerk-user-id');
      if (clerkUserId) {
        config.headers['x-clerk-user-id'] = clerkUserId;
      }

      return config;
    } catch (error) {
      console.error('Error setting auth token:', error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

export const syncAuthUser = async (payload) => {
  try {
    const response = await api.post('/auth/sync', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

export const getUserProfile = async () => {
  if (MOCK_MODE) return { success: true, data: MOCK_DATA.profile };

  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

export const updateUserProfile = async (userData) => {
  if (MOCK_MODE) {
    MOCK_DATA.profile = { ...MOCK_DATA.profile, ...userData };
    saveMockData();
    return { success: true, data: MOCK_DATA.profile };
  }

  try {
    const response = await api.patch('/auth/me', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

export const createWorkout = async (workoutData) => {
  if (MOCK_MODE) {
    const newWorkout = {
      _id: `mock-${Date.now()}`,
      ...workoutData,
      createdAt: new Date().toISOString(),
      completed: false,
    };
    MOCK_DATA.workouts.push(newWorkout);
    saveMockData();
    return { success: true, data: newWorkout };
  }

  try {
    const response = await api.post('/sessions', workoutData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

export const getWorkouts = async () => {
  if (MOCK_MODE) return { success: true, data: MOCK_DATA.workouts };

  try {
    const response = await api.get('/sessions');
    // Backend returns { success: true, data: { sessions: [...], pagination: {...} } }
    // Frontend expects { success: true, data: [...] }
    const responseData = response.data;
    return {
      success: responseData.success !== false,
      data: responseData.data?.sessions || []
    };
  } catch (error) {
    console.error('Get workouts error:', error);
    throw error.response?.data || { success: false, message: error.message };
  }
};

export const getWorkout = async (id) => {
  if (MOCK_MODE) {
    const workout = MOCK_DATA.workouts.find((w) => w._id === id);
    if (workout) return { success: true, data: workout };
    throw { success: false, message: 'Workout not found' };
  }

  try {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

export const completeWorkout = async (id) => {
  if (MOCK_MODE) {
    const workoutIndex = MOCK_DATA.workouts.findIndex((w) => w._id === id);
    if (workoutIndex !== -1) {
      MOCK_DATA.workouts[workoutIndex].completed = true;
      MOCK_DATA.workouts[workoutIndex].completedAt = new Date().toISOString();
      saveMockData();
      return { success: true, data: MOCK_DATA.workouts[workoutIndex] };
    }
    throw { success: false, message: 'Workout not found' };
  }

  try {
    const response = await api.post(`/sessions/${id}/complete`, {});
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

export const startWorkoutSession = async (id, readiness = {}) => {
  try {
    const response = await api.post(`/sessions/${id}/start`, { readiness });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

export const logWorkoutSet = async (id, payload) => {
  try {
    const response = await api.post(`/sessions/${id}/log-set`, payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

export const skipWorkoutSession = async (id, reason = '') => {
  try {
    const response = await api.post(`/sessions/${id}/skip`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

export const deleteWorkout = async (id) => {
  if (MOCK_MODE) {
    const workoutIndex = MOCK_DATA.workouts.findIndex((w) => w._id === id);
    if (workoutIndex !== -1) {
      MOCK_DATA.workouts.splice(workoutIndex, 1);
      saveMockData();
      return { success: true };
    }
    throw { success: false, message: 'Workout not found' };
  }

  try {
    const response = await api.delete(`/sessions/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

export const getAIRecommendation = async (planType, userProfile) => {
  try {
    const response = await api.post('/sessions/ai-recommendation', {
      planType,
      ...userProfile
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

export const getAnalyticsDashboard = async () => {
  try {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

export const sendChatMessage = async (message, history = []) => {
  try {
    const response = await api.post('/chat/message', { message, history });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: error.message };
  }
};

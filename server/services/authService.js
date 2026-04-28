import { NotFoundError, ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import userRepository from '../repositories/userRepository.js';

export const syncUser = async (clerkUserId, userData) => {
  const { email, name, profile, goals } = userData;

  if (!clerkUserId) {
    throw new ValidationError('Missing Clerk user ID');
  }

  const existingUser = await userRepository.findByClerkUserId(clerkUserId);
  
  if (existingUser) {
    // Update existing user
    if (email) existingUser.email = email;
    if (name) existingUser.name = name;
    if (profile) existingUser.profile = { ...(existingUser.profile?.toObject?.() || {}), ...profile };
    if (goals) existingUser.goals = goals;
    
    const updated = await existingUser.save();
    logger.info(`User synced: ${clerkUserId}`);
    return updated;
  }

  // Create new user
  const newUser = await userRepository.create({
    clerkUserId,
    email,
    name,
    profile,
    goals,
    stats: { workoutsCompleted: 0, adherenceLast28d: 0, currentStreakDays: 0, lastWorkoutAt: null },
  });

  logger.info(`User synced: ${clerkUserId}`);
  return newUser;
};

export const getUserByClerkId = async (clerkUserId) => {
  const user = await userRepository.findByClerkUserId(clerkUserId);
  if (!user) {
    throw new NotFoundError('User');
  }
  return user;
};

export const updateUser = async (userId, updateData) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('User');
  }

  const { name, profile, goals } = updateData;

  if (typeof name === 'string' && name.trim()) {
    user.name = name.trim();
  }

  if (profile && typeof profile === 'object') {
    user.profile = {
      ...(user.profile?.toObject?.() || user.profile || {}),
      ...profile,
    };
  }

  if (Array.isArray(goals)) {
    user.goals = goals;
  }

  const updated = await user.save();
  logger.info(`User updated: ${user.clerkUserId}`);
  return updated;
};

export const serializeUser = (user) => {
  if (!user) return null;

  return {
    id: String(user._id),
    clerkUserId: user.clerkUserId,
    email: user.email,
    name: user.name,
    profile: user.profile,
    goals: user.goals,
    stats: user.stats,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export class UserDTO {
  static toResponse(user) {
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
  }

  static toListResponse(users) {
    return users.map((user) => this.toResponse(user));
  }

  static toCreateRequest(data) {
    return {
      clerkUserId: data.clerkUserId,
      email: data.email?.toLowerCase(),
      name: data.name?.trim(),
      profile: data.profile,
      goals: data.goals,
    };
  }

  static toUpdateRequest(data) {
    const update = {};
    if (data.email) update.email = data.email.toLowerCase();
    if (data.name) update.name = data.name.trim();
    if (data.profile) update.profile = data.profile;
    if (data.goals) update.goals = data.goals;
    return update;
  }
}

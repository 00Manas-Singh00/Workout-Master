export class SessionDTO {
  static toResponse(session, exercises = []) {
    return {
      _id: String(session._id),
      name: session.name || '',
      type: session.type,
      goal: session.goal,
      muscles: session.muscles || [],
      date: session.plannedDate,
      status: session.status,
      completed: session.status === 'completed',
      exercises: exercises.map((e) => this.exerciseToResponse(e)),
    };
  }

  static exerciseToResponse(exercise) {
    return {
      sessionExerciseId: String(exercise._id),
      name: exercise.displayName,
      muscles: exercise.muscles || [],
      type: 'compound',
      sets: (exercise.performedSets || []).length
        ? exercise.performedSets.map((s) => ({ reps: s.reps, completed: true }))
        : Array.from({ length: exercise.prescription?.sets || 0 }).map(() => ({
            reps: exercise.prescription?.repMin || 0,
            completed: false,
          })),
      rest: exercise.prescription?.restSec || 90,
      description: '',
    };
  }

  static toListResponse(sessionsWithExercises) {
    return sessionsWithExercises.map(({ session, exercises }) =>
      this.toResponse(session, exercises)
    );
  }

  static toCreateRequest(data) {
    return {
      name: data.name?.trim() || '',
      type: data.type || 'custom',
      goal: data.goal || 'general_fitness',
      muscles: Array.isArray(data.muscles) ? data.muscles : [],
      plannedDate: data.plannedDate ? new Date(data.plannedDate) : new Date(),
      exercises: Array.isArray(data.exercises) ? data.exercises : [],
    };
  }

  static toDetailResponse(session, exercises = []) {
    return {
      id: String(session._id),
      status: session.status,
      plannedDate: session.plannedDate,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      readiness: session.readiness,
      exercises: exercises.map((e) => ({
        id: String(e._id),
        sessionExerciseId: String(e._id),
        exerciseKey: e.exerciseKey,
        displayName: e.displayName,
        order: e.order,
        prescription: e.prescription,
        performedSets: e.performedSets,
        isCompleted: e.isCompleted,
      })),
    };
  }

  static toPaginationResponse(sessions, pagination) {
    return {
      sessions: this.toListResponse(sessions),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
        hasNext: pagination.hasNext,
        hasPrev: pagination.hasPrev,
      },
    };
  }
}

import Program from '../models/programModel.js';
import { ok, fail } from '../utils/http.js';

export const createProgram = async (req, res) => {
  if (!req.user?._id) {
    return fail(res, 'USER_NOT_SYNCED', 'User must sync profile before creating programs', 409);
  }

  await Program.updateMany({ userId: req.user._id, isActive: true }, { $set: { isActive: false } });

  const program = await Program.create({
    userId: req.user._id,
    ...req.body,
    isActive: true,
  });

  return ok(
    res,
    {
      id: String(program._id),
      name: program.name,
      goal: program.goal,
      splitType: program.splitType,
      daysPerWeek: program.daysPerWeek,
      isActive: program.isActive,
    },
    201
  );
};

export const getActiveProgram = async (req, res) => {
  if (!req.user?._id) {
    return fail(res, 'USER_NOT_SYNCED', 'User must sync profile first', 409);
  }

  const program = await Program.findOne({ userId: req.user._id, isActive: true });

  if (!program) {
    return fail(res, 'PROGRAM_NOT_FOUND', 'No active program found', 404);
  }

  return ok(res, {
    id: String(program._id),
    name: program.name,
    goal: program.goal,
    splitType: program.splitType,
    currentWeek: program.currentWeek,
    daysPerWeek: program.daysPerWeek,
  });
};

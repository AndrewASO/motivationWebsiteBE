


import mongoose, { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface TaskDoc extends Document {
  id: string;
  description: string;
  completed: boolean;
  urgency: string;
  date: Date;
}

interface CompletionStatsDoc extends Document {
  date: Date;
  completionPercentage: number;
}

const taskSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4() },
  description: { type: String, required: true },
  completed: { type: Boolean, default: false },
  urgency: { type: String, required: true }, // Assuming you've added this based on your plan
  date: { type: Date, default: Date.now },
});

const Task = mongoose.model<TaskDoc>('Task', taskSchema);

const completionStatsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  completionPercentage: { type: Number, required: true },
});

const CompletionStats = mongoose.model<CompletionStatsDoc>('CompletionStats', completionStatsSchema);

/**
 * Calculates and returns the completion percentage for tasks with the specified urgency.
 * @param tasks The list of tasks to calculate completion percentage for.
 * @param urgency The urgency level ('yearly', 'monthly', 'weekly', 'daily') to filter tasks by.
 * @returns The completion percentage of tasks with the specified urgency.
 */
const calculateAndSaveCompletionPercentage = async (tasks: TaskDoc[], urgency: 'yearly' | 'monthly' | 'weekly' | 'daily'): Promise<number> => {
  // Filter tasks by the specified urgency
  const filteredTasks = tasks.filter(task => task.urgency === urgency);

  // Calculate the completion percentage for filtered tasks
  const completedTasks = filteredTasks.filter(task => task.completed).length;
  const completionPercentage = filteredTasks.length > 0 ? (completedTasks / filteredTasks.length) * 100 : 0;

  // For simplicity, return the calculated percentage directly
  return completionPercentage;
};

export { Task, CompletionStats, calculateAndSaveCompletionPercentage, TaskDoc, CompletionStatsDoc };

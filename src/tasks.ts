


import mongoose, { Document } from 'mongoose';

interface TaskDoc extends Document {
  description: string;
  completed: boolean;
  date: Date;
}

interface CompletionStatsDoc extends Document {
  date: Date;
  completionPercentage: number;
}

const taskSchema = new mongoose.Schema({
  description: { type: String, required: true },
  completed: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
});

const Task = mongoose.model<TaskDoc>('Task', taskSchema);

const completionStatsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  completionPercentage: { type: Number, required: true },
});

const CompletionStats = mongoose.model<CompletionStatsDoc>('CompletionStats', completionStatsSchema);

// Modify the function to accept TaskDoc[]
const calculateAndSaveCompletionPercentage = async (tasks: TaskDoc[]): Promise<number> => {
  const completedTasks = tasks.filter(task => task.completed).length;
  const completionPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  // For simplicity, return the calculated percentage directly
  // In real scenarios, you might want to save this value to a database or do further processing
  return completionPercentage;
};

export { Task, CompletionStats, calculateAndSaveCompletionPercentage, TaskDoc, CompletionStatsDoc };

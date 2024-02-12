/**
 * 
 * @Author Andrew Skevington-Olivera
 */



import mongoose, { Document } from 'mongoose';

interface TaskDoc extends Document {
  username: string;
  description: string;
  completed: boolean;
  date: Date;
}

interface CompletionStatsDoc extends Document {
  username: string;
  date: Date;
  completionPercentage: number;
}

const taskSchema = new mongoose.Schema({
  username: { type: String, required: true },
  description: { type: String, required: true },
  completed: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
});

const Task = mongoose.model<TaskDoc>('Task', taskSchema);

const completionStatsSchema = new mongoose.Schema({
  username: { type: String, required: true },
  date: { type: Date, required: true },
  completionPercentage: { type: Number, required: true },
});

const CompletionStats = mongoose.model<CompletionStatsDoc>('CompletionStats', completionStatsSchema);

const calculateAndSaveCompletionPercentage = async (username: string, date: Date): Promise<CompletionStatsDoc> => {
  const tasks = await Task.find({
    username,
    date: { $gte: new Date(date.setHours(0,0,0,0)), $lt: new Date(date.setHours(23,59,59,999)) }
  });

  const completedTasks = tasks.filter(task => task.completed).length;
  const completionPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const completionStats = await CompletionStats.findOneAndUpdate(
    { username, date: new Date(date.setHours(0,0,0,0)) },
    { username, date: new Date(date), completionPercentage },
    { new: true, upsert: true }
  );

  return completionStats;
};

export { Task, CompletionStats, calculateAndSaveCompletionPercentage, TaskDoc };

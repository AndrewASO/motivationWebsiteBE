"use strict";
/**
 * This module defines the schema for task and completion statistics documents using Mongoose, facilitating
 * interaction with MongoDB for task management and analysis. It includes models for both tasks and completion
 * statistics, each with their respective fields and types. The `calculateAndSaveCompletionPercentage` function
 * provides a means to calculate the completion percentage of tasks filtered by their urgency levels, demonstrating
 * an approach to data analysis within the application's task management context.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAndSaveCompletionPercentage = exports.CompletionStats = exports.Task = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const taskSchema = new mongoose_1.default.Schema({
    id: { type: String, default: () => (0, uuid_1.v4)() },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    urgency: { type: String, required: true }, // Assuming you've added this based on your plan
    date: { type: Date, default: Date.now },
});
const Task = mongoose_1.default.model('Task', taskSchema);
exports.Task = Task;
const completionStatsSchema = new mongoose_1.default.Schema({
    date: { type: Date, required: true },
    completionPercentage: { type: Number, required: true },
});
const CompletionStats = mongoose_1.default.model('CompletionStats', completionStatsSchema);
exports.CompletionStats = CompletionStats;
/**
 * Calculates and returns the completion percentage for tasks with the specified urgency.
 * @param tasks The list of tasks to calculate completion percentage for.
 * @param urgency The urgency level ('yearly', 'monthly', 'weekly', 'daily') to filter tasks by.
 * @returns The completion percentage of tasks with the specified urgency.
 */
const calculateAndSaveCompletionPercentage = (tasks, urgency) => __awaiter(void 0, void 0, void 0, function* () {
    // Filter tasks by the specified urgency
    const filteredTasks = tasks.filter(task => task.urgency === urgency);
    // Calculate the completion percentage for filtered tasks
    const completedTasks = filteredTasks.filter(task => task.completed).length;
    const completionPercentage = filteredTasks.length > 0 ? (completedTasks / filteredTasks.length) * 100 : 0;
    // For simplicity, return the calculated percentage directly
    return completionPercentage;
});
exports.calculateAndSaveCompletionPercentage = calculateAndSaveCompletionPercentage;

"use strict";
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
// Modify the function to accept TaskDoc[]
const calculateAndSaveCompletionPercentage = (tasks) => __awaiter(void 0, void 0, void 0, function* () {
    const completedTasks = tasks.filter(task => task.completed).length;
    const completionPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    // For simplicity, return the calculated percentage directly
    // In real scenarios, you might want to save this value to a database or do further processing
    return completionPercentage;
});
exports.calculateAndSaveCompletionPercentage = calculateAndSaveCompletionPercentage;

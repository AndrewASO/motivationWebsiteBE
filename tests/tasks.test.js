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
Object.defineProperty(exports, "__esModule", { value: true });
// Import the necessary modules and types
const tasks_1 = require("../src/tasks");
const tasks_2 = require("../src/tasks");
// Explicit mock setup for Task and CompletionStats models
jest.mock('../src/tasks', () => {
    const originalModule = jest.requireActual('../src/tasks'); // Load the actual module for non-mocked functions
    return Object.assign(Object.assign({}, originalModule), { Task: Object.assign(Object.assign({}, originalModule.Task), { create: jest.fn(), find: jest.fn() }), CompletionStats: Object.assign(Object.assign({}, originalModule.CompletionStats), { findOneAndUpdate: jest.fn() }) });
});
// Cast mocked functions to jest.Mock for TypeScript
const mockTaskCreate = tasks_2.Task.create;
const mockTaskFind = tasks_2.Task.find;
const mockCompletionStatsFindOneAndUpdate = tasks_2.CompletionStats.findOneAndUpdate;
describe('Task Management Tests', () => {
    beforeEach(() => {
        // Reset mocks before each test
        mockTaskCreate.mockClear();
        mockTaskFind.mockClear();
        mockCompletionStatsFindOneAndUpdate.mockClear();
    });
    it('successfully creates a new task', () => __awaiter(void 0, void 0, void 0, function* () {
        // Adjusted taskData to remove username
        const taskData = { description: 'Learn Jest', completed: false };
        mockTaskCreate.mockResolvedValue(taskData);
        const createdTask = yield tasks_2.Task.create(taskData);
        expect(mockTaskCreate).toHaveBeenCalledWith(taskData);
        expect(createdTask).toEqual(taskData);
    }));
    it('adds multiple tasks to an array', () => __awaiter(void 0, void 0, void 0, function* () {
        // Adjusted tasksData to remove username
        const tasksData = [
            { description: 'Task 1', completed: true },
            { description: 'Task 2', completed: false },
        ];
        // Mock Task.create to sequentially return each task
        mockTaskCreate.mockResolvedValueOnce(tasksData[0]).mockResolvedValueOnce(tasksData[1]);
        // Simulate adding tasks
        const addedTasks = yield Promise.all(tasksData.map(task => tasks_2.Task.create(task)));
        // Verify that each task was added
        expect(mockTaskCreate).toHaveBeenCalledTimes(tasksData.length);
        tasksData.forEach((task, index) => {
            expect(addedTasks[index]).toEqual(task);
        });
    }));
    it('calculates completion percentage correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        // Adjusted tasks: TaskDoc[] to remove username
        const tasks = [
            { completed: true, description: 'Task 1', date: new Date() },
            { completed: false, description: 'Task 2', date: new Date() },
        ];
        // Calculate completion percentage
        const completionPercentage = yield (0, tasks_1.calculateAndSaveCompletionPercentage)(tasks);
        // Assertions
        expect(completionPercentage).toBe(50); // Assuming one out of two tasks is completed
    }));
});

// Import the necessary modules and types
import { calculateAndSaveCompletionPercentage } from '../src/tasks';
import { Task, CompletionStats, TaskDoc } from '../src/tasks';

// Explicit mock setup for Task and CompletionStats models
jest.mock('../src/tasks', () => {
  const originalModule = jest.requireActual('../src/tasks'); // Load the actual module for non-mocked functions
  return {
    ...originalModule, // Use actual implementations from the module
    Task: {
      ...originalModule.Task,
      create: jest.fn(),
      find: jest.fn(),
    },
    CompletionStats: {
      ...originalModule.CompletionStats,
      findOneAndUpdate: jest.fn(),
    },
  };
});

// Cast mocked functions to jest.Mock for TypeScript
const mockTaskCreate = Task.create as jest.Mock;
const mockTaskFind = Task.find as jest.Mock;
const mockCompletionStatsFindOneAndUpdate = CompletionStats.findOneAndUpdate as jest.Mock;

describe('Task Management Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockTaskCreate.mockClear();
    mockTaskFind.mockClear();
    mockCompletionStatsFindOneAndUpdate.mockClear();
  });

  it('successfully creates a new task', async () => {
    // Adjusted taskData to remove username
    const taskData = { description: 'Learn Jest', completed: false };
    mockTaskCreate.mockResolvedValue(taskData);

    const createdTask = await Task.create(taskData);

    expect(mockTaskCreate).toHaveBeenCalledWith(taskData);
    expect(createdTask).toEqual(taskData);
  });

  it('adds multiple tasks to an array', async () => {
    // Adjusted tasksData to remove username
    const tasksData = [
      { description: 'Task 1', completed: true },
      { description: 'Task 2', completed: false },
    ];

    // Mock Task.create to sequentially return each task
    mockTaskCreate.mockResolvedValueOnce(tasksData[0]).mockResolvedValueOnce(tasksData[1]);

    // Simulate adding tasks
    const addedTasks = await Promise.all(tasksData.map(task => Task.create(task)));

    // Verify that each task was added
    expect(mockTaskCreate).toHaveBeenCalledTimes(tasksData.length);
    tasksData.forEach((task, index) => {
      expect(addedTasks[index]).toEqual(task);
    });
  });

  it('calculates completion percentage correctly', async () => {
    // Adjusted tasks: TaskDoc[] to remove username
    const tasks: TaskDoc[] = [
      { completed: true, description: 'Task 1', date: new Date() } as TaskDoc,
      { completed: false, description: 'Task 2', date: new Date() } as TaskDoc,
    ];

    // Calculate completion percentage
    const completionPercentage = await calculateAndSaveCompletionPercentage(tasks);

    // Assertions
    expect(completionPercentage).toBe(50); // Assuming one out of two tasks is completed
  });
});

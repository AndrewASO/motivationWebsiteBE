import { Profile } from '../src/Profile';
import { Task, TaskDoc } from '../src/tasks';
import dotenv from 'dotenv';
import { MongoDB } from '../src/mongoDB';
import { ProfileManagement } from '../src/ProfilesManagement';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables for testing
dotenv.config();

describe('Task Management', () => {
  let profile: Profile;
  let profileManagement: ProfileManagement;

  beforeAll(async () => {
    const dbURL: string = process.env.mongoDB_URL as string;
    const db = new MongoDB(dbURL);
    profileManagement = new ProfileManagement(db, true);
    await profileManagement.initialize();

    profile = await profileManagement.getProfileOrThrow("testing1");
  });

  it('can add tasks to a profile', async () => {
    // Add 'urgency' parameter
    await profile.addTask("Test Task 1", 'daily');
    await profile.addTask("Test Task 4", 'weekly');

    const tasks = profile.getProfileTasks();

    expect(tasks.length).toBe(2);
    expect(tasks[0].description).toBe("Test Task 1");
    expect(tasks[1].description).toBe("Test Task 4");

    await profile.resetTasks();
  });

  it('can complete a task', async () => {
    // Assuming addTask now returns the new task
    const newTask1 = await profile.addTask("Complete Me", 'monthly');
    const taskId = newTask1.id; // Capture the ID of the newly added task

    // Use toggleTaskCompletion or the correct method to mark the task as completed
    await profile.toggleTaskCompletion(taskId);

    const tasks = profile.getProfileTasks();
    const completedTask = tasks.find(task => task.id === taskId);

    expect(completedTask).toBeDefined();
    expect(completedTask?.completed).toBe(true);

    await profile.resetTasks();
  });

  it('calculates completion percentage correctly', async () => {
    await profile.resetTasks();

    // Add 'urgency' parameter
    const task1 = await profile.addTask("Task 1", 'daily');
    await profile.addTask("Task 2", 'yearly');
    await profile.toggleTaskCompletion(task1.id);

    const completionPercentage = await profile.calculateAndSaveCompletionPercentage();

    expect(completionPercentage).toBe(50);

    await profile.resetTasks();
  });

  it('Clears the tasks', async () => {
    await profile.resetTasks();
  });

  // Continue with other tests...
});

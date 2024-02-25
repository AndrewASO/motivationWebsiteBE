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
    await profile.addTask("Test Task 1");
    await profile.addTask("Test Task 4");

    const tasks = profile.getProfileTasks();

    expect(tasks.length).toBe(2);
    expect(tasks[0].description).toBe("Test Task 1");
    expect(tasks[1].description).toBe("Test Task 4");

    await profile.resetTasks();
  });

  it('can complete a task', async () => {
    const newTask1 = await profile.addTask("Complete Me"); // Assuming addTask now returns the new task
    const taskId = newTask1.id; // Capture the ID of the newly added task

    await profile.completeTask(taskId); // Use the ID to complete the task

    const tasks = profile.getProfileTasks();
    const completedTask = tasks.find(task => task.id === taskId); // Find the task by ID

    expect(completedTask).toBeDefined();
    expect(completedTask?.completed).toBe(true);

    await profile.resetTasks(); // Reset/clear tasks after the test
  });


  it('calculates completion percentage correctly', async () => {
    await profile.resetTasks();

    const task1 = await profile.addTask("Task 1");
    await profile.addTask("Task 2"); // No need to capture this task's ID if not using it
    await profile.completeTask(task1.id); // Use the ID to complete the first task

    const completionPercentage = await profile.calculateAndSaveCompletionPercentage();

    expect(completionPercentage).toBe(50); // Assuming 1 out of 2 tasks is completed

    await profile.resetTasks(); // Clean up by resetting tasks after the test
  });


  it('Clears the tasks', async () => {
    await profile.resetTasks();
  });

  // Add more test cases as needed...
});

import { Profile } from '../src/Profile';
import { TaskDoc } from '../src/tasks';
import dotenv from 'dotenv';
import { MongoDB } from '../src/mongoDB';
import { ProfileManagement } from '../src/ProfilesManagement';

// Load environment variables for testing
dotenv.config();

describe('Task Management', () => {
  let profile: Profile;

  beforeAll( async () => {
    // Mock the MongoDB connection (assuming MongoDB is used within Profile)
    const dbURL: string = process.env.mongoDB_URL as string;
    const db = new MongoDB(dbURL);
    const profileManagement = new ProfileManagement(db, true);
    await profileManagement.initialize();

    // Create a new profile instance directly instead of accessing through ProfileManagement for simplicity
    // Adjust the constructor parameters as per your Profile class definition

    // Usage
    try {
      const tempProfile = await profileManagement.getProfileOrThrow("testing1");
      profile = tempProfile;
    } catch (error) {
      console.error(error);
      // Handle the error, e.g., return an error response in an API call
    }

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
    // Assuming addTask and completeTask modify the same tasks array in the profile
    await profile.addTask("Complete Me");
    await profile.completeTask("Complete Me");

    const tasks = profile.getProfileTasks();
    const completedTask = tasks.find(task => task.description === "Complete Me");

    expect(completedTask).toBeDefined();
    expect(completedTask?.completed).toBe(true);

    await profile.resetTasks();
  });

  it('calculates completion percentage correctly', async () => {
    // Clear existing tasks for a clean test environment
    // Assuming a method to clear or reset tasks, if not, adjust accordingly
    profile.resetTasks(); // Adjust this line if you have a different method to clear tasks

    // Add some tasks
    await profile.addTask("Task 1");
    await profile.addTask("Task 2");
    await profile.completeTask("Task 1"); // Complete one of the tasks

    // Calculate completion percentage
    const completionPercentage = await profile.calculateAndSaveCompletionPercentage();

    // Assertions
    expect(completionPercentage).toBe(50); // Assuming one out of two tasks is completed

    // Assuming calculateAndSaveCompletionPercentageForDate logs or sets the calculated value
    // Adjust this test to verify the completion percentage as per your implementation
    // This might involve checking a logged value, a property on the profile, etc.
    // Example (adjust based on your actual implementation):
    // expect(profile.getLastCalculatedCompletionPercentage()).toBe(50);

    //console.log( profile.getProfileTasks() );
    await profile.resetTasks(); // Adjust this line if you have a different method to clear tasks
    //console.log("Test");
    //console.log( profile.getProfileTasks() );

  });

  it('Clears the tasks', async() => {
    await profile.resetTasks();
  });

  // Add more test cases as needed...
});

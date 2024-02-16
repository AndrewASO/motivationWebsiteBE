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
const dotenv_1 = __importDefault(require("dotenv"));
const mongoDB_1 = require("../src/mongoDB");
const ProfilesManagement_1 = require("../src/ProfilesManagement");
// Load environment variables for testing
dotenv_1.default.config();
describe('Task Management', () => {
    let profile;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Mock the MongoDB connection (assuming MongoDB is used within Profile)
        const dbURL = process.env.mongoDB_URL;
        const db = new mongoDB_1.MongoDB(dbURL);
        const profileManagement = new ProfilesManagement_1.ProfileManagement(db, "test");
        yield profileManagement.initialize();
        // Create a new profile instance directly instead of accessing through ProfileManagement for simplicity
        // Adjust the constructor parameters as per your Profile class definition
        const tempProfile = yield profileManagement.accessUser("testing1");
        profile = tempProfile;
    }));
    it('can add tasks to a profile', () => __awaiter(void 0, void 0, void 0, function* () {
        yield profile.addTask("Test Task 1");
        yield profile.addTask("Test Task 4");
        const tasks = profile.getProfileTasks();
        expect(tasks.length).toBe(2);
        expect(tasks[0].description).toBe("Test Task 1");
        expect(tasks[1].description).toBe("Test Task 4");
        yield profile.resetTasks();
    }));
    it('can complete a task', () => __awaiter(void 0, void 0, void 0, function* () {
        // Assuming addTask and completeTask modify the same tasks array in the profile
        yield profile.addTask("Complete Me");
        yield profile.completeTask("Complete Me");
        const tasks = profile.getProfileTasks();
        const completedTask = tasks.find(task => task.description === "Complete Me");
        expect(completedTask).toBeDefined();
        expect(completedTask === null || completedTask === void 0 ? void 0 : completedTask.completed).toBe(true);
        yield profile.resetTasks();
    }));
    it('calculates completion percentage correctly', () => __awaiter(void 0, void 0, void 0, function* () {
        // Clear existing tasks for a clean test environment
        // Assuming a method to clear or reset tasks, if not, adjust accordingly
        profile.resetTasks(); // Adjust this line if you have a different method to clear tasks
        // Add some tasks
        yield profile.addTask("Task 1");
        yield profile.addTask("Task 2");
        yield profile.completeTask("Task 1"); // Complete one of the tasks
        // Calculate completion percentage
        const completionPercentage = yield profile.calculateAndSaveCompletionPercentage();
        // Assertions
        expect(completionPercentage).toBe(50); // Assuming one out of two tasks is completed
        // Assuming calculateAndSaveCompletionPercentageForDate logs or sets the calculated value
        // Adjust this test to verify the completion percentage as per your implementation
        // This might involve checking a logged value, a property on the profile, etc.
        // Example (adjust based on your actual implementation):
        // expect(profile.getLastCalculatedCompletionPercentage()).toBe(50);
        //console.log( profile.getProfileTasks() );
        yield profile.resetTasks(); // Adjust this line if you have a different method to clear tasks
        //console.log("Test");
        //console.log( profile.getProfileTasks() );
    }));
    it('Clears the tasks', () => __awaiter(void 0, void 0, void 0, function* () {
        yield profile.resetTasks();
    }));
    // Add more test cases as needed...
});

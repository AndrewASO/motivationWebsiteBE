"use strict";
/**
 * Profile management class for handling user profiles, including sign up, login, task management, and profile information updates.
 * Utilizes MongoDB for storage, bcrypt for password hashing, and supports task operations such as adding, deleting, and updating tasks.
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profile = void 0;
const tasks_1 = require("./tasks");
const uuid_1 = require("uuid");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
class Profile {
    constructor(...arr) {
        this.tasks = [];
        if (arr.length == 4) {
            this.displayName = arr[0];
            this.username = arr[1];
            this.password = arr[2];
            this.db = arr[3];
            this.saveToDB();
        }
        else {
            this.username = arr[0];
            this.password = arr[1];
            this.db = arr[2];
            this.getUserDBInfo();
        }
    }
    /**
     * Saves the profile to the database. Used during sign-up to create a new profile document.
     */
    saveToDB() {
        return __awaiter(this, void 0, void 0, function* () {
            let collection = this.db.returnCollection("ProfilesDB", "Profiles");
            collection.insertOne({ "Username": this.username, "Password": this.password, "DisplayName": this.displayName, "Tasks": this.tasks });
        });
    }
    /**
     * Fetches and sets the profile data from the database based on the username.
     */
    getUserDBInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            let collection = this.db.returnCollection("ProfilesDB", "Profiles");
            const doc = yield collection.findOne({ Username: this.username });
            this.displayName = doc.DisplayName;
            this.tasks = doc.Tasks;
        });
    }
    /**
     * Updates profile information including display name, username, and password.
     * @param displayName New display name.
     * @param username New username.
     * @param password New password.
     */
    editInformation(displayName, username, password) {
        this.displayName = displayName;
        this.username = username;
        this.password = password;
        this.updateDB();
    }
    /**
     * Updates the profile document in the database to reflect changes made to the profile.
     */
    updateDB() {
        this.db.updateDB("ProfilesDB", "Profiles", this.username, "DisplayName", this.displayName);
        this.db.updateDB("ProfilesDB", "Profiles", this.username, "Password", this.password);
        this.db.updateDB("ProfilesDB", "Profiles", this.username, "Tasks", this.tasks);
        //console.log( this.tasks );
    }
    /**
     * Allows for the modification of the db variable. This was done to circumvent the Profile Obj attempting to convert
     * into a JSON Obj, and it would lead it to being an open circular obj thus not allowing for JSON.stringify() to work.
     * Basically setting this null, prevents this specific variable from keeping the Profile Obj as a open circular obj.
     * @param mongo
     */
    setMongoDB(mongo) {
        this.db = mongo;
    }
    /**
     * Custom toJSON method to exclude the MongoDB instance from serialization, preventing circular reference issues.
     */
    toJSON() {
        const _a = this, { db } = _a, serializableProps = __rest(_a, ["db"]);
        return serializableProps;
    }
    /**
     * Adds a new task to the profile with unique ID, description, and urgency, then updates the database.
     * @param description Description of the task.
     * @param urgency Urgency of the task (yearly, monthly, weekly, daily).
     * @returns The newly created task document.
     */
    addTask(description, urgency) {
        return __awaiter(this, void 0, void 0, function* () {
            const newTask = new tasks_1.Task({
                id: (0, uuid_1.v4)(), // Generate a unique ID for the new task
                description: description,
                completed: false,
                urgency: urgency, // Default urgency, adjust as needed
                date: new Date(),
            });
            this.tasks.push(newTask); // Add the new task to the local tasks array
            yield this.updateDB(); // Update the profile document in MongoDB
            return newTask; // Return the new task, including its ID
        });
    }
    /**
     * Deletes a task from the profile using its unique ID and updates the database.
     * @param taskId ID of the task to be deleted.
     */
    deleteTask(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            yield this.updateDB(); // Update the profile document in MongoDB
        });
    }
    /**
     * Toggles the completion status of a specified task by its unique ID and updates the database.
     * @param taskId ID of the task to toggle completion status.
     */
    toggleTaskCompletion(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            const task = this.tasks.find(task => task.id === taskId);
            if (task) {
                task.completed = !task.completed; // Toggle the completion status
                //task.completed = false;
                yield this.updateDB();
            }
        });
    }
    /**
     * Updates the urgency level of a specified task by its unique ID and updates the database.
     * @param taskId ID of the task to update.
     * @param newUrgency New urgency level for the task.
     */
    updateTaskUrgency(taskId, newUrgency) {
        return __awaiter(this, void 0, void 0, function* () {
            const task = this.tasks.find(task => task.id === taskId);
            if (task) {
                task.urgency = newUrgency; // Update the task's urgency
                yield this.updateDB(); // Save the updated tasks array to the database
            }
        });
    }
    /**
     * Calculates and saves the completion percentage of tasks based on their urgency.
     * @param urgency Urgency level to filter tasks for calculation.
     * @returns The calculated completion percentage.
     */
    calculateAndSaveCompletionPercentage(urgency) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, tasks_1.calculateAndSaveCompletionPercentage)(this.tasks, urgency);
        });
    }
    /**
     * Retrieves the list of tasks associated with the profile.
     * @returns Array of task documents.
     */
    getProfileTasks() {
        return this.tasks;
    }
    /**
     * Resets the tasks for the profile and updates the database.
     */
    resetTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            this.tasks = new Array();
            this.updateDB();
        });
    }
    /**
     * This returns the displayName variable
     * @returns
     */
    returnDisplayName() {
        return this.displayName;
    }
    /**
     * This returns the username variable
     * @returns
     */
    returnUsername() {
        return this.username;
    }
    /**
     * This returns the password variable
     * @returns
     */
    returnPassword() {
        return this.password;
    }
}
exports.Profile = Profile;

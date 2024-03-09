/**
 * Profile management class for handling user profiles, including sign up, login, task management, and profile information updates.
 * Utilizes MongoDB for storage, bcrypt for password hashing, and supports task operations such as adding, deleting, and updating tasks.
 */


import { MongoDB } from "./mongoDB";
import { Task, CompletionStats, calculateAndSaveCompletionPercentage, TaskDoc } from './tasks';
import { v4 as uuidv4 } from 'uuid';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

export class Profile {

    //These are all the variables that're in profile and I should probably include some encryption / tokenization to make this more secure
    private displayName;
    private username;
    private password;
    private tasks: TaskDoc[] = [];
    private db : MongoDB;

    /**
     * Overloaded constructor to support both sign-up (with display name) and login (without display name).
     * @param args Array containing displayName, username, password, and db for sign-up, or username, password, and db for login.
     */
    public constructor(displayName : string, username : string, password : string, db : MongoDB); //Constructor for signing up
    public constructor(username : string, password : string, db : MongoDB); //Constructor for logging in

    constructor(...arr: any[] ) {
        if(arr.length == 4) {
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
    async saveToDB() {
        let collection = this.db.returnCollection("ProfilesDB", "Profiles");
        collection.insertOne( {"Username" : this.username, "Password" : this.password, "DisplayName" : this.displayName, "Tasks" : this.tasks} )
    }

    /**
     * Fetches and sets the profile data from the database based on the username.
     */
    public async getUserDBInfo() {
        let collection = this.db.returnCollection("ProfilesDB", "Profiles");
        const doc = await collection.findOne( {Username : this.username} );
        
        this.displayName = doc.DisplayName;
        this.tasks = doc.Tasks;
    }

    /**
     * Updates profile information including display name, username, and password.
     * @param displayName New display name.
     * @param username New username.
     * @param password New password.
     */
    public editInformation(displayName : string, username : string, password : string) {
        this.displayName = displayName;
        this.username = username;
        this.password = password;

        this.updateDB();
    }

    /**
     * Updates the profile document in the database to reflect changes made to the profile.
     */
    public updateDB() {
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
    public setMongoDB(mongo : MongoDB ) {
        this.db = mongo;
    }

    /**
     * Custom toJSON method to exclude the MongoDB instance from serialization, preventing circular reference issues.
     */
    toJSON() {
        const { db, ...serializableProps } = this;
        return serializableProps;
    }


    /**
     * Adds a new task to the profile with unique ID, description, and urgency, then updates the database.
     * @param description Description of the task.
     * @param urgency Urgency of the task (yearly, monthly, weekly, daily).
     * @returns The newly created task document.
     */
    async addTask(description: string, urgency: 'yearly' | 'monthly' | 'weekly' | 'daily'): Promise<TaskDoc> {
        const newTask: TaskDoc = new Task({
            id: uuidv4(), // Generate a unique ID for the new task
            description: description,
            completed: false,
            urgency: urgency, // Default urgency, adjust as needed
            date: new Date(),
        });
        this.tasks.push(newTask); // Add the new task to the local tasks array
        await this.updateDB(); // Update the profile document in MongoDB
        return newTask; // Return the new task, including its ID
    }

    /**
     * Deletes a task from the profile using its unique ID and updates the database.
     * @param taskId ID of the task to be deleted.
     */
    async deleteTask(taskId: string): Promise<void> {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        await this.updateDB(); // Update the profile document in MongoDB
    }

    /**
     * Toggles the completion status of a specified task by its unique ID and updates the database.
     * @param taskId ID of the task to toggle completion status.
     */
    async toggleTaskCompletion(taskId: string) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed; // Toggle the completion status
            //task.completed = false;
            await this.updateDB();
        }
    }



    /**
     * Updates the urgency level of a specified task by its unique ID and updates the database.
     * @param taskId ID of the task to update.
     * @param newUrgency New urgency level for the task.
     */
    async updateTaskUrgency(taskId: string, newUrgency: 'yearly' | 'monthly' | 'weekly' | 'daily') {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.urgency = newUrgency; // Update the task's urgency
            await this.updateDB(); // Save the updated tasks array to the database
        }
    }


    /**
     * Calculates and saves the completion percentage of tasks based on their urgency.
     * @param urgency Urgency level to filter tasks for calculation.
     * @returns The calculated completion percentage.
     */
    async calculateAndSaveCompletionPercentage(urgency: 'yearly' | 'monthly' | 'weekly' | 'daily'): Promise<number> {
        return await calculateAndSaveCompletionPercentage(this.tasks, urgency);
    }

    /**
     * Retrieves the list of tasks associated with the profile.
     * @returns Array of task documents.
     */
    public getProfileTasks(): TaskDoc[] {
        return this.tasks;
    }

    /**
     * Resets the tasks for the profile and updates the database.
     */
    public async resetTasks() {
        this.tasks = new Array();
        this.updateDB();
    }









    /**
     * This returns the displayName variable
     * @returns 
     */
    public returnDisplayName() {
        return this.displayName;
    }

    /**
     * This returns the username variable
     * @returns 
     */
    public returnUsername() {
        return this.username;
    }

    /**
     * This returns the password variable
     * @returns 
     */
    public returnPassword() {
        return this.password;
    }

    
}

/**
 * This stores and modifies all of the information that would belong in profile.
 * There are two constructors and ones for signing in and the other one is for logging in.
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
     * This saves a profile created with the signIn constructor to MongoDB as a document
     */
    async saveToDB() {
        let collection = this.db.returnCollection("ProfilesDB", "Profiles");
        collection.insertOne( {"Username" : this.username, "Password" : this.password, "DisplayName" : this.displayName, "Tasks" : this.tasks} )
    }

    /**
     * This returns all of the information from the Profile's document when gathering it from MongoDB
     * and sets the variable to their corresponding variable inside of this obj.
     */
    public async getUserDBInfo() {
        let collection = this.db.returnCollection("ProfilesDB", "Profiles");
        const doc = await collection.findOne( {Username : this.username} );
        
        this.displayName = doc.DisplayName;
        this.tasks = doc.Tasks;
    }

    /**
     * Edits all of the variables at once rather than doing them individually
     * @param displayName 
     * @param username 
     * @param password 
     */
    public editInformation(displayName : string, username : string, password : string) {
        this.displayName = displayName;
        this.username = username;
        this.password = password;

        this.updateDB();
    }

    /**
     * This updates the MongoDB document that's linked to the username of this profile obj
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
     * Prepares a safe, serializable version of the profile.
     */
    // Custom toJSON method to exclude non-serializable properties
    toJSON() {
        const { db, ...serializableProps } = this;
        return serializableProps;
    }


    // Updated to include unique ID generation for tasks and return the created task
    async addTask(description: string): Promise<TaskDoc> {
        const newTask: TaskDoc = new Task({
            id: uuidv4(), // Generate a unique ID for the new task
            description: description,
            completed: false,
            urgency: 'daily', // Default urgency, adjust as needed
            date: new Date(),
        });
        this.tasks.push(newTask); // Add the new task to the local tasks array
        await this.updateDB(); // Update the profile document in MongoDB
        return newTask; // Return the new task, including its ID
    }

    // Updated to use the task's unique ID for deletion
    async deleteTask(taskId: string): Promise<void> {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        await this.updateDB(); // Update the profile document in MongoDB
    }

    // Updated to use the task's unique ID for marking as complete
    async completeTask(taskId: string) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = true;
            await this.updateDB();
        }
    }

    // Function to update the urgency of an existing task
    async updateTaskUrgency(taskId: string, newUrgency: 'yearly' | 'monthly' | 'weekly' | 'daily') {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.urgency = newUrgency; // Update the task's urgency
            await this.updateDB(); // Save the updated tasks array to the database
        }
    }


    // Method to calculate and save completion percentage for a specific date
    async calculateAndSaveCompletionPercentage(): Promise<number> {
        return await calculateAndSaveCompletionPercentage(this.tasks);
    }

    public getProfileTasks(): TaskDoc[] {
        return this.tasks;
    }

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

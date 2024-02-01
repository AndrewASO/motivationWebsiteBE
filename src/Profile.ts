/**
 * This stores and modifies all of the information that would belong in profile.
 * There are two constructors and ones for signing in and the other one is for logging in.
 * @Author Andrew Skevington-Olivera
 * @Date 14-1-24
 */


import { MongoDB } from "./mongoDB";

export class Profile {

    //These are all the variables that're in profile and I should probably include some encryption / tokenization to make this more secure
    private displayName;
    private username;
    private password;
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
        collection.insertOne( {"Username" : this.username, "Password" : this.password, "DisplayName" : this.displayName})
    }

    /**
     * This returns all of the information from the Profile's document when gathering it from MongoDB
     * and sets the variable to their corresponding variable inside of this obj.
     */
    public async getUserDBInfo() {
        let collection = this.db.returnCollection("ProfilesDB", "Profiles");
        const doc = await collection.findOne( {Username : this.username} );

        this.displayName = doc.DisplayName;
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
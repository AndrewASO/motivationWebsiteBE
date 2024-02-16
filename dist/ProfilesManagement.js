"use strict";
/**
 *
 * @Author Andrew Skevington-Olivera
 * @Date 14-1-24
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileManagement = void 0;
const Profile_1 = require("./Profile");
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const saltRounds = 10;
class ProfileManagement {
    constructor(...arr) {
        this.profileList = new Array();
        if (arr.length == 1) {
            this.db = arr[0];
            this.initialize();
        }
        else {
            this.db = arr[0];
        }
    }
    clearProfiles() {
        this.profileList = new Array();
    }
    /**
     * This creates a Profile Class for each of the different Profiles that're being stored in the Database.
     * It then adds it to the profileList array and makes sure all of the information is being transferred over from the
     * database into the Profile Object.
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.db.returnCollection("ProfilesDB", "Profiles");
            var usernameList = new Array();
            var pwList = new Array();
            yield collection.find().forEach(function (myDoc) { usernameList.push(myDoc.Username); });
            yield collection.find().forEach(function (myDoc) { pwList.push(myDoc.Password); });
            for (var i = 0; i < usernameList.length; i++) {
                let oldProfile = new Profile_1.Profile(usernameList[i], pwList[i], this.db);
                this.profileList.push(oldProfile);
            }
            /**
            const collection = this.db.returnCollection("ProfilesDB", "Profiles");
    
                // Use toArray to simplify retrieval of documents
                const documents = await collection.find().toArray();
    
                // Use a single loop to create profile instances
                documents.forEach((doc: { Username: string; Password: string; }) => {
                    let oldProfile = new Profile(doc.Username, doc.Password, this.db);
                    this.profileList.push(oldProfile);
                });
    
            */
        });
    }
    /**
     * This checks if the username that the user wants is taken or not, if the username isn't taken then a new Profile Obj
     * will be created and pushed to the array, and it'll be saved to the database.
     * @param displayName
     * @param username
     * @param password
     * @returns Returns true if username hasn't been chosen yet, false if username is taken.
     */
    signIn(displayName, username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.db.returnCollection("ProfilesDB", "Profiles");
            const doc = yield collection.findOne({ Username: username });
            if (doc == null) { //Username hasn't been chosen yet for the website
                const hashPW = yield bcrypt.hash(password, saltRounds);
                let newProfile = new Profile_1.Profile(displayName, username, hashPW, this.db);
                this.profileList.push(newProfile);
                console.log("A new profile should be in the process of being created");
                return true;
            }
            console.log("The username was already being taken");
            return false; //The username is already taken
        });
    }
    /**
     * Checks if the login information is correct and returns a session ID if true, or false if wrong.
     * @param {string} username Username of the user attempting to log in
     * @param {string} password Password of the user
     * @returns {Promise<string | false>} A promise that resolves to the session ID if login is successful, or false if unsuccessful.
     */
    login(username, plainTextPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersCollection = this.db.returnCollection("ProfilesDB", 'Profiles');
            const sessionsCollection = this.db.returnCollection("ProfilesDB", 'Sessions');
            const user = yield usersCollection.findOne({ Username: username });
            if (user) {
                // Compare provided password with the stored hash
                const isMatch = yield bcrypt.compare(plainTextPassword, user.Password);
                if (isMatch) {
                    const sessionId = crypto.randomBytes(16).toString('hex');
                    yield sessionsCollection.insertOne({
                        sessionId,
                        userId: user._id,
                        createdAt: new Date(),
                        expiresAt: new Date(Date.now() + (30 * 60 * 1000)), // 30 minute expiration
                    });
                    // Return the sessionId for the client to use
                    return sessionId;
                }
                else {
                    console.log("Checking if it got to false 1");
                    return false; // Password mismatch
                }
            }
            else {
                console.log("Checking if it got to false 2");
                return false; // User not found
            }
        });
    }
    /**
     * Looks through all of the profiles in profileList and looks for any corresponding usernames to send back.
     * @param username
     * @returns a profile obj with the username in the mongoDB
     */
    accessUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            for (var i = 0; i < this.profileList.length; i++) {
                if (username == this.profileList[i].returnUsername()) {
                    let copyProfile = this.profileList[i];
                    return copyProfile;
                }
            }
        });
    }
    /**
     * This goes through each of the profiles in the profileList array and appends their username
     * to an array to return so all of the user's can be accessed via their username
     * @returns
     */
    returnProfileUsernames() {
        let usernameList = new Array();
        for (var i = 0; i < this.profileList.length; i++) {
            usernameList.push(this.profileList[i].username);
        }
        return usernameList;
    }
}
exports.ProfileManagement = ProfileManagement;

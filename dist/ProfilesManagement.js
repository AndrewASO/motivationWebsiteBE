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
class ProfileManagement {
    constructor(db) {
        this.profileList = new Array();
        this.db = db;
        this.initialize();
    }
    test() {
        return __awaiter(this, void 0, void 0, function* () {
            let collection = this.db.returnCollection("ProfilesDB", "Profiles");
        });
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
                let newProfile = new Profile_1.Profile(displayName, username, password, this.db);
                this.profileList.push(newProfile);
                console.log("A new profile should be in the process of being created");
                return true;
            }
            console.log("The username was already being taken");
            return false; //The username is already taken
        });
    }
    /**
     * Checks if the login information is correct and returns a bool to say true or false for the login credentials given.
     * @param username
     * @param password
     * @returns true is information is correct & false if it's wrong.
     */
    login(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.db.returnCollection("ProfilesDB", "Profiles");
            const doc = yield collection.findOne({ Username: username });
            if (doc != null) {
                if (password === doc.Password) {
                    return true; //Information was correct.
                }
                else {
                    return false; //Password wasn't correct. User should try to enter their login information again.
                }
            }
            else {
                return false; //Username wasn't in the database. User should try to enter their login information again.
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

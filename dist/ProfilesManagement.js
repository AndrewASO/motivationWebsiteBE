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
    /**
     * Initializes the ProfileManagement with a MongoDB connection.
     * Optionally skips initialization for unit testing purposes.
     * @param {MongoDB} db - The MongoDB connection instance.
     * @param {boolean} skipInit - If true, skips automatic initialization (useful for testing).
     */
    constructor(db, skipInit = false) {
        this.profileList = [];
        this.db = db;
        if (!skipInit) {
            this.initialize();
        }
    }
    /**
     * Clears the loaded profiles list. Useful for resetting state in testing or reinitialization.
     */
    clearProfiles() {
        return __awaiter(this, void 0, void 0, function* () {
            this.profileList = [];
        });
    }
    /**
     * Asynchronously initializes the profile list from the database.
     * Retrieves all profile documents and transforms them into Profile instances.
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.db.returnCollection("ProfilesDB", "Profiles");
            const documents = yield collection.find().toArray();
            this.profileList = documents.map((doc) => new Profile_1.Profile(doc.Username, doc.Password, this.db));
        });
    }
    /**
     * Attempts to sign in a new user with a display name, username, and password.
     * Hashes the password for secure storage. If the username is unique, creates a new profile.
     * @param {string} displayName - User's display name.
     * @param {string} username - Chosen username, must be unique.
     * @param {string} password - User's password.
     * @returns {Promise<boolean>} - True if the sign-in was successful (username was unique), else false.
     */
    signIn(displayName, username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.db.returnCollection("ProfilesDB", "Profiles");
            const existingUser = yield collection.findOne({ Username: username });
            if (!existingUser) {
                const hashPW = yield bcrypt.hash(password, saltRounds);
                const newProfile = new Profile_1.Profile(displayName, username, hashPW, this.db);
                this.profileList.push(newProfile);
                // Optionally: Save new profile to DB here
                return true;
            }
            return false;
        });
    }
    /**
     * Authenticates a user's login attempt using their username and password.
     * If successful, generates and returns a session ID.
     * @param {string} username - Username of the attempting user.
     * @param {string} plainTextPassword - Password provided by the user.
     * @returns {Promise<string | false>} - Session ID if authentication succeeds, else false.
     */
    login(username, plainTextPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.db.returnCollection("ProfilesDB", 'Profiles').findOne({ Username: username });
            if (user && (yield bcrypt.compare(plainTextPassword, user.Password))) {
                const sessionId = crypto.randomBytes(16).toString('hex');
                yield this.db.returnCollection("ProfilesDB", 'Sessions').insertOne({
                    sessionId,
                    userId: user._id,
                    createdAt: new Date(),
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30-minute expiration
                });
                return sessionId;
            }
            return false;
        });
    }
    /**
     * Retrieves a user's profile based on their username.
     * @param {string} username - Username of the profile to access.
     * @returns {Profile | undefined} - The requested profile if found, else undefined.
     */
    accessUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.profileList.find(profile => profile.returnUsername() === username);
        });
    }
    getProfileOrThrow(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const profile = yield this.accessUser(username);
            if (!profile) {
                throw new Error(`Profile not found for username: ${username}`);
            }
            return profile;
        });
    }
    /**
     * Generates a list of usernames from the currently loaded profiles.
     * @returns {string[]} - List of usernames.
     */
    returnProfileUsernames() {
        return this.profileList.map(profile => profile.returnUsername());
    }
    /**
     * Deletes a user's profile based on their username.
     * @param {string} username - Username of the user to delete.
     * @returns {Promise<boolean>} - True if the profile was successfully deleted, else false.
     */
    deleteUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const profilesCollection = this.db.returnCollection("ProfilesDB", "Profiles");
            // Delete from MongoDB
            const deleteResult = yield profilesCollection.deleteOne({ Username: username });
            if (deleteResult.deletedCount === 1) {
                // Successfully deleted from MongoDB, now remove from profileList
                this.profileList = this.profileList.filter(profile => profile.returnUsername() !== username);
                return true;
            }
            // Profile not found or deletion unsuccessful
            return false;
        });
    }
}
exports.ProfileManagement = ProfileManagement;

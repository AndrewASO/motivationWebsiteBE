/**
 * 
 * @Author Andrew Skevington-Olivera
 * @Date 14-1-24
 */

import { MongoDB } from "./mongoDB";
import { Profile } from "./Profile";
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const saltRounds = 10;

export class ProfileManagement {
    private profileList: Profile[] = [];
    private db: MongoDB;

    /**
     * Initializes the ProfileManagement with a MongoDB connection.
     * Optionally skips initialization for unit testing purposes.
     * @param {MongoDB} db - The MongoDB connection instance.
     * @param {boolean} skipInit - If true, skips automatic initialization (useful for testing).
     */
    constructor(db: MongoDB, skipInit = false) {
        this.db = db;
        if (!skipInit) {
            this.initialize();
        }
    }

    /**
     * Clears the loaded profiles list. Useful for resetting state in testing or reinitialization.
     */
    public async clearProfiles() {
        this.profileList = [];
    }

    /**
     * Asynchronously initializes the profile list from the database.
     * Retrieves all profile documents and transforms them into Profile instances.
     */
    public async initialize() {
        const collection = this.db.returnCollection("ProfilesDB", "Profiles");
        const documents = await collection.find().toArray();
        this.profileList = documents.map((doc: { Username: string; Password: string; }) => new Profile(doc.Username, doc.Password, this.db));
    }

    /**
     * Attempts to sign in a new user with a display name, username, and password.
     * Hashes the password for secure storage. If the username is unique, creates a new profile.
     * @param {string} displayName - User's display name.
     * @param {string} username - Chosen username, must be unique.
     * @param {string} password - User's password.
     * @returns {Promise<boolean>} - True if the sign-in was successful (username was unique), else false.
     */
    public async signIn(displayName: string, username: string, password: string): Promise<boolean> {
        const collection = this.db.returnCollection("ProfilesDB", "Profiles");
        const existingUser = await collection.findOne({ Username: username });

        if (!existingUser) {
            const hashPW = await bcrypt.hash(password, saltRounds);
            const newProfile = new Profile(displayName, username, hashPW, this.db);
            this.profileList.push(newProfile);
            // Optionally: Save new profile to DB here
            return true;
        }

        return false;
    }

    /**
     * Authenticates a user's login attempt using their username and password.
     * If successful, generates and returns a session ID.
     * @param {string} username - Username of the attempting user.
     * @param {string} plainTextPassword - Password provided by the user.
     * @returns {Promise<string | false>} - Session ID if authentication succeeds, else false.
     */
    public async login(username: string, plainTextPassword: string): Promise<string | false> {
        const user = await this.db.returnCollection("ProfilesDB", 'Profiles').findOne({ Username: username });
        if (user && await bcrypt.compare(plainTextPassword, user.Password)) {
            const sessionId = crypto.randomBytes(16).toString('hex');
            await this.db.returnCollection("ProfilesDB", 'Sessions').insertOne({
                sessionId,
                userId: user._id,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30-minute expiration
            });
            return sessionId;
        }
        return false;
    }

    /**
     * Retrieves a user's profile based on their username.
     * @param {string} username - Username of the profile to access.
     * @returns {Profile | undefined} - The requested profile if found, else undefined.
     */
    public async accessUser(username: string): Promise<Profile | undefined> {
        return this.profileList.find(profile => profile.returnUsername() === username);
    }

    public async getProfileOrThrow(username: string): Promise<Profile> {
        const profile = await this.accessUser(username);
        if (!profile) {
            throw new Error(`Profile not found for username: ${username}`);
        }
        return profile;
    }

    /**
     * Generates a list of usernames from the currently loaded profiles.
     * @returns {string[]} - List of usernames.
     */
    public returnProfileUsernames(): string[] {
        return this.profileList.map(profile => profile.returnUsername());
    }

    /**
     * Deletes a user's profile based on their username.
     * @param {string} username - Username of the user to delete.
     * @returns {Promise<boolean>} - True if the profile was successfully deleted, else false.
     */
    public async deleteUser(username: string): Promise<boolean> {
        const profilesCollection = this.db.returnCollection("ProfilesDB", "Profiles");

        // Delete from MongoDB
        const deleteResult = await profilesCollection.deleteOne({ Username: username });

        if (deleteResult.deletedCount === 1) {
            // Successfully deleted from MongoDB, now remove from profileList
            this.profileList = this.profileList.filter(profile => profile.returnUsername() !== username);
            return true;
        }

        // Profile not found or deletion unsuccessful
        return false;
    }
}

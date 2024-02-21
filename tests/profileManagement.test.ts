/**
 * Should probably work on logging in, signing in, deleting an account, returning all of the profile names and that should be it ? 
 */

import { Profile } from "../src/Profile";
import { MongoDB } from "../src/mongoDB";
import { ProfileManagement } from "../src/ProfilesManagement";
import dotenv from 'dotenv';

dotenv.config()

describe('Profile Management', () => { 

    let profile : Profile;
    let profileManagement : ProfileManagement;

    beforeAll( async () => {
       
    });

    it('should create a ProfileManagement instance', async () => {
        const dbURL: string = process.env.mongoDB_URL as string;
        const db = new MongoDB(dbURL);
        const tempProfileManagement = new ProfileManagement(db, true);
        await tempProfileManagement.initialize();

        expect(tempProfileManagement).toBeDefined();
        profileManagement = tempProfileManagement;
    });

    it('Accessing profile from profileManagement', async () => {
        // Usage
        try {
            const tempProfile = await profileManagement.getProfileOrThrow("testing1");
            profile = tempProfile;
        } catch (error) {
            console.error(error);
            // Handle the error, e.g., return an error response in an API call
        }

    });

    it('should sign in a new profile', async () => {
        const displayName = "testing3";
        const username = "testing3";
        const password = "testing3";
        const result = await profileManagement.signIn(displayName, username, password);

        expect(result).toBeTruthy();
    });

    it('should login with correct credentials', async () => {
        const username = "testing1";
        const password = "testing1";
        const sessionId = await profileManagement.login(username, password);

        expect(sessionId).toBeTruthy();
    });

    it('should fail login with incorrect credentials', async () => {
        const username = "testing1";
        const password = "testing4";
        const sessionId = await profileManagement.login(username, password);

        expect(sessionId).toBeFalsy();
    });

    it('should delete a profile', async () => {
        const username = "testing3";
        const result = await profileManagement.deleteUser(username);

        expect(result).toBeTruthy();
    });

    it('should return all profile usernames', async () => {
        // Assuming you have other profiles initialized or created in your database for testing
        const usernames = profileManagement.returnProfileUsernames();

        // This assertion might need to be adjusted based on the actual profiles in your database
        expect(usernames.length).toBeGreaterThan(0);
    });

});
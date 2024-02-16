

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
        const tempProfileManagement = new ProfileManagement(db, "test");
        await tempProfileManagement.initialize();

        expect(tempProfileManagement).toBeDefined();
        profileManagement = tempProfileManagement;
    });

    it('Accessing profile from profileManagement', async () => {

        //console.log( profileManagement );

        const testProfile = await profileManagement.accessUser("testing1");

        console.log(testProfile);

    });




});
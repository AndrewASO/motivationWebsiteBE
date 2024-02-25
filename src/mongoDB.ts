/**
 * This is for managing the connections to the mongoDB database.
 * This would involve modifying information, inputting information, removing information and retrieving information.
 */


const {MongoClient} = require('mongodb');

export class MongoDB {

    private mongoClient = MongoClient;    

    constructor(uri : string){
        this.mongoClient = new MongoClient(uri);
    }

    /**
     * Connects to MongoDB server
     */
    public async connect() {
        await this.mongoClient.connect();
    }

    /**
     * Returns the Mongo collection of the database with the collectionName.
     * @param database 
     * @param collectionName 
     * @returns 
     */
    public returnCollection(database : string, collectionName : string) { 
        const db = this.mongoClient.db(database);
        return db.collection(collectionName);
    }

    /**
     * Returns the doc with the username of the requested doc from collection.
     * @param database 
     * @param collectionName 
     * @param username 
     * @returns 
     */
    public async ReturnDoc(database : string, collectionName : string, username : string) {
        const collection = this.returnCollection(database, collectionName);
        const doc =  await collection.findOne( {"Username" : username} );
        return doc;
    }

    /**
     * 
     * @returns mongoClient
     */
    public returnMongoClient() {
        return this.mongoClient;
    }

    public updateDB(database : string, collectionName : string, username : string, field : string, updatedVar : any) { 
        const collection = this.returnCollection(database, collectionName);
        collection.updateOne( {Username : username}, { $set: { [field] : updatedVar} } );
    }

    //Had Promise<void>
    public async getVar(database : string, collectionName : string, username : string, field : string) { 
        const collection = this.returnCollection(database, collectionName);
        const doc = await collection.findOne( {"Username" : username} );

        return doc[field];
    }

}

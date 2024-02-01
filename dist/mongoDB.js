"use strict";
/**
 * This is for managing the connections to the mongoDB database.
 * This would involve modifying information, inputting information, removing information and retrieving information.
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
exports.MongoDB = void 0;
const { MongoClient } = require('mongodb');
class MongoDB {
    constructor(uri) {
        this.mongoClient = MongoClient;
        this.mongoClient = new MongoClient(uri);
    }
    /**
     * Connects to MongoDB server
     */
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mongoClient.connect();
        });
    }
    /**
     * Returns the Mongo collection of the database with the collectionName.
     * @param database
     * @param collectionName
     * @returns
     */
    returnCollection(database, collectionName) {
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
    ReturnDoc(database, collectionName, username) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.returnCollection(database, collectionName);
            const doc = yield collection.findOne({ "Username": username });
            return doc;
        });
    }
    /**
     *
     * @returns mongoClient
     */
    returnMongoClient() {
        return this.mongoClient;
    }
    updateDB(database, collectionName, username, field, updatedVar) {
        const collection = this.returnCollection(database, collectionName);
        collection.updateOne({ Username: username }, { $set: { [field]: updatedVar } });
    }
    //Had Promise<void>
    getVar(database, collectionName, username, field) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = this.returnCollection(database, collectionName);
            const doc = yield collection.findOne({ "Username": username });
            return doc[field];
        });
    }
}
exports.MongoDB = MongoDB;

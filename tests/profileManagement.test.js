"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoDB_1 = require("../src/mongoDB");
const ProfilesManagement_1 = require("../src/ProfilesManagement");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
describe('Profile Management', () => {
    let profile;
    let profileManagement;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    }));
    it('should create a ProfileManagement instance', () => __awaiter(void 0, void 0, void 0, function* () {
        const dbURL = process.env.mongoDB_URL;
        const db = new mongoDB_1.MongoDB(dbURL);
        const tempProfileManagement = new ProfilesManagement_1.ProfileManagement(db, "test");
        yield tempProfileManagement.initialize();
        expect(tempProfileManagement).toBeDefined();
        profileManagement = tempProfileManagement;
    }));
    it('Accessing profile from profileManagement', () => __awaiter(void 0, void 0, void 0, function* () {
        //console.log( profileManagement );
        const testProfile = yield profileManagement.accessUser("testing1");
        console.log(testProfile);
    }));
});

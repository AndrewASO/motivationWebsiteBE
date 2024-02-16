"use strict";
/**
 * @Author Andrew Skevington-Olivera
 * @Date 12-1-24
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const ProfilesManagement_1 = require("./ProfilesManagement");
const mongoDB_1 = require("./mongoDB");
const scraper_1 = require("./scraper");
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const dbURL = process.env.mongoDB_URL;
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const server = (0, express_1.default)();
        server.use((0, cors_1.default)({
            allowedHeaders: "*"
        }));
        server.use(express_1.default.json());
        const db = new mongoDB_1.MongoDB(dbURL);
        const profileManagement = new ProfilesManagement_1.ProfileManagement(db);
        /**
         *
         *
         * THIS HANDLES ALL OF THE PROFILE API CALLS WITH LOGIN & REGISTERING ALONG WITH PROFILE INFORMATION EDITING
         *
         *
         */
        /**
         * This is the API call for allowing frontend to send a SignIn request with all of the different fields necessary for it.
         */
        server.post('/SignIn', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { displayName, username, password } = req.body;
            const msg = yield profileManagement.signIn(displayName, username, password);
            res.send(msg);
        }));
        /**
         * This is the Login API.
         */
        server.post('/Login', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { username, password } = req.body;
            const msg = yield profileManagement.login(username, password);
            res.send(msg);
        }));
        /**
         * This is the returnProfile API
         */
        server.get('/ReturnProfileInformation', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const username = req.query.Username;
            let profile = yield profileManagement.accessUser(username); //Maybe I should have a check for if profile is null ?
            profile.setMongoDB(null);
            let JSONConversion = JSON.stringify(profile);
            profile.setMongoDB(db);
            res.send(JSONConversion);
        }));
        /**
         * This is the novels API test
         */
        server.get('/novelTest', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const test2 = yield (0, scraper_1.scrapeLinks)("https://fanstranslations.com/novel/in-place-of-losing-my-memory-i-remembered-that-i-was-the-fiancee-of-the-capture-target/", "chapter");
            res.send(test2);
        }));
        // Endpoint to add a new task
        server.post('/tasks/add', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { username, description } = req.body; // Assuming tasks are added via profile ID now
            try {
                let profile = yield profileManagement.accessUser(username); // Adjusted to access by ID
                if (!profile) {
                    return res.status(404).send({ error: "Profile not found" });
                }
                yield profile.addTask(description);
                res.status(201).send({ message: "Task added successfully" });
            }
            catch (error) {
                res.status(400).send({ error: "Failed to add task", details: error instanceof Error ? error.toString() : String(error) });
            }
        }));
        // Endpoint to complete a task
        server.post('/tasks/complete', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { username, taskId } = req.body; // Adjusted for task completion via profile ID
            try {
                let profile = yield profileManagement.accessUser(username);
                if (!profile) {
                    return res.status(404).send({ error: "Profile not found" });
                }
                yield profile.completeTask(taskId);
                // Removed the call to calculate and save completion percentage as it might not be needed here
                res.status(200).send({ message: "Task completed successfully" });
            }
            catch (error) {
                res.status(400).send({ error: "Failed to complete task", details: error instanceof Error ? error.toString() : String(error) });
            }
        }));
        // Endpoint to retrieve user's tasks
        server.get('/tasks', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const username = req.query.Username; // Adjusted to use profile ID
            try {
                let profile = yield profileManagement.accessUser(username);
                if (!profile) {
                    return res.status(404).send({ error: "Profile not found" });
                }
                const tasks = profile.getProfileTasks(); // Adjusted to use the new method name
                res.status(200).send(tasks);
            }
            catch (error) {
                res.status(400).send({ error: "Failed to retrieve tasks", details: error instanceof Error ? error.toString() : String(error) });
            }
        }));
        server.listen(3000);
    });
}
exports.startServer = startServer;

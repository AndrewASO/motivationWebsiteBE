"use strict";
/**
 *
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
const gpt_1 = require("./gpt");
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const dbURL = process.env.mongoDB_URL;
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const gpt = new gpt_1.GPT();
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
            const sessionId = yield profileManagement.login(username, password);
            if (sessionId) {
                // Successful login, return JSON with sessionId
                res.json({ sessionId: sessionId });
            }
            else {
                // Unsuccessful login, return JSON indicating failure
                res.status(401).json({ success: false, message: "Invalid username or password" });
            }
        }));
        /**
         * This is the returnProfile API
         */
        server.get('/ReturnProfileInformation', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const username = req.query.Username;
            try {
                const profile = yield profileManagement.getProfileOrThrow(username);
                res.json(profile); // Directly send the profile object, toJSON will be called automatically
            }
            catch (error) {
                console.error(error);
                res.status(500).send({ error: "Failed to retrieve profile" });
            }
        }));
        // Endpoint to retrieve user profile by sessionID
        server.get('/user/profile', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const sessionId = req.query.sessionId;
            if (typeof sessionId !== 'string') {
                return res.status(400).json({ success: false, message: "Session ID must be a string." });
            }
            try {
                const profile = yield profileManagement.sessionUserObject(sessionId);
                if (profile) {
                    res.json({ success: true, profile: profile });
                }
                else {
                    res.status(404).json({ success: false, message: "Profile not found." });
                }
            }
            catch (error) {
                const errorMessage = (error instanceof Error) ? error.message : 'An unexpected error occurred.';
                res.status(500).json({ success: false, message: "An error occurred while retrieving the profile.", error: errorMessage });
            }
        }));
        /**
         * This is the novels API test
         */
        server.get('/novelTest', (req, res) => __awaiter(this, void 0, void 0, function* () {
            //This was mostly used to see if I could work with another websites API
            const test1 = yield (0, scraper_1.scrapeLinks)("https://fanstranslations.com/novel/in-place-of-losing-my-memory-i-remembered-that-i-was-the-fiancee-of-the-capture-target/ajax/chapters/", "chapter");
            //const test2 = await scrapeLinks("https://fanstranslations.com/novel/i-was-a-small-fish-when-i-reincarnated-but-it-seems-that-i-can-become-a-dragon-so-i-will-do-my-best/", "chapter");
            res.send(test1);
        }));
        /**
         * This is the novels API test
         */
        server.get('/novel/chapters', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const link = req.query.Link;
            const chapterLinks = yield (0, scraper_1.scrapeLinks)(link, "chapter");
            res.send(chapterLinks);
        }));
        // Endpoint to add a new task
        server.post('/tasks/add', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { username, description, urgency } = req.body; // Assuming tasks are added via profile ID now
            try {
                let profile = yield profileManagement.accessUser(username); // Adjusted to access by ID
                if (!profile) {
                    return res.status(404).send({ error: "Profile not found" });
                }
                yield profile.addTask(description, urgency);
                res.status(201).send({ message: "Task added successfully" });
            }
            catch (error) {
                res.status(400).send({ error: "Failed to add task", details: error instanceof Error ? error.toString() : String(error) });
            }
        }));
        // Endpoint to toggle a task's completion status
        server.post('/tasks/toggle-completion', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { username, taskId } = req.body;
            try {
                let profile = yield profileManagement.accessUser(username);
                if (!profile) {
                    return res.status(404).send({ error: "Profile not found" });
                }
                // Use the updated function name that reflects its new functionality
                yield profile.toggleTaskCompletion(taskId);
                res.status(200).send({ message: "Task completion status toggled successfully" });
            }
            catch (error) {
                res.status(400).send({ error: "Failed to toggle task completion status", details: error.toString() });
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
        // Endpoint to delete a task - Update to use taskId
        server.delete('/tasks/delete', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { username, taskId } = req.body; // Now using taskId for task identification
            try {
                let profile = yield profileManagement.accessUser(username);
                if (!profile) {
                    return res.status(404).send({ error: "Profile not found" });
                }
                yield profile.deleteTask(taskId); // Use taskId to find and delete the task
                res.status(200).send({ message: "Task deleted successfully" });
            }
            catch (error) {
                res.status(400).send({ error: "Failed to delete task", details: error.toString() });
            }
        }));
        // Endpoint to reset all tasks
        server.post('/tasks/reset', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { username } = req.body; // Reset tasks for a given profile
            try {
                let profile = yield profileManagement.accessUser(username);
                if (!profile) {
                    return res.status(404).send({ error: "Profile not found" });
                }
                yield profile.resetTasks();
                res.status(200).send({ message: "Tasks reset successfully" });
            }
            catch (error) {
                res.status(400).send({ error: "Failed to reset tasks", details: error instanceof Error ? error.toString() : String(error) });
            }
        }));
        // Endpoint to update a task's urgency
        server.patch('/tasks/update-urgency', (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { username, taskId, newUrgency } = req.body;
            try {
                let profile = yield profileManagement.accessUser(username);
                if (!profile) {
                    return res.status(404).send({ error: "Profile not found" });
                }
                yield profile.updateTaskUrgency(taskId, newUrgency);
                res.status(200).send({ message: "Task urgency updated successfully" });
            }
            catch (error) {
                res.status(400).send({ error: "Failed to update task urgency", details: error instanceof Error ? error.toString() : String(error) });
            }
        }));
        server.post('/ask-gpt', (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { query } = req.body;
                if (!query) {
                    return res.status(400).send({ error: 'Query is required' });
                }
                const response = yield gpt.sendMessage(query);
                res.send({ response });
            }
            catch (error) {
                console.error('Error processing GPT request:', error);
                res.status(500).send({ error: 'Failed to process your request' });
            }
        }));
        server.listen(3000);
    });
}
exports.startServer = startServer;

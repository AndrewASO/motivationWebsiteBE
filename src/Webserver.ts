/**
 * 
 */


import { ProfileManagement } from "./ProfilesManagement";
import { MongoDB } from "./mongoDB";
import { scrapeLinks, scrapeText } from "./scraper";
import { Task, CompletionStats, calculateAndSaveCompletionPercentage } from './tasks';
import dotenv from 'dotenv';

import express from "express"
import cors from 'cors';
import {Request, Response, NextFunction} from 'express';


dotenv.config()
const dbURL = process.env.mongoDB_URL as string;


export async function startServer() {
  const server = express();
  server.use(cors({
      allowedHeaders: "*"
  }))
  server.use(express.json() );

  const db = new MongoDB(dbURL);
  const profileManagement = new ProfileManagement(db);

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
  server.post('/SignIn', async (req: Request, res: Response) => {
    const { displayName, username, password } = req.body;
    const msg = await profileManagement.signIn( displayName, username, password);
    res.send(msg);
  } )

  /**
   * This is the Login API.
   */
  server.post('/Login', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const sessionId = await profileManagement.login( username, password);
    if (sessionId) {
      // Successful login, return JSON with sessionId
      res.json({ sessionId: sessionId });
    } else {
      // Unsuccessful login, return JSON indicating failure
      res.status(401).json({ success: false, message: "Invalid username or password" });
    }
  } )

  /**
   * This is the returnProfile API
   */
  server.get('/ReturnProfileInformation', async (req: Request, res: Response) => {
    const username = req.query.Username as string;
    try {
        const profile = await profileManagement.getProfileOrThrow(username);
        res.json(profile); // Directly send the profile object, toJSON will be called automatically
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to retrieve profile" });
    }
  });

  // Endpoint to retrieve user profile by sessionID
  server.get('/user/profile', async (req, res) => {
    const sessionId = req.query.sessionId;
    if (typeof sessionId !== 'string') {
        return res.status(400).json({ success: false, message: "Session ID must be a string." });
    }

    try {
        const profile = await profileManagement.sessionUserObject(sessionId);
        if (profile) {
            res.json({ success: true, profile: profile });
        } else {
            res.status(404).json({ success: false, message: "Profile not found." });
        }
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : 'An unexpected error occurred.';
        res.status(500).json({ success: false, message: "An error occurred while retrieving the profile.", error: errorMessage });
    }
  });


  /**
   * This is the novels API test
   */
  server.get('/novelTest', async (req: Request, res: Response) => {
    //This was mostly used to see if I could work with another websites API
    const test1 = await scrapeLinks("https://fanstranslations.com/novel/in-place-of-losing-my-memory-i-remembered-that-i-was-the-fiancee-of-the-capture-target/ajax/chapters/", "chapter");
    //const test2 = await scrapeLinks("https://fanstranslations.com/novel/i-was-a-small-fish-when-i-reincarnated-but-it-seems-that-i-can-become-a-dragon-so-i-will-do-my-best/", "chapter");
    res.send(test1);
  } )


  // Endpoint to add a new task
  server.post('/tasks/add', async (req, res) => {
    const { username, description } = req.body; // Assuming tasks are added via profile ID now
    try {
      let profile = await profileManagement.accessUser(username); // Adjusted to access by ID
      if (!profile) {
        return res.status(404).send({ error: "Profile not found" });
      }
      await profile.addTask(description);
      res.status(201).send({ message: "Task added successfully" });
    } catch (error) {
      res.status(400).send({ error: "Failed to add task", details: error instanceof Error ? error.toString() : String(error) });
    }
  });

  // Endpoint to complete a task - Update to use taskId instead of description
  server.post('/tasks/complete', async (req, res) => {
    const { username, taskId } = req.body; // Now using taskId for identification
    try {
      let profile = await profileManagement.accessUser(username);
      if (!profile) {
        return res.status(404).send({ error: "Profile not found" });
      }
      await profile.completeTask(taskId); // Use taskId to find and complete the task
      res.status(200).send({ message: "Task completed successfully" });
    } catch (error) {
      res.status(400).send({ error: "Failed to complete task", details: (error as Error).toString() });
    }
  });

  // Endpoint to retrieve user's tasks
  server.get('/tasks', async (req, res) => {
    const username = req.query.Username as string; // Adjusted to use profile ID
    try {
      let profile = await profileManagement.accessUser(username);
      if (!profile) {
        return res.status(404).send({ error: "Profile not found" });
      }
      const tasks = profile.getProfileTasks(); // Adjusted to use the new method name
      res.status(200).send(tasks);
    } catch (error) {
      res.status(400).send({ error: "Failed to retrieve tasks", details: error instanceof Error ? error.toString() : String(error) });
    }
  });

  // Endpoint to delete a task - Update to use taskId
  server.delete('/tasks/delete', async (req, res) => {
    const { username, taskId } = req.body; // Now using taskId for task identification
    try {
      let profile = await profileManagement.accessUser(username);
      if (!profile) {
        return res.status(404).send({ error: "Profile not found" });
      }
      await profile.deleteTask(taskId); // Use taskId to find and delete the task
      res.status(200).send({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(400).send({ error: "Failed to delete task", details: (error as Error).toString() });
    }
  });

  // Endpoint to reset all tasks
  server.post('/tasks/reset', async (req, res) => {
    const { username } = req.body; // Reset tasks for a given profile
    try {
        let profile = await profileManagement.accessUser(username);
        if (!profile) {
            return res.status(404).send({ error: "Profile not found" });
        }
        await profile.resetTasks();
        res.status(200).send({ message: "Tasks reset successfully" });
    } catch (error) {
        res.status(400).send({ error: "Failed to reset tasks", details: error instanceof Error ? error.toString() : String(error) });
    }
  });

  // Endpoint to update a task's urgency
  server.patch('/tasks/update-urgency', async (req, res) => {
    const { username, taskId, newUrgency } = req.body;
    try {
      let profile = await profileManagement.accessUser(username);
      if (!profile) {
        return res.status(404).send({ error: "Profile not found" });
      }
      await profile.updateTaskUrgency(taskId, newUrgency);
      res.status(200).send({ message: "Task urgency updated successfully" });
    } catch (error) {
      res.status(400).send({ error: "Failed to update task urgency", details: error instanceof Error ? error.toString() : String(error) });
    }
  });







    

  

  server.listen(3000);
}





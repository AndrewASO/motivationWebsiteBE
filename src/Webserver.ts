/**
 * @Author Andrew Skevington-Olivera
 * @Date 12-1-24
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


  /**
   * This is the novels API test
   */
  server.get('/novelTest', async (req: Request, res: Response) => {
    const test2 = await scrapeLinks("https://fanstranslations.com/novel/in-place-of-losing-my-memory-i-remembered-that-i-was-the-fiancee-of-the-capture-target/", "chapter");
    res.send(test2);
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

  // Endpoint to complete a task
  server.post('/tasks/complete', async (req, res) => {
    const { username, taskId } = req.body; // Adjusted for task completion via profile ID
    try {
      let profile = await profileManagement.accessUser(username);
      if (!profile) {
        return res.status(404).send({ error: "Profile not found" });
      }
      await profile.completeTask(taskId);
      // Removed the call to calculate and save completion percentage as it might not be needed here
      res.status(200).send({ message: "Task completed successfully" });
    } catch (error) {
      res.status(400).send({ error: "Failed to complete task", details: error instanceof Error ? error.toString() : String(error) });
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

  // Endpoint to delete a task
  server.delete('/tasks/delete', async (req, res) => {
    const { username, taskDescription } = req.body; // Assume task identification by description
    try {
        let profile = await profileManagement.accessUser(username);
        if (!profile) {
            return res.status(404).send({ error: "Profile not found" });
        }
        await profile.deleteTask(taskDescription);
        res.status(200).send({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(400).send({ error: "Failed to delete task", details: error instanceof Error ? error.toString() : String(error) });
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






    

  

  server.listen(3000);
}





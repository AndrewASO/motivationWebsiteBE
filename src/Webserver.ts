/**
 * @Author Andrew Skevington-Olivera
 * @Date 12-1-24
 */


import { ProfileManagement } from "./ProfilesManagement";
import { MongoDB } from "./mongoDB";
import { scrapeLinks, scrapeText } from "./scraper";
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

  const db = new MongoDB(dbURL);
  const profileManagement = new ProfileManagement(db);

  //const test = await scrapeLinks("https://manganato.com/manga-wo1000097", "chapter");
  //console.log(test);

  //const test2 = await scrapeLinks("https://fanstranslations.com/novel/in-place-of-losing-my-memory-i-remembered-that-i-was-the-fiancee-of-the-capture-target/", "chapter");
  //console.log(test2);

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
  server.get('/SignIn', async (req: Request, res: Response) => {
    const displayName = req.query.DisplayName as string;
    const username = req.query.Username as string;
    const pw = req.query.Password as string;
    const msg = await profileManagement.signIn( displayName, username, pw);
    res.send(msg);
  } )

  /**
   * This is the Login API.
   */
  server.get('/Login', async (req: Request, res: Response) => {
    const username = req.query.Username as string;
    const pw = req.query.Password as string;
    const msg = await profileManagement.login( username, pw);
    res.send(msg);
  } )

  /**
   * This is the returnProfile API
   */
  server.get('/ReturnProfileInformation', async (req: Request, res: Response) => {
    const username = req.query.Username as string;
    let profile = await profileManagement.accessUser(username); //Maybe I should have a check for if profile is null ?
    profile.setMongoDB(null); 
    let JSONConversion = JSON.stringify( profile );
    profile.setMongoDB(db);
    res.send( JSONConversion );
  } )

  /**
   * This is the novels API test
   */
  server.get('/novelTest', async (req: Request, res: Response) => {
    const test2 = await scrapeLinks("https://fanstranslations.com/novel/in-place-of-losing-my-memory-i-remembered-that-i-was-the-fiancee-of-the-capture-target/", "chapter");
    res.send(test2);
  } )
  


    

  

  server.listen(3000);
}





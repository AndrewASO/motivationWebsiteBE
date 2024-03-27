# Motivation Website Backend

## Author
- Andrew Skevington-Olivera

## Introduction

The Motivation Website Backend serves as a versatile experimentation platform, designed to explore various new technologies, methodologies, and functionalities. This project is named for its role in motivating continued learning and development in backend technologies. It encompasses user authentication, task management, GPT model integration for chat-based interactions, and web scraping, among other features. This README outlines the architecture, features, setup instructions, and usage of the backend.

## Features

- **User Authentication and Profile Management**: Implements secure login/signup processes and comprehensive user profile management.
- **Task Management**: Provides the capability to add, delete, update, and analyze tasks, focusing on experimenting with CRUD operations.
- **GPT Model Integration**: Incorporates interactions with OpenAI's GPT model for exploring AI-driven text generation and processing.
- **Web Scraping**: Experiments with gathering data from the web, using scraping tools for a variety of purposes.
- **API Endpoint Experimentation**: Offers a broad range of API endpoints for exploring different backend functionalities, including user and task management, as well as dynamic content generation.

## Technologies and Tools

- **TypeScript**: Chosen for its strong typing, enhancing code reliability and maintainability.
- **MongoDB**: Utilized for its flexible document-oriented database system, perfect for managing varied data structures in experimental projects.
- **Express**: A minimal and flexible Node.js web application framework used for crafting server-side logic.
- **CORS**: Implemented to facilitate secure cross-origin requests and data sharing across different environments.
- **bcrypt**: Used for hashing passwords securely.
- **axios and cheerio**: Employed for web scraping functionalities, providing a means to extract and manipulate web content.
- **Mongoose**: A MongoDB object modeling tool designed to work in an asynchronous environment, enhancing database interactions.
- **OpenAI's GPT API**: Integrated to delve into AI-based text generation and analysis, exploring the capabilities of machine learning models.

## Project Structure Overview

- **gpt.ts**: Configures and manages interactions with the GPT model for AI-driven functionalities.
- **index.ts**: Acts as the entry point for initiating the web server.
- **mongoDB.ts**: Handles connections and operations with the MongoDB database.
- **profile.ts**: Manages user profiles, including authentication and operations on personal data.
- **profilesmanagement.ts**: Oversees user profile management, focusing on security and data handling.
- **scraper.ts**: Provides tools for web scraping, enabling the exploration of data gathering techniques.
- **tasks.ts**: Defines schemas and manages tasks, facilitating CRUD operations and data analysis.
- **webserver.ts**: Initializes and manages the HTTP server, orchestrating API requests and responses.

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- MongoDB instance accessible
- OpenAI API key for experimenting with the GPT model

### Installation

1. Clone the repository: `git clone https://github.com/AndrewASO/motivationWebsiteBE`.
2. Navigate to the project directory: `cd motivationWebsiteBE`.
3. Install dependencies: `npm install`.

### Running the Project

To start the server:
```bash
npm start

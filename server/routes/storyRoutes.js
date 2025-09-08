import express from 'express';
import upload from '../config/multer.js';
import auth from '../middleware/auth.js';
import { addUserStory, getStories, likeStory, deleteStory } from '../controller/storyController.js';
import storyQueue from '../queues/storyQueue.js';


const storyRouter=express.Router();

// Enforce auth before parsing potentially large multipart bodies
storyRouter.post('/create',auth,upload.single('media'),addUserStory);
storyRouter.get('/get',auth,getStories);
storyRouter.post('/like',auth,likeStory);
storyRouter.delete('/delete/:storyId',auth,deleteStory);

export default storyRouter;
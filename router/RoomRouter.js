import express from 'express';
import  {verifyToken}  from '../middleware/auth.js';
import { verifyIsAdmin } from '../middleware/role.js';
import { getRooms } from '../controller/RoomController.js';
const rotuer = express.Router();
rotuer.get('/', getRooms); 
export const RouterRooms = rotuer;

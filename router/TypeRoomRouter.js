import express from 'express';
import { verifyIsAdmin } from '../middleware/role.js';
import { getAllTypesRooms } from '../controller/TypesRoomController.js';
const rotuer = express.Router();
rotuer.get('/', verifyIsAdmin,getAllTypesRooms);
export const TypeRoomRouter = rotuer;

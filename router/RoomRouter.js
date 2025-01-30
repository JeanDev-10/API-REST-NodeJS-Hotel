import express from 'express';
import  {verifyToken}  from '../middleware/auth.js';
import { verifyIsAdmin } from '../middleware/role.js';
import { createRoom, getRooms } from '../controller/RoomController.js';
import { ValidateCreateRoom } from '../middleware/validations/ValidateCreateRoom.js';
import { uploadValidateImages } from '../middleware/validations/UploadImageValidator.js';
const rotuer = express.Router();
rotuer.get('/', getRooms); 
rotuer.post('/',verifyIsAdmin, uploadValidateImages,ValidateCreateRoom,createRoom); 
export const RouterRooms = rotuer;

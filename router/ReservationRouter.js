import express from 'express';
import { verifyIsAdmin,verifyIsClient } from '../middleware/role.js';
import { getAllReservationsWithDetails } from '../controller/ReservationController.js';
const rotuer = express.Router();
rotuer.get('/',verifyIsAdmin,getAllReservationsWithDetails);
/* rotuer.get('/client', verifyIsClient,getAllTypesRooms);
rotuer.get('/:id',getAllTypesRooms);
rotuer.post('/',verifyIsAdmin,getAllTypesRooms);
rotuer.patch('/:id', verifyIsClient,getAllTypesRooms); */
export const ReservationRouter = rotuer;

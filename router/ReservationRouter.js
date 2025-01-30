import express from 'express';
import { verifyIsAdmin,verifyIsClient } from '../middleware/role.js';
import { cancelReservation, getAllReservationsWithDetails, getMyReservations, getReservationById } from '../controller/ReservationController.js';
const rotuer = express.Router();
rotuer.get('/',verifyIsAdmin,getAllReservationsWithDetails);
rotuer.get('/client', verifyIsClient,getMyReservations);
rotuer.get('/:id',getReservationById);
/*rotuer.post('/',verifyIsAdmin,getAllTypesRooms);*/
rotuer.patch('/:id', verifyIsClient,cancelReservation);
export const ReservationRouter = rotuer;

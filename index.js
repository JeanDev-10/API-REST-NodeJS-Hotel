import express from "express";
import cors from "cors";
import { RouterUsuer } from "./router/UserRouter.js";
import "./models/associations.js";
import { verifyToken } from "./middleware/auth.js";
import { RouterRooms } from "./router/RoomRouter.js";
import { TypeRoomRouter } from "./router/TypeRoomRouter.js";
import { ReservationRouter } from "./router/ReservationRouter.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/v1/", RouterUsuer);
app.use("/api/v1/room", verifyToken, RouterRooms);
app.use("/api/v1/types-rooms", verifyToken, TypeRoomRouter);
app.use("/api/v1/reservation", verifyToken, ReservationRouter);
export default app;

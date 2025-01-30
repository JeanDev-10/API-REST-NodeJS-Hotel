import express from "express";
import { verifyIsAdmin } from "../middleware/role.js";
import {
  createRoom,
  getRoomById,
  getRooms,
  updateRoom,
} from "../controller/RoomController.js";
import { ValidateCreateRoom } from "../middleware/validations/ValidateCreateRoom.js";
import { uploadValidateImages } from "../middleware/validations/UploadImageValidator.js";
import { validateUpdateRoom } from "../middleware/validations/ValidateEditRoom.js";
import { uploadValidateOptionalImages } from "../middleware/validations/UploadOptionalImageValidator.js";
const rotuer = express.Router();
rotuer.get("/", getRooms);
rotuer.get("/:id", getRoomById);
rotuer.post(
  "/",
  verifyIsAdmin,
  uploadValidateImages,
  ValidateCreateRoom,
  createRoom
);
rotuer.put("/:id", verifyIsAdmin,uploadValidateOptionalImages, validateUpdateRoom, updateRoom);

export const RouterRooms = rotuer;

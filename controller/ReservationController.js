import { ImageModel } from "../models/Images.model.js";
import { ReservationModel } from "../models/Reservation.model.js";
import { RoomModel } from "../models/Rooms.model.js";
import { StatusReservationModel } from "../models/StatusReservation.model.js";
import { TypesRoomModel } from "../models/TypesRooms.model.js";
import { UserModel } from "../models/UserModel.js";

export const getAllReservationsWithDetails = async (req, res) => {
  try {
    // Obtener todas las reservaciones con sus relaciones
    const reservations = await ReservationModel.findAll({
      include: [
        { model: UserModel }, // Usuario que realizó la reservación
        { model: StatusReservationModel }, // Estado de la reservación
        {
          model: RoomModel,
          as: "room", // Habitación reservada
          include: [
            { model: TypesRoomModel }, // Tipo de habitación
            { model: ImageModel }, // Imágenes de la habitación
          ],
        },
      ],
    });

    // Si no hay reservaciones registradas
    if (!reservations || reservations.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron reservaciones" });
    }

    // Devolver la lista de reservaciones con sus relaciones
    return res
      .status(200)
      .json({ message: "Todas las reservaciones", data: reservations });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Error al obtener las reservaciones",
        error: error.message,
      });
  }
};

import { sequelize } from "../db/conexion.js";
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
    return res.status(500).json({
      message: "Error al obtener las reservaciones",
      error: error.message,
    });
  }
};
export const getMyReservations = async (req, res) => {
  try {
    const userId = req.user_id; // Obtener el ID del usuario logeado desde el token JWT

    // Obtener las reservaciones del usuario logeado con sus relaciones
    const reservations = await ReservationModel.findAll({
      where: { user_id: userId }, // Filtrar por el ID del usuario logeado
      include: [
        { model: StatusReservationModel }, // Estado de la reservación
        {
          model: RoomModel,
          // Habitación reservada
          include: [
            { model: TypesRoomModel }, // Tipo de habitación
            { model: ImageModel }, // Imágenes de la habitación
          ],
        },
      ],
    });

    // Si no hay reservaciones registradas para el usuario
    if (!reservations || reservations.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron reservaciones para este usuario" });
    }

    // Devolver la lista de reservaciones con sus relaciones
    return res
      .status(200)
      .json({ message: "Mis reservaciones", data: reservations });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener las reservaciones",
      error: error.message,
    });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const { id } = req.params; // ID de la reservación
    const userId = req.user_id; // ID del usuario logeado
    const userRole = req.role_id; // Rol del usuario logeado

    // Buscar la reservación con sus relaciones
    const reservation = await ReservationModel.findByPk(id, {
      include: [
        { model: UserModel }, // Usuario que realizó la reservación
        { model: StatusReservationModel }, // Estado de la reservación
        {
          model: RoomModel,
          // Habitación reservada
          include: [
            { model: TypesRoomModel }, // Tipo de habitación
            { model: ImageModel }, // Imágenes de la habitación
          ],
        },
      ],
    });

    // Si no se encuentra la reservación
    if (!reservation) {
      return res.status(404).json({ message: "Reservación no encontrada" });
    }

    // Verificar permisos
    if (userRole === 2 && reservation.user_id !== userId) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para ver esta reservación" });
    }

    // Devolver la reservación con sus relaciones
    return res
      .status(200)
      .json({ message: "Una reservación: ", data: reservation });
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener la reservación",
      error: error.message,
    });
  }
};
export const cancelReservation = async (req, res) => {
  const transaction = await sequelize.transaction(); // Iniciar una transacción
  try {
    const { id } = req.params; // ID de la reservación
    const userId = req.user_id; // ID del usuario logeado
    const userRole = req.role_id; // Rol del usuario logeado

    // Buscar la reservación
    const reservation = await ReservationModel.findByPk(id, { transaction });

    // Si no se encuentra la reservación
    if (!reservation) {
      await transaction.rollback();
      return res.status(404).json({ message: "Reservación no encontrada" });
    }

    // Verificar que la reservación le pertenezca al cliente
    if (userRole === 2 && reservation.user_id !== userId) {
      await transaction.rollback();
      return res
        .status(403)
        .json({ message: "No tienes permiso para cancelar esta reservación" });
    }
    // Verificar que la reservación esté en estado "Pendiente" (status_id == 1)
    if (reservation.status_id !== 1) {
      await transaction.rollback();
      return res
        .status(400)
        .json({
          message:
            "Solo se pueden cancelar reservaciones en estado 'Pendiente'",
        });
    }

    // Cambiar el estado de la reservación a "Cancelada" (status_id == 3)
    reservation.status_id = 3;
    await reservation.save({ transaction });

    // Confirmar la transacción
    await transaction.commit();
    return res
      .status(200)
      .json({ message: "Reservación cancelada correctamente" });
  } catch (error) {
    await transaction.rollback(); // Revertir la transacción en caso de error
    return res
      .status(500)
      .json({
        message: "Error al cancelar la reservación",
        error: error.message,
      });
  }
};

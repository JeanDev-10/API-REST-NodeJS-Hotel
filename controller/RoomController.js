import { RoomModel } from "../models/Rooms.model.js";
import { ImageModel } from "../models/Images.model.js";
import { TypesRoomModel } from "../models/TypesRooms.model.js";
import { Op } from "sequelize"; // Para condiciones en el filtro
import { sequelize } from "../db/conexion.js";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "../services/ImageService.js";
import { ReservationModel } from "../models/Reservation.model.js";
import { StatusReservationModel } from "../models/StatusReservation.model.js";

export const getRooms = async (req, res) => {
  try {
    const { type } = req.query; // Recibir el tipo de habitación como filtro opcional

    const whereCondition = type ? { name: { [Op.like]: `%${type}%` } } : {}; // Si hay filtro, lo aplica

    const rooms = await RoomModel.findAll({
      attributes: ["id", "name", "description", "price"], // Campos específicos
      include: [
        {
          model: ImageModel,
          attributes: ["id", "url"], // Seleccionar solo los campos necesarios
        },
        {
          model: TypesRoomModel,
          attributes: ["id", "name"],
          where: whereCondition, // Aplicar el filtro solo si se pasa un tipo de habitación
          required: !!type, // Si hay filtro, usa INNER JOIN; si no, usa LEFT JOIN
        },
      ],
    });

    return res.json({
      data: rooms,
      message: "Habitaciones obtenidas correctamente",
    });
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params; // ID de la habitación

    const currentDate = new Date();
    // Buscar la habitación con sus relaciones
    const room = await RoomModel.findByPk(id, {
      include: [
        { model: TypesRoomModel }, // Incluir el tipo de habitación
        { model: ImageModel },  // Incluir las imágenes
        {
          model: ReservationModel,
          attributes: ['date_start','date_end'],
           // Incluir las reservaciones
          where: {
            date_start: { [Op.gte]: currentDate }, // Solo reservaciones con fecha de inicio >= hoy
            status_id: 1, // Solo reservaciones con estado "Pendiente"
          },
          required: false, // Para que no falle si no hay reservaciones
        },
      ],
    });

    // Si no se encuentra la habitación
    if (!room) {
      return res.status(404).json({ message: "Habitación no encontrada" });
    }

    // Devolver la habitación con sus relaciones
    return res.status(200).json({ room });

  } catch (error) {
    return res.status(500).json({ message: "Error al obtener la habitación", error: error.message });
  }
};
export const createRoom = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { name, description, price, type_id } = req.body;
    const files = req.files.images; // Acceder a las imágenes subidas

    // Validar si hay imágenes
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Se debe subir al menos una imagen" });
    }

    // Crear la habitación dentro de la transacción
    const room = await RoomModel.create(
      { name, description, price, type_id },
      { transaction }
    );

    // Subir imágenes a Cloudinary y guardarlas en la BD
    const imageRecords = [];
    for (const file of files) { // Iterar sobre req.files.images
      const { url, public_id } = await uploadImageToCloudinary(file.buffer); // Usar file.buffer
      const imageRecord = await ImageModel.create(
        { room_id: room.id, url, public_id },
        { transaction }
      );
      imageRecords.push(imageRecord);
    }

    // Confirmar la transacción
    await transaction.commit();
    return res.status(201).json({ message: "Habitación creada", room, images: imageRecords });

  } catch (error) {
    console.log(error)
    await transaction.rollback(); // Si hay un error, revertir todo
    return res.status(500).json({ message: "Error al crear la habitación", error: error.message });
  }
};

export const updateRoom = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params; // ID de la habitación a editar
    const { name, description, price, type_id } = req.body;
    const files = req.files?.images; // Imágenes subidas (opcional)

    // Buscar la habitación existente
    const room = await RoomModel.findByPk(id, { transaction });
    if (!room) {
      await transaction.rollback();
      return res.status(404).json({ message: "Habitación no encontrada" });
    }

    // Actualizar los datos de la habitación
    if (name) room.name = name;
    if (description) room.description = description;
    if (price) room.price = price;
    if (type_id) room.type_id = type_id;
    await room.save({ transaction });

    // Si se suben nuevas imágenes
    if (files && files.length > 0) {
      // Eliminar las imágenes antiguas de Cloudinary y la base de datos
      const oldImages = await ImageModel.findAll({ where: { room_id: id }, transaction });
      for (const image of oldImages) {
        await deleteImageFromCloudinary(image.public_id); // Eliminar de Cloudinary
        await image.destroy({ transaction }); // Eliminar de la base de datos
      }

      // Subir las nuevas imágenes a Cloudinary y guardarlas en la base de datos
      const imageRecords = [];
      for (const file of files) {
        const { url, public_id } = await uploadImageToCloudinary(file.buffer);
        const imageRecord = await ImageModel.create(
          { room_id: id, url, public_id },
          { transaction }
        );
        imageRecords.push(imageRecord);
      }
    }

    // Confirmar la transacción
    await transaction.commit();
    return res.status(200).json({ message: "Habitación actualizada", room });

  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: "Error al actualizar la habitación", error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params; // ID de la habitación a eliminar

    // Buscar la habitación con sus reservaciones
    const room = await RoomModel.findByPk(id, {
      include: [
        { model: ReservationModel,
          include:{
            model: StatusReservationModel
          }
        }, // Incluir las reservaciones
        { model: ImageModel },             // Incluir las imágenes
      ],
      transaction,
    });

    // Si no se encuentra la habitación
    if (!room) {
      await transaction.rollback();
      return res.status(404).json({ message: "Habitación no encontrada" });
    }

    // Verificar si hay reservaciones activas (estado = 1)
    const hasActiveReservations = room.reservations.some(
      (reservation) => reservation.status_reservation.id === 1
    );

    if (hasActiveReservations) {
      await transaction.rollback();
      return res.status(400).json({ message: "No se puede eliminar la habitación porque tiene reservaciones activas" });
    }

    // Eliminar las imágenes de Cloudinary
    for (const image of room.images) {
      await deleteImageFromCloudinary(image.public_id); // Eliminar de Cloudinary
    }

    // Eliminar las imágenes de la base de datos
    await ImageModel.destroy({ where: { room_id: id }, transaction });

    // Eliminar la habitación
    await RoomModel.destroy({ where: { id }, transaction });

    // Confirmar la transacción
    await transaction.commit();
    return res.status(200).json({ message: "Habitación eliminada correctamente" });

  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ message: "Error al eliminar la habitación", error: error.message });
  }
};
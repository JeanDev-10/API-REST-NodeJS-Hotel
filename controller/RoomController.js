import { RoomModel } from "../models/Rooms.model.js";
import { ImageModel } from "../models/Images.model.js";
import { TypesRoomModel } from "../models/TypesRooms.model.js";
import { Op } from "sequelize"; // Para condiciones en el filtro

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

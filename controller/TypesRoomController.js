import { TypesRoomModel } from "../models/TypesRooms.model.js";

export const getAllTypesRooms = async (req, res) => {
  try {
    // Obtener todos los tipos de habitación
    const typesRooms = await TypesRoomModel.findAll();

    // Si no hay tipos de habitación registrados
    if (!typesRooms || typesRooms.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron tipos de habitación" });
    }

    // Devolver la lista de tipos de habitación
    return res
      .status(200)
      .json({ message: "Tipos de habitaciones", data: typesRooms });
  } catch (error) {
    return res
      .status(500)
      .json({
        message: "Error al obtener los tipos de habitación",
        error: error.message,
      });
  }
};

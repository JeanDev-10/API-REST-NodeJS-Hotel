import { TypesRoomModel } from "../models/TypesRooms.model.js";

export const seedTypeRooms = async () => {
  try {
    await TypesRoomModel.bulkCreate([
      {name: "Suite" },
      { name: "Estándar" },
      { name: "Familiar" },
    ]);
    console.log("Tipos de habitación insertados correctamente");
  } catch (error) {
    console.error("Error al insertar tipos de habitación:", error);
  }
};
import { StatusReservationModel } from "../models/StatusReservation.model.js";

export const seedStatusReservations = async () => {
  try {
    await StatusReservationModel.bulkCreate([
      {  name: "Pendiente" },
      {  name: "Confirmada" },
      {  name: "Cancelada" },
    ]);
    console.log("Estados de reservación insertados correctamente");
  } catch (error) {
    console.error("Error al insertar estados de reservación:", error);
  }
};
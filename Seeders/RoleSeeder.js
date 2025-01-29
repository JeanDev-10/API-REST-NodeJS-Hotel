import { RoleModel } from "../models/Roles.model.js";

export const seedRoles = async () => {
  try {
    await RoleModel.bulkCreate([
      {  name: "Admin" },
      {  name: "Client" },
    ]);
    console.log("Roles insertados correctamente");
  } catch (error) {
    console.error("Error al insertar roles:", error);
  }
};
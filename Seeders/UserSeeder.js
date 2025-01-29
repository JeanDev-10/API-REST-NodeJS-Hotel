import { UserModel} from "../models/UserModel.js";

export const seedUsers = async () => {
  try {
    await UserModel.bulkCreate([
      {  name: "Admin" ,lastname:"Admin", email:"admin@hotmail.com","password":"admin123", role_id:1},
    ]);
    console.log("Usuarios insertados correctamente");
  } catch (error) {
    console.error("Error al insertar roles:", error);
  }
};
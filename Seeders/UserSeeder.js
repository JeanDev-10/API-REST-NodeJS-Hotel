import { UserModel} from "../models/UserModel.js";
import bcrypt from "bcrypt";

export const seedUsers = async () => {
  try {
   const password=await bcrypt.hash("admin123",10);
    await UserModel.bulkCreate([
      {  name: "Admin" ,lastname:"Admin", email:"admin@hotmail.com",password, role_id:1},
    ]);
    console.log("Usuarios insertados correctamente");
  } catch (error) {
    console.error("Error al insertar roles:", error);
  }
};
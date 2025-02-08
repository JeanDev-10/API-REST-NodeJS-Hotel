import { UserModel} from "../models/UserModel.js";
import bcrypt from "bcrypt";

export const seedUsers = async () => {
  try {
   const password=await bcrypt.hash("admin123",10);
   const password2=await bcrypt.hash("juan123",10);
    await UserModel.bulkCreate([
      {  name: "Admin" ,image:"https://images.vexels.com/content/145908/preview/male-avatar-maker-2a7919.png",lastname:"Admin", email:"admin@hotmail.com",password, role_id:1},
      {  name: "Juan Andrés" ,image:"https://images.vexels.com/content/145908/preview/male-avatar-maker-2a7919.png",lastname:"Cedeño", email:"juan@hotmail.com",password:password2, role_id:2},
    ]);
    console.log("Usuarios insertados correctamente");
  } catch (error) {
    console.error("Error al insertar roles:", error);
  }
};
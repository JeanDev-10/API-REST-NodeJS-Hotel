import { sequelize } from "./db/conexion.js";
import { seedRoles } from "./Seeders/RoleSeeder.js";
import { seedStatusReservations } from "./Seeders/StatusReservationSeeder.js";
import { seedTypeRooms } from "./Seeders/TypeRoomSeeder.js";
import { seedUsers } from "./Seeders/UserSeeder.js";

const runSeeders = async () => {
  try {
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });

    await sequelize.drop(); // Esto elimina todas las tablas sin restricciones
    await sequelize.sync({ force: true }); // Aquí ya están establecidas las relaciones

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });

    console.log("Base de datos sincronizada");

    await seedRoles();
    await seedUsers();
    await seedStatusReservations();
    await seedTypeRooms();

    console.log("Seeding completado correctamente");
  } catch (error) {
    console.error("Error en el seeding:", error);
  } finally {
    await sequelize.close();
  }
};

runSeeders();

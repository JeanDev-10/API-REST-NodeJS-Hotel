import { sequelize } from "./db/conexion.js";
import app from "./index.js";
import { PORT } from "./config/config.js";
import { CheckStatusReservation } from "./tasks schedule/CheckStatusReservation.js";
const main = async () => {
  try {
    const _PORT = PORT || 3000;
    await sequelize.authenticate();
    console.log("Base de datos conectada.");
    await sequelize.sync({ alter: false });
    app.listen(_PORT, () => {
      console.log(`Servidor corriendo en el puerto => ${_PORT}`);
    });
    CheckStatusReservation();
  } catch (error) {
    console.log(`Error ${error}`);
  }
};
main();

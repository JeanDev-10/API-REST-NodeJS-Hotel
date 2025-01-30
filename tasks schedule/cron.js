import cron from 'node-cron';
import { Op } from 'sequelize';
import { ReservationModel } from '../models/Reservation.model.js';

// Programar una tarea que se ejecute cada minuto
export const CheckStatusReservation=()=>cron.schedule('* * * * *', async () => {
  try {
    console.log("SE EJECUTA CRON")
    const currentDate = new Date(); // Obtener la fecha y hora actual
    const currentDateString = currentDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD

    // Buscar reservaciones cuya fecha de inicio sea igual a la fecha actual
    const reservationsToUpdate = await ReservationModel.findAll({
      where: {
        date_start: {
          [Op.between]: [
            new Date(`${currentDateString}T00:00:00.000Z`), // Inicio del día
            new Date(`${currentDateString}T23:59:59.999Z`), // Fin del día
          ],
        },
        status_id: 1, // Solo reservaciones en estado "Pendiente" (status_id = 1)
      },
    });
    // Actualizar el estado de las reservaciones encontradas
    for (const reservation of reservationsToUpdate) {
      await reservation.update({ status_id: 2 }); // Cambiar a estado "Confirmada" (status_id = 2)
      console.log(`Reservación ${reservation.id} actualizada a estado "Confirmada".`);
    }
  } catch (error) {
    console.error('Error al actualizar reservaciones:', error);
  }
});
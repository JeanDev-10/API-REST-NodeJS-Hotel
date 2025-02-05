import request from "supertest";
import app from "../../index.js";
import { ReservationModel } from "../../models/Reservation.model.js";
import { UserModel } from "../../models/UserModel.js";
import { RoomModel } from "../../models/Rooms.model.js";
import { ImageModel } from "../../models/Images.model.js";
import { sequelize } from "../../db/conexion.js";
import { seedRoles } from "../../Seeders/RoleSeeder.js";
import { seedTypeRooms } from "../../Seeders/TypeRoomSeeder.js";
import { seedStatusReservations } from "../../Seeders/StatusReservationSeeder.js";
import { generateToken } from "../utils/utils.js";

// Configuración inicial
beforeAll(async () => {
  await sequelize.sync({ force: true }); // Sincronizar la base de datos
  await seedRoles(); // Crear roles necesarios
  await seedTypeRooms(); // Crear tipos de habitación
  await seedStatusReservations(); // Crear estados de reservación
});

beforeEach(async()=>{
    await sequelize.query("DELETE FROM reservations");

})
afterAll(async () => {
  await sequelize.close(); // Cerrar la conexión con la base de datos
});

describe("[POST /api/v1/reservation] - Crear una reservación", () => {
  let clientToken;
  let adminToken;
  let roomId;

  beforeAll(async () => {
    // Crear un usuario cliente
    const clientUser = await UserModel.create({
      name: "Client User",
      lastname: "Client Lastname",
      email: "client@example.com",
      password: "password123",
      role_id: 2, // Rol de cliente
    });
    // Crear un usuario administrador
    const adminUser = await UserModel.create({
      name: "Admin User",
      lastname: "Admin Lastname",
      email: "admin@example.com",
      password: "password123",
      role_id: 1, // Rol de administrador
    });

    // Generar token para el administrador
     adminToken = generateToken(adminUser);
    // Generar token para el cliente
    clientToken = generateToken(clientUser);

    // Crear una habitación
    const room = await RoomModel.create({
      name: "Room 101",
      description: "Habitación de lujo",
      price: 100, // Precio por noche
      type_id: 1, // Tipo de habitación
    });
    roomId = room.id;

    // Crear imágenes asociadas a la habitación
    await ImageModel.bulkCreate([
      {
        room_id: room.id,
        url: "https://example.com/image1.jpg",
        public_id: "image1",
      },
      {
        room_id: room.id,
        url: "https://example.com/image2.jpg",
        public_id: "image2",
      },
    ]);
  });

  it("debería crear una reservación exitosamente", async () => {
    const response = await request(app)
      .post("/api/v1/reservation")
      .send({
        date_start: "2027-12-01",
        date_end: "2027-12-03",
        room_id: roomId,
      })
      .set("Authorization", `Bearer ${clientToken}`); // Token de cliente

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(
      "message",
      "Reservación creada correctamente"
    );
    expect(response.body.reservation).toHaveProperty("id");
    expect(response.body.reservation.price_total).toBe(200); // 2 días * $100 por noche

    // Verificar que la reservación se guardó en la base de datos
    const reservation = await ReservationModel.findByPk(
      response.body.reservation.id
    );
    expect(reservation).not.toBeNull();
    expect(reservation.status_id).toBe(1); // Estado "Pendiente"
  });
  it("debería fallar si un administrador intenta crear una reservación", async () => {
    const response = await request(app)
      .post("/api/v1/reservation")
      .send({
        date_start: "2027-12-01",
        date_end: "2027-12-03",
        room_id: roomId,
      })
      .set("Authorization", `Bearer ${adminToken}`); // Token de administrador

    expect(response.status).toBe(403); // Forbidden
    expect(response.body.message).toBe(
      "No autorizado"
    );
  });
  it("debería fallar si la fecha de inicio es anterior a la fecha actual", async () => {
    const response = await request(app)
      .post("/api/v1/reservation")
      .send({
        date_start: "2020-01-01", // Fecha en el pasado
        date_end: "2026-12-03",
        room_id: roomId,
      })
      .set("Authorization", `Bearer ${clientToken}`);

    expect(response.status).toBe(422);
    expect(response.body.errors[0].msg).toBe(
      "La fecha de inicio no puede ser inferior a la fecha actual"
    );
  });

  it("debería fallar si la fecha de fin es menor que la fecha de inicio", async () => {
    const response = await request(app)
      .post("/api/v1/reservation")
      .send({
        date_start: "2027-12-03",
        date_end: "2027-12-01", // Fecha de fin menor que la de inicio
        room_id: roomId,
      })
      .set("Authorization", `Bearer ${clientToken}`);

    expect(response.status).toBe(422);
    expect(response.body.errors[0].msg).toBe(
      "La fecha de fin no puede ser menor a la fecha de inicio"
    );
  });

  it("debería fallar si la habitación no existe", async () => {
    const response = await request(app)
      .post("/api/v1/reservation")
      .send({
        date_start: "2026-12-01",
        date_end: "2026-12-03",
        room_id: 999, // ID de habitación inexistente
      })
      .set("Authorization", `Bearer ${clientToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Habitación no encontrada");
  });

  it("debería fallar si la habitación ya está reservada en ese rango de fechas", async () => {
    // Crear una reservación existente
    await ReservationModel.create({
      room_id: roomId,
      user_id: 1, // ID del cliente
      price_total: 200,
      date_start: "2026-01-01",
      date_end: "2026-01-03",
      status_id: 1, // Estado "Pendiente"
    });

    const response = await request(app)
      .post("/api/v1/reservation")
      .send({
        date_start: "2026-01-02", // Fecha dentro del rango ya reservado
        date_end: "2026-01-04",
        room_id: roomId,
      })
      .set("Authorization", `Bearer ${clientToken}`);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "La habitación ya está reservada en ese rango de fechas"
    );
  });
});

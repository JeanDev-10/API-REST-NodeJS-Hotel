import request from "supertest";
import app from "../../index.js";
import { ReservationModel } from "../../models/Reservation.model.js";
import { UserModel } from "../../models/UserModel.js";
import { RoomModel } from "../../models/Rooms.model.js";
import { ImageModel } from "../../models/Images.model.js";
import { TypesRoomModel } from "../../models/TypesRooms.model.js";
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

beforeEach(async () => {
  // Limpiar todas las tablas antes de cada test
});

afterAll(async () => {
  await sequelize.close(); // Cerrar la conexión con la base de datos
});

describe("[GET /api/v1/reservation/client] - Obtener las reservaciones del usuario cliente", () => {
  let clientToken;
  let adminToken;

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

    // Generar tokens para cliente y administrador
    clientToken = generateToken(clientUser);
    adminToken = generateToken(adminUser);

    

    // Crear una habitación
    const room = await RoomModel.create({
      name: "Room 101",
      description: "Habitación de lujo",
      price: 200,
      type_id: 1,
    });

    // Crear imágenes asociadas a la habitación
    await ImageModel.bulkCreate([
      { room_id: room.id, url: "https://example.com/image1.jpg", public_id: "image1" },
      { room_id: room.id, url: "https://example.com/image2.jpg", public_id: "image2" },
    ]);

    // Crear una reservación para el cliente
    await ReservationModel.create({
      room_id: room.id,
      user_id: clientUser.id,
      price_total: 200,
      date_start: new Date(),
      date_end: new Date(),
      status_id: 1, // Estado activo
    });
  });

  it("debería obtener las reservaciones del usuario cliente (usuario autenticado y cliente)", async () => {
    const response = await request(app)
      .get("/api/v1/reservation/client")
      .set("Authorization", `Bearer ${clientToken}`); // Token de cliente

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Mis reservaciones");
    expect(response.body).toHaveProperty("data");

    // Verificar que se incluyeron las relaciones
    const reservations = response.body.data;
    expect(reservations.length).toBeGreaterThan(0);

    const reservation = reservations[0];
    expect(reservation).toHaveProperty("status_reservation"); // Estado de la reservación
    expect(reservation).toHaveProperty("room"); // Habitación reservada
    expect(reservation.room).toHaveProperty("types_room"); // Tipo de habitación
    expect(reservation.room).toHaveProperty("images"); // Imágenes de la habitación
  });

  it("debería devolver un error 404 si no hay reservaciones registradas para el usuario cliente", async () => {
    // Limpiar la tabla de reservaciones
    await sequelize.query("DELETE FROM reservations");

    const response = await request(app)
      .get("/api/v1/reservation/client")
      .set("Authorization", `Bearer ${clientToken}`); // Token de cliente

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty(
      "message",
      "No se encontraron reservaciones para este usuario"
    );
  });

  it("debería devolver un error 403 si el usuario no es cliente (es administrador)", async () => {
    const response = await request(app)
      .get("/api/v1/reservation/client")
      .set("Authorization", `Bearer ${adminToken}`); // Token de administrador

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message", "No autorizado");
  });
});
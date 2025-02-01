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

describe("[GET /api/v1/reservation/:id] - Obtener una reservación por ID", () => {
  let adminToken;
  let clientToken;
  let clientReservationId;
  let otherClientReservationId;

  beforeAll(async () => {
    // Crear un usuario administrador
    const adminUser = await UserModel.create({
      name: "Admin User",
      lastname: "Admin Lastname",
      email: "admin@example.com",
      password: "password123",
      role_id: 1, // Rol de administrador
    });

    // Crear un usuario cliente
    const clientUser = await UserModel.create({
      name: "Client User",
      lastname: "Client Lastname",
      email: "client@example.com",
      password: "password123",
      role_id: 2, // Rol de cliente
    });

    // Crear otro usuario cliente
    const otherClientUser = await UserModel.create({
      name: "Other Client User",
      lastname: "Other Client Lastname",
      email: "otherclient@example.com",
      password: "password123",
      role_id: 2, // Rol de cliente
    });

    // Generar tokens para admin y cliente
    adminToken = generateToken(adminUser);
    clientToken = generateToken(clientUser);

    

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
    const clientReservation = await ReservationModel.create({
      room_id: room.id,
      user_id: clientUser.id,
      price_total: 200,
      date_start: new Date(),
      date_end: new Date(),
      status_id: 1, // Estado activo
    });
    clientReservationId = clientReservation.id;

    // Crear una reservación para otro cliente
    const otherClientReservation = await ReservationModel.create({
      room_id: room.id,
      user_id: otherClientUser.id,
      price_total: 300,
      date_start: new Date(),
      date_end: new Date(),
      status_id: 1, // Estado activo
    });
    otherClientReservationId = otherClientReservation.id;
  });

  it("debería obtener una reservación existente (usuario administrador)", async () => {
    const response = await request(app)
      .get(`/api/v1/reservation/${clientReservationId}`)
      .set("Authorization", `Bearer ${adminToken}`); // Token de administrador

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Una reservación: ");
    expect(response.body).toHaveProperty("data");

    // Verificar que se incluyeron las relaciones
    const reservation = response.body.data;
    expect(reservation).toHaveProperty("id", clientReservationId);
    expect(reservation).toHaveProperty("user"); // Usuario que realizó la reservación
    expect(reservation).toHaveProperty("status_reservation"); // Estado de la reservación
    expect(reservation).toHaveProperty("room"); // Habitación reservada
    expect(reservation.room).toHaveProperty("types_room"); // Tipo de habitación
    expect(reservation.room).toHaveProperty("images"); // Imágenes de la habitación
  });

  it("debería obtener una reservación existente (usuario cliente viendo su propia reservación)", async () => {
    const response = await request(app)
      .get(`/api/v1/reservation/${clientReservationId}`)
      .set("Authorization", `Bearer ${clientToken}`); // Token de cliente

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Una reservación: ");
    expect(response.body).toHaveProperty("data");

    // Verificar que se incluyeron las relaciones
    const reservation = response.body.data;
    expect(reservation).toHaveProperty("id", clientReservationId);
    expect(reservation).toHaveProperty("user"); // Usuario que realizó la reservación
    expect(reservation).toHaveProperty("status_reservation"); // Estado de la reservación
    expect(reservation).toHaveProperty("room"); // Habitación reservada
    expect(reservation.room).toHaveProperty("types_room"); // Tipo de habitación
    expect(reservation.room).toHaveProperty("images"); // Imágenes de la habitación
  });

  it("debería devolver un error 403 si un cliente intenta ver una reservación que no es suya", async () => {
    const response = await request(app)
      .get(`/api/v1/reservation/${otherClientReservationId}`)
      .set("Authorization", `Bearer ${clientToken}`); // Token de cliente

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty(
      "message",
      "No tienes permiso para ver esta reservación"
    );
  });

  it("debería devolver un error 404 si la reservación no existe", async () => {
    const nonExistentReservationId = 9999;

    const response = await request(app)
      .get(`/api/v1/reservation/${nonExistentReservationId}`)
      .set("Authorization", `Bearer ${adminToken}`); // Token de administrador

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Reservación no encontrada");
  });


});
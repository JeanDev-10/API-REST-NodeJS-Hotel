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

beforeEach(async () => {
  // Limpiar todas las tablas antes de cada test
});

afterAll(async () => {
  await sequelize.close(); // Cerrar la conexión con la base de datos
});



describe("[GET /api/v1/reservation] - Obtener todas las reservaciones con detalles", () => {
  let adminToken;
  let clientToken;

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

    // Generar tokens para admin y cliente
    adminToken = generateToken(adminUser);
    clientToken = generateToken(clientUser);

    // Crear un tipo de habitación
    

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

    // Crear una reservación
    await ReservationModel.create({
      room_id: room.id,
      user_id: clientUser.id,
      price_total: 200,
      date_start: new Date(),
      date_end: new Date(),
      status_id: 1, // Estado activo
    });
  });

  it("debería obtener todas las reservaciones con detalles (usuario administrador)", async () => {
    const response = await request(app)
      .get("/api/v1/reservation")
      .set("Authorization", `Bearer ${adminToken}`); // Token de administrador

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Todas las reservaciones");
    expect(response.body).toHaveProperty("data");

    // Verificar que se incluyeron las relaciones
    const reservations = response.body.data;
    expect(reservations.length).toBeGreaterThan(0);

    const reservation = reservations[0];
    expect(reservation).toHaveProperty("user"); // Usuario que realizó la reservación
    expect(reservation).toHaveProperty("status_reservation"); // Estado de la reservación
    expect(reservation).toHaveProperty("room"); // Habitación reservada
    expect(reservation.room).toHaveProperty("types_room"); // Tipo de habitación
    expect(reservation.room).toHaveProperty("images"); // Imágenes de la habitación
  });

  it("debería devolver un error 403 si el usuario no es administrador", async () => {
    const response = await request(app)
      .get("/api/v1/reservation")
      .set("Authorization", `Bearer ${clientToken}`); // Token de cliente

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message", "No autorizado");
  });
});
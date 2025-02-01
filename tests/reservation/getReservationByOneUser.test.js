import request from "supertest";
import app from "../../index.js"; // Importa tu aplicación Express
import { sequelize } from "../../db/conexion.js";
import { UserModel } from "../../models/UserModel.js";
import { ReservationModel } from "../../models/Reservation.model.js";
import { RoomModel } from "../../models/Rooms.model.js";
import { ImageModel } from "../../models/Images.model.js";
import { TypesRoomModel } from "../../models/TypesRooms.model.js";
import { StatusReservationModel } from "../../models/StatusReservation.model.js";
import jwt from "jsonwebtoken";
import { seedRoles } from "../../Seeders/RoleSeeder.js";
import { seedUsers } from "../../Seeders/UserSeeder.js";

// Configuración inicial
beforeAll(async () => {
  await sequelize.sync({ force: true }); // Sincronizar la base de datos
});

beforeEach(async () => {
  // Limpiar todas las tablas antes de cada test
  await sequelize.query("DELETE FROM users");
  await sequelize.query("DELETE FROM reservations");
  await sequelize.query("DELETE FROM rooms");
  await sequelize.query("DELETE FROM images");
  await sequelize.query("DELETE FROM types_rooms");
  await sequelize.query("DELETE FROM status_reservations");
});

afterAll(async () => {
  await sequelize.close(); // Cerrar la conexión con la base de datos
});

// Generar un token JWT válido para las pruebas
const generateToken = (userId, isAdmin = true) => {
  return jwt.sign({ user_id: userId, isAdmin }, "secretToken", {
    expiresIn: "1h",
  });
};

describe("[GET /user/:id/reservations] - Obtener reservas de un usuario", () => {
  beforeAll(async () => {});
  it("debería devolver las reservas de un usuario existente", async () => {
    // Crear datos de prueba
    await seedRoles();
    // Crear un usuario admin
    const adminUser = await UserModel.create({
      id: 1,
      name: "Admin",
      lastname: "User",
      email: "admin@example.com",
      password: "password123",
      role_id: 1, // Rol de admin
    });

    // Crear un usuario cliente
    const clientUser = await UserModel.create({
      id: 2,
      name: "Client",
      lastname: "User",
      email: "client@example.com",
      password: "password123",
      role_id: 2, // Rol de cliente
    });
    // Generar tokens para admin y cliente
    const adminToken = generateToken(adminUser.id, true); // Admin
    const clientToken = generateToken(clientUser.id, false); // Cliente
    const roomType = await TypesRoomModel.create({ name: "Suite" });
    const room = await RoomModel.create({
      name: "Room 101",
      description: "asdasds",
      types_room_id: roomType.id,
      price: 20,
    });
    await ImageModel.create({
      url: "image.jpg",
      room_id: room.id,
      public_id: "1",
    });

    const status = await StatusReservationModel.create({ name: "Pendiente" });
    await ReservationModel.create({
      user_id: 2,
      room_id: room.id,
      status_reservation_id: status.id,
      date_start: "2023-10-01",
      date_end: "2023-10-05",
      price_total: 200,
    });

    // Hacer la solicitud
    const response = await request(app)
      .get(`/api/v1/user/2/reservations`)
      .set("Authorization", `Bearer ${adminToken}`);

    // Verificar la respuesta
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "usuario con reservas y habitaciones"
    );
    expect(response.body.data).toHaveProperty("id", 2);
    expect(response.body.data.reservations).toBeDefined();
    expect(response.body.data.reservations.length).toBe(1);
    expect(response.body.data.reservations[0].room).toBeDefined();
    expect(response.body.data.reservations[0].room.images).toBeDefined();
    expect(response.body.data.reservations[0].room.types_room).toBeDefined();
    expect(response.body.data.reservations[0].status_reservation).toBeDefined();
  });
  it("no debe devolver las reservas de un usuario existente por ser no autorizado", async () => {
    // Crear datos de prueba
    // Crear datos de prueba
    await seedRoles();
    // Crear un usuario admin
    const adminUser = await UserModel.create({
      id: 1,
      name: "Admin",
      lastname: "User",
      email: "admin@example.com",
      password: "password123",
      role_id: 1, // Rol de admin
    });

    // Crear un usuario cliente
    const clientUser = await UserModel.create({
      id: 2,
      name: "Client",
      lastname: "User",
      email: "client@example.com",
      password: "password123",
      role_id: 2, // Rol de cliente
    });
    // Generar tokens para admin y cliente
    const clientToken = generateToken(clientUser.id, false); // Cliente
    const roomType = await TypesRoomModel.create({ name: "Suite" });
    const room = await RoomModel.create({
      name: "Room 101",
      description: "asdasds",
      types_room_id: roomType.id,
      price: 20,
    });
    await ImageModel.create({
      url: "image.jpg",
      room_id: room.id,
      public_id: "1",
    });

    const status = await StatusReservationModel.create({ name: "Pendiente" });
    await ReservationModel.create({
      user_id: 2,
      room_id: room.id,
      status_reservation_id: status.id,
      date_start: "2023-10-01",
      date_end: "2023-10-05",
      price_total: 200,
    });

    // Hacer la solicitud
    const response = await request(app)
      .get(`/api/v1/user/4/reservations`)
      .set("Authorization", `Bearer ${clientToken}`);

    // Verificar la respuesta
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message", "No autorizado");
  });

  it("debería devolver un error 404 si el usuario no existe", async () => {
    // Generar un token JWT válido
    const token = generateToken(999); // ID de usuario que no existe

    // Hacer la solicitud
    const response = await request(app)
      .get("/api/v1/user/999/reservations")
      .set("Authorization", `Bearer ${token}`);

    // Verificar la respuesta
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message");
  });
});

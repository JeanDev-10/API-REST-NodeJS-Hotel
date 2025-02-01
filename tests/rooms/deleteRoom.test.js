import request from "supertest";
import app from "../../index.js";
import { RoomModel } from "../../models/Rooms.model.js";
import { UserModel } from "../../models/UserModel.js";
import { generateToken } from "../utils/utils.js"; // Función para generar tokens
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { sequelize } from "../../db/conexion.js";
import { seedRoles } from "../../Seeders/RoleSeeder.js";
import { seedTypeRooms } from "../../Seeders/TypeRoomSeeder.js";
import { ReservationModel } from "../../models/Reservation.model.js";
import { seedStatusReservations } from "../../Seeders/StatusReservationSeeder.js";

// Obtener __dirname en módulos de ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



// Configuración inicial
beforeAll(async () => {
  await sequelize.sync({ force: true }); // Sincronizar la base de datos
  await seedRoles(); // Crear roles necesarios
  await seedTypeRooms(); // Crear tipos de habitación
  await seedStatusReservations(); // Crear estados de reservación
});

beforeEach(async () => {
  // Limpiar todas las tablas antes de cada test
  await sequelize.query("DELETE FROM reservations");
  await sequelize.query("DELETE FROM images");
});

afterAll(async () => {
  await sequelize.close(); // Cerrar la conexión con la base de datos
});

// Ruta a una imagen de prueba
const imagePath = path.resolve(__dirname, "image-test.png");
const imageBuffer = fs.readFileSync(imagePath);

describe("[DELETE /api/v1/room/:id] - Eliminar habitación", () => {
  let adminToken;
  let roomId;

  beforeAll(async () => {
    // Crear un usuario admin
    const adminUser = await UserModel.create({
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

    // Generar token para admin
    adminToken = generateToken(adminUser);

    // Crear una habitación de prueba con imágenes
    const room = await RoomModel.create({
      name: "Room 101",
      description: "Habitación de lujo",
      price: 200,
      type_id: 1,
    });
    roomId = room.id;

  });

  it("debería devolver un error 404 si la habitación no existe", async () => {
    const nonExistentRoomId = 9999;

    const response = await request(app)
      .delete(`/api/v1/room/${nonExistentRoomId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Habitación no encontrada");
  });

  it("debería devolver un error 400 si la habitación tiene reservaciones activas", async () => {
    // Crear una reservación activa para la habitación
    await ReservationModel.create({
      room_id: roomId,
      user_id: 2,
      price_total: 200,
      date_start: new Date(),
      date_end: new Date(),
      status_id: 1, // Estado activo
    });

    const response = await request(app)
      .delete(`/api/v1/room/${roomId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty(
      "message",
      "No se puede eliminar la habitación porque tiene reservaciones activas"
    );
  });

  it("debería devolver un error 403 si el usuario no es admin", async () => {
    // Crear un usuario cliente
    const clientUser = await UserModel.create({
      name: "Client",
      lastname: "User",
      email: "client@example.com",
      password: "password123",
      role_id: 2, // Rol de cliente
    });

    // Generar token para cliente
    const clientToken = generateToken(clientUser);

    const response = await request(app)
      .delete(`/api/v1/room/${roomId}`)
      .set("Authorization", `Bearer ${clientToken}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message", "No autorizado");
  });
});
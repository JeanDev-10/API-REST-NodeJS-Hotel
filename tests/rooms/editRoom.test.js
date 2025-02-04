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

// Obtener __dirname en módulos de ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración inicial
beforeAll(async () => {
  await sequelize.sync({ force: true }); // Sincronizar la base de datos
  await seedRoles(); // Crear roles necesarios
  await seedTypeRooms(); // Crear tipos de habitación
});

beforeEach(async () => {
  // Limpiar todas las tablas antes de cada test
  await sequelize.query("DELETE FROM images");
});

afterAll(async () => {
  await sequelize.close(); // Cerrar la conexión con la base de datos
});

// Ruta a una imagen de prueba
const imagePath = path.resolve(__dirname, "image-test.png");
const imageBuffer = fs.readFileSync(imagePath);

describe("[PUT /api/v1/room/:id] - Actualizar habitación", () => {
  let adminToken;
  let clientToken;
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
      name: "Client",
      lastname: "User",
      email: "client@example.com",
      password: "password123",
      role_id: 2, // Rol de cliente
    });

    // Generar tokens para admin y cliente
    adminToken = generateToken(adminUser);
    clientToken = generateToken(clientUser);

    // Crear una habitación de prueba
    const room = await RoomModel.create({
      name: "Room 101",
      description: "Habitación de lujo",
      price: 200,
      type_id: 1,
    });
    
    roomId = room.id;
  });

  it("debería actualizar una habitación sin imágenes (admin)", async () => {
    const updatedData = {
      name: "Room 102",
      description: "Habitación actualizada",
      price: 250,
      type_id: 2,
    };

    const response = await request(app)
      .put(`/api/v1/room/${roomId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", updatedData.name)
      .field("description", updatedData.description)
      .field("price", updatedData.price)
      .field("type_id", updatedData.type_id);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("message", "Habitación actualizada");
    expect(response.body.room).toHaveProperty("name", updatedData.name);
    expect(response.body.room).toHaveProperty("description", updatedData.description);
    expect(Number(response.body.room.price)).toBe(updatedData.price);
    expect(Number(response.body.room.type_id)).toBe(updatedData.type_id);
  });

  it("debería devolver un error 403 si el usuario no es admin (cliente)", async () => {
    const updatedData = {
      name: "Room 104",
      description: "Habitación no autorizada",
      price: 400,
      type_id: 1,
    };

    const response = await request(app)
      .put(`/api/v1/room/${roomId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .field("name", updatedData.name)
      .field("description", updatedData.description)
      .field("price", updatedData.price)
      .field("type_id", updatedData.type_id);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message", "No autorizado");
  });

  it("debería devolver un error 404 si la habitación no existe", async () => {
    const nonExistentRoomId = 9999;
    const updatedData = {
      name: "Room 105",
      description: "Habitación inexistente",
      price: 500,
      type_id: 1,
    };

    const response = await request(app)
      .put(`/api/v1/room/${nonExistentRoomId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", updatedData.name)
      .field("description", updatedData.description)
      .field("price", updatedData.price)
      .field("type_id", updatedData.type_id);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Habitación no encontrada");
  });

  it("debería devolver un error 422 si los datos son inválidos", async () => {
    const invalidData = {
      name: "", // Nombre vacío
      description: "", // Descripción vacía
      price: -100, // Precio negativo
      type_id: 999, // Tipo de habitación inexistente
    };

    const response = await request(app)
      .put(`/api/v1/room/${roomId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", invalidData.name)
      .field("description", invalidData.description)
      .field("price", invalidData.price)
      .field("type_id", invalidData.type_id);

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});
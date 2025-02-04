import request from "supertest";
import app from "../../index.js"; // Importa tu aplicación Express
import { sequelize } from "../../db/conexion.js";
import { UserModel } from "../../models/UserModel.js";
import { seedRoles } from "../../Seeders/RoleSeeder.js";
import { seedTypeRooms } from "../../Seeders/TypeRoomSeeder.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { generateToken } from "../utils/utils.js";

// Obtener __dirname en módulos de ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// Configuración inicial
beforeAll(async () => {
  await sequelize.sync({ force: true }); // Sincronizar la base de datos

  // Crear roles necesarios
  await seedRoles();
  await seedTypeRooms();
});

beforeEach(async () => {
  // Limpiar todas las tablas antes de cada test
  await sequelize.query("DELETE FROM rooms");
  await sequelize.query("DELETE FROM images");
});

afterAll(async () => {
  await sequelize.close(); // Cerrar la conexión con la base de datos
});

// Generar un token JWT válido para las pruebas


describe("[POST /api/v1/room] - Crear habitación", () => {
  let adminToken;
  let clientToken;
  const imagePath = path.resolve(__dirname, "image-test.png"); // Ruta a una imagen de prueba
  const imageBuffer = fs.readFileSync(imagePath);
  beforeAll(async () => {
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
    adminToken = generateToken(adminUser); // Token para admin
    clientToken = generateToken(clientUser); // Token para cliente
  });
  it("debería crear una habitación con imágenes (admin)", async () => {

    // Datos de la habitación
    const roomData = {
      name: "Room 101",
      description: "Habitación de lujo",
      price: 200,
      type_id: 1,
    };


    // Hacer la solicitud como admin
    const response = await request(app)
      .post("/api/v1/room")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", roomData.name)
      .field("description", roomData.description)
      .field("price", roomData.price)
      .field("type_id", roomData.type_id)
      .attach("images", imageBuffer, "test-image.jpg") // Adjuntar imágenes
      .attach("images", imageBuffer, "test-image.jpg");
      console.log(response)
    // Verificar la respuesta

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message", "Habitación creada");
    expect(response.body.room).toBeDefined();
    expect(response.body.room).toHaveProperty("name", roomData.name);
    expect(response.body.room).toHaveProperty("description", roomData.description);
    expect(Number(response.body.room.price)).toBe(200);
    expect(Number(response.body.room.type_id)).toBe(roomData.type_id);
    expect(response.body.images).toBeDefined();
    expect(response.body.images.length).toBe(2);
  });

  it("debería devolver un error 403 si el usuario no es admin (cliente)", async () => {

    // Datos de la habitación
    const roomData = {
      name: "Room 101",
      description: "Habitación de lujo",
      price: 200,
      type_id: 1,
    };

    // Imágenes simuladas
    const images = [Buffer.from("imagen1")];

    // Hacer la solicitud como cliente
    const response = await request(app)
      .post("/api/v1/room")
      .set("Authorization", `Bearer ${clientToken}`)
      .field("name", roomData.name)
      .field("description", roomData.description)
      .field("price", roomData.price)
      .field("type_id", roomData.type_id)
      .attach("images", images[0], "image1.jpg");

    // Verificar la respuesta
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty("message", "No autorizado");
  });

  it("debería devolver un error 422 si no se suben imágenes", async () => {
    // Datos de la habitación
    const roomData = {
      name: "Room 101",
      description: "Habitación de lujo",
      price: 200,
      type_id: 1,
    };

    // Hacer la solicitud como admin sin imágenes
    const response = await request(app)
      .post("/api/v1/room")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", roomData.name)
      .field("description", roomData.description)
      .field("price", roomData.price)
      .field("type_id", roomData.type_id);

    // Verificar la respuesta
    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty(
      "message",
      "Se debe subir al menos una imagen"
    );
  });

  it("debería devolver un error 422 si los datos de la habitación son inválidos", async () => {
    // Datos de la habitación inválidos
    const roomData = {
      name: "", // Nombre vacío
      description: "", // Descripción vacía
      price: -100, // Precio negativo
      type_id: 999, // Tipo de habitación inexistente
    };

    // Imágenes simuladas
    const images = [Buffer.from("imagen1")];

    // Hacer la solicitud como admin
    const response = await request(app)
      .post("/api/v1/room")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("name", roomData.name)
      .field("description", roomData.description)
      .field("price", roomData.price)
      .field("type_id", roomData.type_id)
      .attach("images", images[0], "image1.jpg");

    // Verificar la respuesta
    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty("errors");
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  
});
import request from "supertest";
import app from "../../index.js";
import { RoomModel } from "../../models/Rooms.model.js";
import { ImageModel } from "../../models/Images.model.js";
import { UserModel } from "../../models/UserModel.js";
import { sequelize } from "../../db/conexion.js";
import { seedRoles } from "../../Seeders/RoleSeeder.js";
import { seedTypeRooms } from "../../Seeders/TypeRoomSeeder.js";
import { generateToken } from "../utils/utils.js";

// Configuración inicial
beforeAll(async () => {
  await sequelize.sync({ force: true }); // Sincronizar la base de datos
  await seedRoles(); // Crear roles necesarios
  await seedTypeRooms(); // Crear tipos de habitación
});

beforeEach(async () => {
  // Limpiar todas las tablas antes de cada test
  await sequelize.query("DELETE FROM users");
});

afterAll(async () => {
  await sequelize.close(); // Cerrar la conexión con la base de datos
});



describe("[GET /api/v1/room/:id] - Obtener habitación por ID", () => {
  let roomId;
  let userToken;

  beforeAll(async () => {
    // Crear un usuario de prueba
    const user = await UserModel.create({
      name: "Test User",
      lastname: "Test Lastname",
      email: "test@example.com",
      password: "password123",
      role_id: 1, // Rol de admin
    });

    // Generar un token para el usuario
    userToken = generateToken(user);

   

    // Crear una habitación de prueba con imágenes
    const room = await RoomModel.create({
      name: "Room 101",
      description: "Habitación de lujo",
      price: 200,
      type_id: 1,
    });
    roomId = room.id;

    // Crear imágenes asociadas a la habitación
    await ImageModel.bulkCreate([
      { room_id: roomId, url: "https://example.com/image1.jpg", public_id: "image1" },
      { room_id: roomId, url: "https://example.com/image2.jpg", public_id: "image2" },
    ]);
  });

  it("debería obtener una habitación existente con sus relaciones (usuario autenticado)", async () => {
    const response = await request(app)
      .get(`/api/v1/room/${roomId}`)
      .set("Authorization", `Bearer ${userToken}`); // Incluir el token en la cabecera

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("room");

    // Verificar que la habitación tiene las relaciones correctas
    const room = response.body.room;
    expect(room).toHaveProperty("id", roomId);
    expect(room).toHaveProperty("name", "Room 101");
    expect(room).toHaveProperty("description", "Habitación de lujo");
    expect(room).toHaveProperty("price", 200);
    expect(room).toHaveProperty("type_id");

    // Verificar que se incluyó el tipo de habitación
    expect(room.types_room).toBeDefined();
    expect(room.types_room).toHaveProperty("name", "Suite");

    // Verificar que se incluyeron las imágenes
    expect(room.images).toBeDefined();
    expect(room.images.length).toBe(2);
    expect(room.images[0]).toHaveProperty("url", "https://example.com/image1.jpg");
    expect(room.images[1]).toHaveProperty("url", "https://example.com/image2.jpg");
  });


  it("debería devolver un error 404 si la habitación no existe (usuario autenticado)", async () => {
    const nonExistentRoomId = 9999;

    const response = await request(app)
      .get(`/api/v1/room/${nonExistentRoomId}`)
      .set("Authorization", `Bearer ${userToken}`); // Incluir el token en la cabecera

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Habitación no encontrada");
  });
});
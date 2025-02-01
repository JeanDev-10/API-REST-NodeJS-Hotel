import request from "supertest";
import app from "../../index.js"; // Importa tu aplicación Express
import { sequelize } from "../../db/conexion.js";
import { RoomModel } from "../../models/Rooms.model.js";
import { ImageModel } from "../../models/Images.model.js";
import { TypesRoomModel } from "../../models/TypesRooms.model.js";
import { UserModel } from "../../models/UserModel.js";
import { RoleModel } from "../../models/Roles.model.js";
import { generateToken } from "../utils/utils.js";

// Configuración inicial
beforeAll(async () => {
  await sequelize.sync({ force: true }); // Sincronizar la base de datos

  // Crear roles necesarios
  await RoleModel.create({ id: 1, name: "admin" });
  await RoleModel.create({ id: 2, name: "cliente" });
});

beforeEach(async () => {
  // Limpiar todas las tablas antes de cada test
  await sequelize.query("DELETE FROM users");
  await sequelize.query("DELETE FROM rooms");
  await sequelize.query("DELETE FROM images");
  await sequelize.query("DELETE FROM types_rooms");
});

afterAll(async () => {
  await sequelize.close(); // Cerrar la conexión con la base de datos
});



describe("[GET /room] - Obtener habitaciones", () => {
  let adminToken;
  let clientToken;

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

  it("debería devolver todas las habitaciones sin filtro (admin)", async () => {
    // Crear datos de prueba
    const roomType = await TypesRoomModel.create({ id: 1, name: "Suite" });
    const room = await RoomModel.create({
      id: 1,
      name: "Room 101",
      description: "Habitación de lujo",
      price: 200,
      type_id: roomType.id,
    });
    await ImageModel.create({
      id: 1,
      url: "image.jpg",
      room_id: room.id,
      public_id: "1",
    });

    // Hacer la solicitud como admin
    const response = await request(app)
      .get("/api/v1/room")
      .set("Authorization", `Bearer ${adminToken}`);

    // Verificar la respuesta
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Habitaciones obtenidas correctamente"
    );
    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0]).toHaveProperty("id", 1);
    expect(response.body.data[0]).toHaveProperty("name", "Room 101");
    expect(response.body.data[0]).toHaveProperty("description", "Habitación de lujo");
    expect(response.body.data[0]).toHaveProperty("price", 200);
    expect(response.body.data[0].images).toBeDefined();
    expect(response.body.data[0].images.length).toBe(1);
    expect(response.body.data[0].types_room).toBeDefined();
    expect(response.body.data[0].types_room).toHaveProperty("name", "Suite");
  });
  it("debería devolver todas las habitaciones sin filtro (cliente)", async () => {
    // Crear datos de prueba
    const roomType = await TypesRoomModel.create({ id: 1, name: "Suite" });
    const room = await RoomModel.create({
      id: 1,
      name: "Room 101",
      description: "Habitación de lujo",
      price: 200,
      type_id: roomType.id,
    });
    await ImageModel.create({
      id: 1,
      url: "image.jpg",
      room_id: room.id,
      public_id: "1",
    });

    // Hacer la solicitud como admin
    const response = await request(app)
      .get("/api/v1/room")
      .set("Authorization", `Bearer ${clientToken}`);

    // Verificar la respuesta
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Habitaciones obtenidas correctamente"
    );
    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0]).toHaveProperty("id", 1);
    expect(response.body.data[0]).toHaveProperty("name", "Room 101");
    expect(response.body.data[0]).toHaveProperty("description", "Habitación de lujo");
    expect(response.body.data[0]).toHaveProperty("price", 200);
    expect(response.body.data[0].images).toBeDefined();
    expect(response.body.data[0].images.length).toBe(1);
    expect(response.body.data[0].types_room).toBeDefined();
    expect(response.body.data[0].types_room).toHaveProperty("name", "Suite");
  });

  it("debería devolver habitaciones filtradas por tipo (cliente)", async () => {
    // Crear datos de prueba
    const roomType1 = await TypesRoomModel.create({ id: 1, name: "Suite" });
    const roomType2 = await TypesRoomModel.create({ id: 2, name: "Económica" });

    await RoomModel.create({
      id: 1,
      name: "Room 101",
      description: "Habitación de lujo",
      price: 200,
      type_id: roomType1.id,
    });
    await RoomModel.create({
      id: 2,
      name: "Room 102",
      description: "Habitación económica",
      price: 100,
      type_id: roomType2.id,
    });

    // Hacer la solicitud como cliente con filtro por tipo
    const response = await request(app)
      .get("/api/v1/room?type=Suite")
      .set("Authorization", `Bearer ${clientToken}`);

    // Verificar la respuesta
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Habitaciones obtenidas correctamente"
    );
    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0]).toHaveProperty("id", 1);
    expect(response.body.data[0]).toHaveProperty("name", "Room 101");
    expect(response.body.data[0].types_room).toHaveProperty("name", "Suite");
  });
  it("debería devolver habitaciones filtradas por tipo (admin)", async () => {
    // Crear datos de prueba
    const roomType1 = await TypesRoomModel.create({ id: 1, name: "Suite" });
    const roomType2 = await TypesRoomModel.create({ id: 2, name: "Económica" });

    await RoomModel.create({
      id: 1,
      name: "Room 101",
      description: "Habitación de lujo",
      price: 200,
      type_id: roomType1.id,
    });
    await RoomModel.create({
      id: 2,
      name: "Room 102",
      description: "Habitación económica",
      price: 100,
      type_id: roomType2.id,
    });

    // Hacer la solicitud como cliente con filtro por tipo
    const response = await request(app)
      .get("/api/v1/room?type=Suite")
      .set("Authorization", `Bearer ${adminToken}`);

    // Verificar la respuesta
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Habitaciones obtenidas correctamente"
    );
    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0]).toHaveProperty("id", 1);
    expect(response.body.data[0]).toHaveProperty("name", "Room 101");
    expect(response.body.data[0].types_room).toHaveProperty("name", "Suite");
  });

});
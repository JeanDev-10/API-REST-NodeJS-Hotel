import request from "supertest";
import app from "../../index.js"; // Importa tu aplicación Express
import { sequelize } from "../../db/conexion.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../../models/UserModel.js"; // Importa el modelo de usuario

beforeEach(async () => {
  await sequelize.query("DELETE FROM users"); // Limpiar la tabla de usuarios
});

afterEach(async () => {
  await sequelize.query("DELETE FROM users"); // Limpiar la tabla de usuarios
});

// Cerrar conexión con la base de datos después de las pruebas
afterAll(async () => {
  await sequelize.close();
});

describe("[POST /login]", () => {
  it("should login successfully with valid credentials", async () => {
    // Crear un usuario de prueba en la base de datos
    const hashedPassword = await bcrypt.hash("password123", 10); // Hashear la contraseña
    await UserModel.create({
      name: "John",
      lastname: "Doe",
      email: "john@example.com",
      password: hashedPassword,
      role_id: 1,
    });

    // Datos de login válidos
    const loginData = {
      email: "john@example.com",
      password: "password123",
    };

    const response = await request(app).post("/api/v1/login").send(loginData);

    expect(response.status).toBe(200); // Código de estado 200 (OK)
    expect(response.body).toHaveProperty("message", "inicio de sesión exitoso!");
    expect(response.body).toHaveProperty("token"); // Verificar que se devuelve un token
  });

  it("should return 401 for invalid credentials (wrong password)", async () => {
    // Crear un usuario de prueba en la base de datos
    const hashedPassword = await bcrypt.hash("password123", 10); // Hashear la contraseña
    await UserModel.create({
      name: "John",
      lastname: "Doe",
      email: "john@example.com",
      password: hashedPassword,
      role_id: 1,
    });

    // Datos de login con contraseña incorrecta
    const loginData = {
      email: "john@example.com",
      password: "wrongpassword",
    };

    const response = await request(app).post("/api/v1/login").send(loginData);

    expect(response.status).toBe(401); // Código de estado 401 (Unauthorized)
    expect(response.body).toHaveProperty("message", "Credenciales invalidas");
  });

  it("should return 401 for invalid credentials (wrong email)", async () => {
    // Crear un usuario de prueba en la base de datos
    const hashedPassword = await bcrypt.hash("password123", 10); // Hashear la contraseña
    await UserModel.create({
      name: "John",
      lastname: "Doe",
      email: "john@example.com",
      password: hashedPassword,
      role_id: 1,
    });

    // Datos de login con correo incorrecto
    const loginData = {
      email: "wrong@example.com",
      password: "password123",
    };

    const response = await request(app).post("/api/v1/login").send(loginData);

    expect(response.status).toBe(401); // Código de estado 401 (Unauthorized)
    expect(response.body).toHaveProperty("message", "Credenciales invalidas");
  });

  it("should return 422 for validation errors (missing email)", async () => {
    // Datos de login sin correo electrónico
    const loginData = {
      password: "password123",
    };

    const response = await request(app).post("/api/v1/login").send(loginData);

    expect(response.status).toBe(422); // Código de estado 422 (Unprocessable Entity)
    expect(response.body).toHaveProperty("errors"); // Verificar que se devuelven errores de validación
  });

  it("should return 422 for validation errors (missing password)", async () => {
    // Datos de login sin contraseña
    const loginData = {
      email: "john@example.com",
    };

    const response = await request(app).post("/api/v1/login").send(loginData);

    expect(response.status).toBe(422); // Código de estado 422 (Unprocessable Entity)
    expect(response.body).toHaveProperty("errors"); // Verificar que se devuelven errores de validación
  });
});
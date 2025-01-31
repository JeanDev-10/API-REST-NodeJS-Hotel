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

describe("[GET /me]", () => {
  it("should return the authenticated user without password", async () => {
    // Crear un rol de prueba en la base de datos
   

    // Crear un usuario de prueba en la base de datos
    const hashedPassword = await bcrypt.hash("password123", 10); // Hashear la contraseña
    const user = await UserModel.create({
      name: "John",
      lastname: "Doe",
      email: "john@example.com",
      password: hashedPassword,
      role_id: 2,
    });

    // Generar un token JWT válido para el usuario
    const token = jwt.sign({ user_id: user.id,email:user.email,role_id:2}, 'secretToken', { expiresIn: '1h' });

    const response = await request(app)
      .get("/api/v1/me")
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200); // Código de estado 200 (OK)
    expect(response.body).toHaveProperty("message", "Usuario encontrado");
    expect(response.body.data).toHaveProperty("id", user.id);
    expect(response.body.data).toHaveProperty("name", user.name);
    expect(response.body.data).toHaveProperty("lastname", user.lastname);
    expect(response.body.data).toHaveProperty("email", user.email);
    expect(response.body.data).not.toHaveProperty("password"); // Verificar que no se devuelve la contraseña
    expect(response.body.data.role).toHaveProperty("id", 2);
  });

  it("should return 404 if the user does not exist", async () => {
    // Generar un token JWT válido para un usuario que no existe
    const token = jwt.sign({ user_id: 999 }, 'secretToken', { expiresIn: '1h' });

    const response = await request(app)
      .get("/api/v1/me")
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404); // Código de estado 404 (Not Found)
    expect(response.body).toHaveProperty("message", "Usuario no encontrado");
  });

});
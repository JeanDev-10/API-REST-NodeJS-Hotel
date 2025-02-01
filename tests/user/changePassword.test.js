import request from "supertest";
import app from "../../index.js"; // Importa tu aplicación Express
import { sequelize } from "../../db/conexion.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../../models/UserModel.js"; // Importa el modelo de usuario
import { seedRoles } from "../../Seeders/RoleSeeder.js";

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Aquí ya están establecidas las relaciones
  await seedRoles();
});
beforeEach(async () => {
  await sequelize.query("DELETE FROM users"); // Limpiar la tabla de usuarios
});
afterEach(async () => {
  await sequelize.query("DELETE FROM users"); // Limpiar la tabla de usuarios
});

afterAll(async () => {
  await sequelize.close(); // Cerrar conexión con la base de datos
});

describe("[PUT /user/password] - Validación de cambio de contraseña", () => {
    let token;
  beforeAll(async () => {
    // Generar un token JWT válido para el usuario
     token = jwt.sign({ user_id: 2 }, "secretToken", { expiresIn: "1h" });
  });
  it("debería devolver un error 422 si la contraseña tiene menos de 6 caracteres", async () => {
    const response = await request(app)
      .put("/api/v1/user/password")
      .set("Authorization", `Bearer `+token)
      .send({
        password: "12345", // Menos de 6 caracteres
        newPassword: "newpassword123",
      });

    expect(response.status).toBe(422); // Código de estado 422 (Unprocessable Entity)
    expect(response.body.errors).toBeDefined(); // Verificar que se devuelven errores de validación
  });

  it("debería devolver un error 422 si la nueva contraseña tiene menos de 6 caracteres", async () => {
    const response = await request(app)
      .put("/api/v1/user/password")
      .set("Authorization", `Bearer `+token)
      .send({
        password: "password123",
        newPassword: "12345", // Menos de 6 caracteres
      });

    expect(response.status).toBe(422); // Código de estado 422 (Unprocessable Entity)
    expect(response.body.errors).toBeDefined(); // Verificar que se devuelven errores de validación
  });
});

describe("[PUT /user/password] - Cambio de contraseña", () => {
  let user;
  let token;

  beforeEach(async () => {
    // Crear un usuario de prueba en la base de datos
    const hashedPassword = await bcrypt.hash("password123", 10); // Hashear la contraseña
    user = await UserModel.create({
      name: "John",
      lastname: "Doe",
      email: "john@example.com",
      password: hashedPassword,
      role_id: 2,
    });

    // Generar un token JWT válido para el usuario
    token = jwt.sign({ user_id: user.id, email:user.email, role_id:2 }, "secretToken", { expiresIn: "1h" });
  });

  it("debería cambiar la contraseña correctamente", async () => {
    const response = await request(app)
      .put("/api/v1/user/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        password: "password123", // Contraseña actual
        newPassword: "newpassword123", // Nueva contraseña
      });

    expect(response.status).toBe(200); // Código de estado 200 (OK)
    expect(response.body).toHaveProperty(
      "message",
      "La contraseña ha sido cambiada"
    );

    // Verificar que la contraseña se haya actualizado en la base de datos
    const updatedUser = await UserModel.findOne({ where: { id: user.id } });
    const isMatch = await bcrypt.compare(
      "newpassword123",
      updatedUser.password
    );
    expect(isMatch).toBe(true); // La nueva contraseña debe coincidir
  });

  it("debería devolver un error 400 si la contraseña actual es incorrecta", async () => {
    const response = await request(app)
      .put("/api/v1/user/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        password: "wrongpassword", // Contraseña incorrecta
        newPassword: "newpassword123",
      });
      console.log(response)
    expect(response.status).toBe(400); // Código de estado 400 (Bad Request)
    expect(response.body).toHaveProperty(
      "message",
      "La contraseña es incorrecta"
    );
  });

  it("debería devolver un error 400 si la nueva contraseña es igual a la anterior", async () => {
    const response = await request(app)
      .put("/api/v1/user/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        password: "password123", // Contraseña actual
        newPassword: "password123", // Nueva contraseña igual a la anterior
      });

    expect(response.status).toBe(400); // Código de estado 400 (Bad Request)
    expect(response.body).toHaveProperty(
      "message",
      "La contraseña no puede ser la misma a cambiar"
    );
  });
});

import request from "supertest";
import app from "../../index.js"; // Importa tu aplicación Express
import { sequelize } from "../../db/conexion.js";

describe("[POST/register]", () => {
  beforeEach(async () => {
    await sequelize.query("DELETE FROM users"); // Limpiar la tabla de usuarios
  });

  afterEach(async () => {
    await sequelize.query("DELETE FROM users"); // Limpiar la tabla de usuarios
    
  });
// cerrar conexión con la base de datos  después de las pruebas
  afterAll(async () =>{
    await sequelize.close(); 
  })
  it("should register a new user", async () => {
    const newUser = {
      name: "John",
      lastname: "Doe",
      email: "john@example.com",
      password: "password123",
    };

    const response = await request(app).post("/api/v1/register").send(newUser);
    expect(response.status).toBe(201); // Código de estado 201 (Created)
    expect(response.body.users).toHaveProperty("id"); // Verificar que se devuelve un ID
    expect(response.body.users.email).toBe(newUser.email); // Verificar el correo electrónico
  });
   it("should error validation to register a new user", async() => {
    const newUser = {
        name: "",
        lastname: "",
        email: "john@example.com",
        password: "password123",
      };
      const response = await request(app).post("/api/v1/register").send(newUser);
      expect(response.status).toBe(422);
    expect(response.body).toHaveProperty("errors"); // Verificar que se devuelve un ID

   });
  it("should error exists that email", async() => {
    const newUser = {
        name: "adsa",
        lastname: "asdasd",
        email: "john@example.com",
        password: "password123",
      };
      const response = await request(app).post("/api/v1/register").send(newUser);
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("users");
      const response2 = await request(app).post("/api/v1/register").send(newUser);
      expect(response2.status).toBe(409);
      expect(response2.body).toHaveProperty("message","El correo ya está en uso");

  }); 
});

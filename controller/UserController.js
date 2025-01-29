//Controller usuario
import { UserModel } from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { TOKEN_KEY } from "../config/config.js";
import { Model } from "sequelize";
import { RoleModel } from "../models/Roles.model.js";
import { ReservationModel } from "../models/Reservation.model.js";
import { RoomModel } from "../models/Rooms.model.js";

export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll({
      attributes: ["id", "user", "email", "typeusers_id", "state"],
      where: { state: true },
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOneUser = async (req, res) => {
  try {
    const user = await UserModel.findOne({
      attributes: ["id", "name", "lastname", "email"],
      where: { id: req.params.id },
      include: [
        {
          model: ReservationModel,
          include: {
            model: RoomModel,
          },
        },
      ],
    });
    if (!user) {
      return res.json({ message: "user not found" },404);
    }
    return res
      .json({ message: "usuario con reservas y habitaciones", data: user },200);
  } catch (error) {
    return res.json({ error: error.message },500);
  }
};

export const createUsers = async (req, res) => {
  try {
    const { name, lastname, email, password } = req.body;

    const oldUser = await UserModel.findOne({
      where: { email: email.toLowerCase() },
    });
    if (oldUser) {
      return res.status(409).json({
        message: "El correo ya está en uso",
      });
    }
    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(password.toString(), 10);
    // Create user in our database

    const users = await UserModel.create({
      name: name.toLowerCase(),
      lastname: lastname.toLowerCase(),
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      role_id: 2,
    });

    // Create token
    const token = jwt.sign(
      { user_id: users.id, email, role_id: users.role_id },
      TOKEN_KEY,
      {
        expiresIn: "1h",
      }
    );
    // save user token
    // users.token = token;
    res.status(201).json({ users, token: token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUsers = async (req, res) => {
  const { user } = req.body;
  if (!user) {
    res.status(400).json({ message: "user is required" });
  }
  const userD = await UserModel.findOne({ where: { id: req.params.id } });
  if (userD) {
    userD.set({ ...userD, user: user });
    await userD.save();
    res.status(200).json({ message: "update" });
  } else {
    res.status(404).json({ message: "user not found" });
  }
};
export const updateUsersEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: "email is required" });
  }
  const oldUser = await UserModel.findOne({ where: { email: email } });
  if (oldUser) {
    return res.status(409).json("email already exist");
  }
  const userD = await UserModel.findOne({ where: { id: req.params.id } });
  if (userD) {
    userD.set({ ...userD, email: email });
    await userD.save();
    res.status(200).json({ message: "update" });
  } else {
    res.status(404).json({ message: "user not found" });
  }
};
export const updateUsersPassword = async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    const userD = await UserModel.findOne({ where: { id: req.user_id } });
    const isMatch = await bcrypt.compare(password, userD.password);
    if (!isMatch) {
      return res.status(400).json({ message: "La contraseña es incorrecta" });
    }
    if (password == newPassword) {
      return res
        .status(400)
        .json({ message: "La contraseña no puede ser la misma a cambiar" });
    }
    const newPasswordEncrypt = await bcrypt.hash(newPassword, 10);
    userD.set({ ...userD, password: newPasswordEncrypt });
    await userD.save();
    return res.json({ message: "La contraseña ha sido cambiada" }, 200);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", error });
  }
};
export const deleteUsers = async (req, res) => {
  const user = await UserModel.findOne({ where: { id: req.params.id } });
  if (user) {
    user.set({ ...user, state: false });
    await user.save();
    res.status(200).json({ message: "user delete" });
  } else {
    res.status(404).json({ message: "user not found" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({
      where: { email: email.toLowerCase() },
    });
    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }
    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }

    // If everything is valid, generate a token
    const token = jwt.sign(
      { user_id: user.id, email, role_id: user.role_id },
      TOKEN_KEY,
      {
        expiresIn: "1h",
      }
    );

    res
      .status(200)
      .json({ message: "inicio de sesión exitoso!", token: token });
  } catch (err) {
    console.error("Login:", err.message);
    res.status(500).json({ error: err.message });
  }
};
export const refresh = (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  if (!token) {
    return res.status(401).end();
  }
  var payload;
  try {
    payload = jwt.verify(token, "secret");
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      return res.status(401).end();
    }
    return res.status(400).end();
  }
  const nowUnixSeconds = Math.round(Number(new Date()) / 1000);
  if (payload.exp - nowUnixSeconds > 30) {
    return res.status(400).end();
  }
  const newToken = jwt.sign({ username: payload.username }, jwtKey, {
    algorithm: "HS256",
    expiresIn: jwtExpirySeconds,
  });
  res.cookie("token", newToken, { maxAge: jwtExpirySeconds * 1000 });
  res.end();
};

export const me = async (req, res) => {
  try {
    const user = await UserModel.findOne({
      where: { id: req.user_id },
      attributes: { exclude: ["password"] },
      include: {
        model: RoleModel,
        attributes: ["id", "name"], // Obtener solo ID y nombre del rol
      },
    });

    if (!user) {
      return res.json({ message: "Usuario no encontrado" }, 404);
    }

    return res.json(
      {
        message: "Usuario encontrado",
        data: user,
      },
      200
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error en el servidor", error });
  }
};
export const logout = (req, res) => {
  res.json({ message: "Logout exitoso" });
};

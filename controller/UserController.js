//Controller usuario
import { UserModel } from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { TOKEN_KEY } from "../config/config.js";
import { RoleModel } from "../models/Roles.model.js";
import { ReservationModel } from "../models/Reservation.model.js";
import { RoomModel } from "../models/Rooms.model.js";
import { ImageModel } from "../models/Images.model.js";
import { StatusReservationModel } from "../models/StatusReservation.model.js";
import { TypesRoomModel } from "../models/TypesRooms.model.js";
import admin from "../config/firebase.js";
import { Op } from "sequelize";

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
      attributes: ["id", "name", "lastname", "email",'image'],
      where: { id: req.params.id },
      include: [
        {
          model: RoleModel,
        },
        {
          model: ReservationModel,
          include: [
            {
              model: RoomModel,
              include: [
                {
                  model: ImageModel,
                },
                {
                  model: TypesRoomModel,
                },
              ],
            },
            {
              model: StatusReservationModel,
            },
          ],
        },
      ]
    });
    if (!user) {
      return res.json({ message: "user not found" }, 404);
    }
    return res.json(
      { message: "usuario con reservas y habitaciones", data: user },
      200
    );
  } catch (error) {
    return res.json({ error: error.message }, 500);
  }
};

export const createUsers = async (req, res) => {
  try {
    const { name, lastname, email, password } = req.body;

    const oldUser = await UserModel.findOne({
      where: { email: email.toLowerCase() },
    });
    if (oldUser) {
      return res.status(422).json({
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
      image:"https://images.vexels.com/content/145908/preview/male-avatar-maker-2a7919.png",
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
    console.log(error)
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



// user.controller.js - Añadir nuevo método
export const loginWithGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Verificar token de Firebase
    const firebaseUser = await admin.auth().verifyIdToken(idToken);
    
    // Buscar usuario por email o firebaseUid
    const user = await UserModel.findOne({
      where: {
        [Op.or]: [
          { email: firebaseUser.email },
          { firebaseUid: firebaseUser.uid }
        ]
      }
    });

    let createdUser;
    console.log(firebaseUser)

    if (!user) {
      // Crear nuevo usuario con datos de Google
      createdUser = await UserModel.create({
        name: firebaseUser.name?.split(' ')[0] || 'Usuario',
        lastname: firebaseUser.name?.split(' ')[1] || 'Google',
        email: firebaseUser.email,
        password:"",
        image:firebaseUser.picture || "https://images.vexels.com/content/145908/preview/male-avatar-maker-2a7919.png",
        role_id: 2, // Cliente por defecto
        firebaseUid: firebaseUser.uid,
        registrationMethod: 'google'
      });
    }

    // Generar JWT compatible con tu sistema actual
    const token = jwt.sign(
      {
        user_id: user?.id || createdUser.id,
        email: firebaseUser.email,
        role_id: user?.role_id || 2
      },
      TOKEN_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({ 
      message: "Autenticación exitosa",
      token,
      user: user || createdUser
    });

  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Error en autenticación con Google" });
  }
};
export const loginWithGithub = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Verificar token de Firebase
    const firebaseUser = await admin.auth().verifyIdToken(idToken);
    
    // Buscar usuario por email o firebaseUid
    const user = await UserModel.findOne({
      where: {
        [Op.or]: [
          { email: firebaseUser.email },
          { firebaseUid: firebaseUser.uid }
        ]
      }
    });
    console.log(firebaseUser)
    let createdUser;
    if (!user) {
      // Crear nuevo usuario con datos de Google
      createdUser = await UserModel.create({
        name: firebaseUser.name?.split(' ')[0] || 'Usuario',
        lastname: firebaseUser.name?.split(' ')[1] || 'Github',
        email: firebaseUser.email,
        image:firebaseUser.picture || "https://images.vexels.com/content/145908/preview/male-avatar-maker-2a7919.png",
        password:"",
        role_id: 2, // Cliente por defecto
        firebaseUid: firebaseUser.uid,
        registrationMethod: 'github'
      });
    }

    // Generar JWT compatible con tu sistema actual
    const token = jwt.sign(
      {
        user_id: user?.id || createdUser.id,
        email: firebaseUser.email,
        role_id: user?.role_id || 2
      },
      TOKEN_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({ 
      message: "Autenticación exitosa",
      token,
      user: user || createdUser
    });

  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Error en autenticación con Github" });
  }
};
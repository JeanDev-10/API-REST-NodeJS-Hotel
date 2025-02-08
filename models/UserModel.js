import { DataTypes } from "sequelize";
import { sequelize } from "../db/conexion.js";
export const UserModel = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_id: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "roles", 
        key: "id",
      },
    },
    firebaseUid: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true
    },
    registrationMethod: {
      type: DataTypes.ENUM('local', 'google','github'),
      defaultValue: 'local'
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    timestamps: false,
  }
);

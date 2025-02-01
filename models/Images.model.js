import { DataTypes } from "sequelize";
import { sequelize } from "../db/conexion.js";
export const ImageModel = sequelize.define(
  "images",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    url: { type: DataTypes.STRING, allowNull: false },
    public_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Cada imagen en Cloudinary tiene un ID único
    },
  },
  { timestamps: false }
);

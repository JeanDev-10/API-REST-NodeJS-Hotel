import { DataTypes } from "sequelize";
import { sequelize } from "../db/conexion.js";

export const RoomModel = sequelize.define(
  "rooms",
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
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  },
  { timestamps: false }
);

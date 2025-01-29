import { DataTypes } from "sequelize";
import { sequelize } from "../db/conexion.js";
export const TypesRoomModel = sequelize.define(
  "types_rooms",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  { timestamps: false }
);

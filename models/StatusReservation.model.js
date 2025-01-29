import { DataTypes } from "sequelize";
import { sequelize } from "../db/conexion.js";
export const StatusReservationModel = sequelize.define(
  "status_reservations",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  { timestamps: false }
);

import { DataTypes } from "sequelize";
import { sequelize } from "../db/conexion.js";
export const ReservationModel = sequelize.define(
  "reservations",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    date_end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    price_total: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
  },
  { timestamps: false }
);

import { RoleModel } from "./Roles.model.js";
import { UserModel } from "./UserModel.js";
import { RoomModel } from "./Rooms.model.js";
import { ImageModel } from "./Images.model.js";
import { ReservationModel } from "./Reservation.model.js";
import { StatusReservationModel } from "./StatusReservation.model.js";
import { TypesRoomModel } from "./TypesRooms.model.js";

/**
 * *relacion entre rol y usuario en bidireccion
 */

RoleModel.hasMany(UserModel, {
  foreignKey: "role_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
UserModel.belongsTo(RoleModel, {
  foreignKey: "role_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

/**
 * *relacion entre habitacion y tipo de habitacion en bidireccion
 */
TypesRoomModel.hasMany(RoomModel, {
  foreignKey: "type_id",
  onUpdate: "CASCADE",
});
RoomModel.belongsTo(TypesRoomModel, {
  foreignKey: "type_id",
  onUpdate: "CASCADE",
});
/**
 * *relacion entre habitacion e imagenes
 */
RoomModel.hasMany(ImageModel, {
  foreignKey: "room_id",
  onUpdate: "CASCADE",
  onDelete:"CASCADE"
});
ImageModel.belongsTo(RoomModel, {
  foreignKey: "room_id",
  onUpdate: "CASCADE",
  onDelete:"CASCADE"
});

/**
 * *relacion entre usuario y reservacion
 */
UserModel.hasMany(ReservationModel, {
  foreignKey: "user_id",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});
ReservationModel.belongsTo(UserModel, {
  foreignKey: "user_id",
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
});

/**
 * *relacion entre reservacion y habitacion
 */

RoomModel.hasMany(ReservationModel, {
  foreignKey: "room_id",
  onUpdate: "CASCADE",
});
ReservationModel.belongsTo(RoomModel, {
  foreignKey: "room_id",
  onUpdate: "CASCADE",
});

/**
 * *relacion entre estado de reserva y reserva de habitación
 */
StatusReservationModel.hasMany(ReservationModel, {
  foreignKey: "status_id",
  onUpdate: "CASCADE",
});
ReservationModel.belongsTo(StatusReservationModel, {
  foreignKey: "status_id",
  onUpdate: "CASCADE",
});

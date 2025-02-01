// services/ImageService.js
import cloudinary from "../config/cloudinary.js";
import stream from 'stream'

export const uploadImageToCloudinary = async (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "hotel/rooms", // Carpeta en Cloudinary
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({ url: result.secure_url, public_id: result.public_id });
        }
      }
    );

    // Convertir el buffer a un stream y subirlo a Cloudinary
    const bufferStream = stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });
};


export const deleteImageFromCloudinary = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error("Error al eliminar la imagen de Cloudinary", error);
  }
};
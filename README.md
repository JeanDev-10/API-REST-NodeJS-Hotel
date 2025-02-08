# API de Gestión de Reservas de Hotel

Esta API fue construida para gestionar reservas de habitaciones de hotel, permitiendo a los clientes reservar habitaciones y a los administradores gestionar habitaciones y reservas. Está desarrollada con Node.js, Express, MySQL, Sequelize (como ORM), y se utilizan Jest y Supertest para las pruebas unitarias y de integración.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución de JavaScript.
- **Express**: Framework para construir aplicaciones web y APIs.
- **MySQL**: Base de datos relacional para almacenar la información.
- **Sequelize**: ORM para interactuar con la base de datos.
- **Jest**: Framework de pruebas para JavaScript.
- **Supertest**: Librería para probar endpoints de APIs.
- **JWT**: Autenticación basada en tokens.
- **Bcrypt**: Encriptación de contraseñas.
- **Cloudinary**: Guardar las imagenes en la nube.
- **Firebase**: Autenticación con Google y Github.
## Reglas de Negocio

### 1. Autenticación y Usuarios

- **Registro de Usuarios**: Los usuarios pueden registrarse con nombre, apellido, correo electrónico y contraseña.
- **Inicio de Sesión**: Los usuarios pueden iniciar sesión con sus credenciales.
- **Perfil de Usuario**: Los usuarios pueden ver su perfil con información personal.
- **Actualización de Contraseña**: Los usuarios pueden cambiar su contraseña, pero deben proporcionar la contraseña actual.
- **Roles**:
  - **Administrador**: Acceso total a la gestión de habitaciones y reservas.
  - **Cliente**: Solo puede reservar habitaciones y ver sus propias reservaciones.

### 2. Gestión de Habitaciones (Solo Administrador)

- **Creación de Habitaciones**: El administrador puede crear habitaciones con nombre, descripción, tipo, precio por noche e imágenes.
- **Actualización de Habitaciones**: El administrador puede actualizar los detalles de las habitaciones.
- **Eliminación de Habitaciones**: El administrador puede eliminar habitaciones que no tengan reservaciones activas.
- **Listado de Habitaciones**: El administrador puede ver la lista completa de habitaciones.

### 3. Reservaciones

- **Visualización de Habitaciones Disponibles**: Los clientes pueden ver la lista de habitaciones disponibles y filtrarlas por tipo.
- **Reserva de Habitaciones**: Los clientes pueden reservar habitaciones seleccionando una fecha específica.
- **Restricciones de Reserva**: No se puede reservar una habitación si no hay disponibilidad en la fecha seleccionada.
- **Visualización de Reservaciones**:
  - Los clientes solo pueden ver sus propias reservaciones.
  - El administrador puede ver todas las reservaciones.
- **Información de la Reserva**: Cada reserva incluye el usuario, la habitación, las fechas de entrada y salida, y el estado (Pendiente, Confirmada, Cancelada).

### 4. Seguridad y Restricciones

- **Modificación de Datos**: Los usuarios solo pueden modificar sus propios datos.
- **Autenticación**: Se implementa autenticación con JWT para validar sesiones.
- **Encriptación**: Las contraseñas se encriptan antes de guardarse en la base de datos.
- **Restricciones de Roles**: Los administradores no pueden reservar habitaciones, solo gestionarlas.

## Instalación y Ejecución

### 1. Clonar el Repositorio

```bash
git clone https://github.com/JeanDev-10/API-REST-NodeJS-Hotel.git
cd API-REST-NodeJS-Hotel
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar la Base de Datos

Crear una base de datos MySQL y configurar las credenciales en el archivo `.env`:

```env
DB_NAME=nombre_de_tu_base_de_datos
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql
DB_HOST=localhost
JWT_SECRET=tu_secreto_jwt
CLOUDINARY_CLOUD_NAME=yourkey
CLOUDINARY_API_KEY=yourkey
CLOUDINARY_API_SECRET=yourkey
```

### 4. Ejecutar Migraciones

```bash
npm run seed
```

### 5. Ejecutar el Servidor

En modo desarrollo (con nodemon):

```bash
npm run dev
```

En producción:

```bash
npm start
```

### 6. Ejecutar Pruebas

```bash
npm test
```

## Estructura del Repositorio

- **Carpeta public**:
  - **Reglas de Negocio**: `Reglas de negocio.pdf`
  - **Diseño de Base de Datos**: `Hotel Api DB.png`
  - **Colección de Insomnia**: `Hotel app-request-insomnia.json`

## Endpoints Disponibles

### Autenticación

- **Registro de Usuario**: `POST /api/v1/register`
- **Inicio de Sesión**: `POST /api/v1/login`
- **Perfil de Usuario**: `GET /api/v1/me`
- **Cerrar Sesión**: `GET /api/v1/logout`

### Usuarios

- **Reservaciones de un Usuario (Admin)**: `GET /api/v1/user/:id/reservations`

### Habitaciones

- **Obtener Todas las Habitaciones**: `GET /api/v1/room`
- **Obtener Habitación por ID**: `GET /api/v1/room/:id`
- **Crear Habitación (Admin)**: `POST /api/v1/room`
- **Actualizar Habitación (Admin)**: `PUT /api/v1/room/:id`
- **Eliminar Habitación (Admin)**: `DELETE /api/v1/room/:id`

### Tipos de Habitación

- **Obtener Todos los Tipos de Habitación**: `GET /api/v1/types-rooms`

### Reservaciones

- **Obtener Todas las Reservaciones (Admin)**: `GET /api/v1/reservation`
- **Obtener Mis Reservaciones (Cliente)**: `GET /api/v1/reservation/client`
- **Obtener Reservación por ID**: `GET /api/v1/reservation/:id`
- **Crear Reservación (Cliente)**: `POST /api/v1/reservation`
- **Cancelar Reservación (Cliente)**: `PATCH /api/v1/reservation/:id`

## Imagen de la Base de Datos

A continuación se muestra el diseño de la base de datos:

![Diseño de la Base de Datos](public/Hotel%20Api%20DB.png)

## Scripts de NPM

- `npm run dev`: Inicia el servidor en modo desarrollo con nodemon.
- `npm run seed`: Ejecuta las migraciones y seeders para poblar la base de datos.
- `npm start`: Inicia el servidor en modo producción.
- `npm test`: Ejecuta las pruebas unitarias y de integración.

## Contribuir

Si deseas contribuir a este proyecto, sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una rama con tu feature o corrección: `git checkout -b mi-feature`.
3. Realiza tus cambios y haz commit: `git commit -m "Añadir mi feature"`.
4. Sube tus cambios: `git push origin mi-feature`.
5. Abre un Pull Request.

## Licencia

Este proyecto está bajo la licencia MIT. Para más detalles, consulta el archivo `LICENSE`.

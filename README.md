# Plataforma de Eventos e Inscripciones

## Temática
API REST para la gestión de eventos e inscripciones. Permite a los usuarios explorar eventos, y en futuras entregas, registrarse, inscribirse a eventos y gestionar cupos.

## Tecnologías
- Node.js
- Express
- dotenv
- (Próximamente) MongoDB, Mongoose, JWT, Passport

## Instalación

\`\`\`bash
git clone <URL_DEL_REPO>
cd plataforma-eventos
npm install
\`\`\`

## Configuración de variables de entorno

Crear un archivo `.env` en la raíz del proyecto (podés basarte en `.env.example`):

\`\`\`
PORT=8080
NODE_ENV=development
MONGO_URL=
JWT_SECRET=
\`\`\`

## Cómo ejecutar

\`\`\`bash
node src/server.js
\`\`\`

El servidor va a levantar en `http://localhost:8080` (o el puerto configurado en `.env`).

## Estructura de carpetas

\`\`\`
src/
├── app.js
├── server.js
├── config/
├── routes/
├── controllers/
├── services/
├── repositories/
├── dao/
├── models/
├── middlewares/
└── utils/
\`\`\`

## Rutas disponibles

| Método | Ruta               | Descripción                          |
|--------|--------------------|--------------------------------------|
| GET    | /api/health        | Verifica que el servidor esté activo |
| GET    | /api/events        | Lista de eventos (vacía por ahora)   |
| POST   | /api/sessions/register | Registro de usuario (sin lógica aún) |
| POST   | /api/sessions/login    | Login de usuario (sin lógica aún)    |

## Endpoints - Sesiones

### POST /api/sessions/register

Registra un nuevo usuario en el sistema.

**Body esperado:**

\`\`\`json
{
    "first_name": "Ana",
    "last_name": "Pérez",
    "email": "ana@mail.com",
    "password": "Secreta123"
}
\`\`\`

**Validaciones:**
- Todos los campos son obligatorios
- El email debe tener formato válido
- La contraseña debe tener al menos 8 caracteres
- El email no puede estar ya registrado
- El campo `role` no se puede setear desde el body (siempre se asigna `user` por defecto)

**Respuesta exitosa (201):**

\`\`\`json
{
    "status": "success",
    "payload": {
        "id": "665f2a...",
        "first_name": "Ana",
        "last_name": "Pérez",
        "email": "ana@mail.com",
        "role": "user"
    }
}
\`\`\`

**Respuestas de error:**
- `400` - Campos faltantes o email con formato inválido
- `409` - El email ya está registrado

**Cómo probarlo:**
Con Postman, Thunder Client o similar, hacer un POST a `http://localhost:8080/api/sessions/register` con el body JSON de ejemplo de arriba.

## Rutas disponibles

| Método | Ruta                        | Descripción                                    | Protegida |
|--------|-----------------------------|-------------------------------------------------|-----------|
| GET    | /api/health                 | Verifica que el servidor esté activo            | No        |
| GET    | /api/events                 | Lista de eventos (vacía por ahora)              | No        |
| POST   | /api/sessions/register      | Registra un nuevo usuario                       | No        |
| POST   | /api/sessions/login         | Inicia sesión y setea cookie JWT                | No        |
| GET    | /api/sessions/current       | Devuelve los datos del usuario autenticado      | Sí        |
| POST   | /api/sessions/logout        | Cierra la sesión (borra la cookie)              | No        |

### POST /api/sessions/login

**Body esperado:**
\`\`\`json
{
    "email": "ana@mail.com",
    "password": "Secreta123"
}
\`\`\`

**Respuesta exitosa (200):** setea la cookie `currentUser` (HttpOnly)
\`\`\`json
{
    "status": "success",
    "message": "Login correcto"
}
\`\`\`

**Respuesta de error (401):**
\`\`\`json
{
    "status": "error",
    "message": "Credenciales inválidas"
}
\`\`\`

### GET /api/sessions/current

Requiere la cookie `currentUser` (se envía automáticamente tras el login).

**Respuesta exitosa (200):**
\`\`\`json
{
    "status": "success",
    "payload": {
        "id": "665f2a...",
        "email": "ana@mail.com",
        "role": "user"
    }
}
\`\`\`

**Respuesta de error (401):**
\`\`\`json
{
    "status": "error",
    "message": "No autenticado"
}
\`\`\`

### POST /api/sessions/logout

**Respuesta exitosa (200):**
\`\`\`json
{
    "status": "success",
    "message": "Sesión cerrada"
}
\`\`\`

## Autenticación con Passport.js

A partir de esta entrega, la autenticación está centralizada mediante estrategias de Passport.js, definidas en `src/config/passport.config.js`. El comportamiento de la API (rutas y respuestas) no cambia respecto a la entrega anterior — solo mejora la organización interna del código.

### Estrategias implementadas

- **`register`** (basada en `passport-local`): valida los campos del registro, normaliza el email, verifica que no exista un usuario duplicado, hashea la contraseña con bcrypt y crea el usuario.
- **`login`** (basada en `passport-local`): busca el usuario por email y compara la contraseña con bcrypt. Responde siempre con un mensaje genérico ("Credenciales inválidas") si el usuario no existe o la contraseña es incorrecta.
- **`current`** (basada en `passport-jwt`): extrae el JWT desde la cookie `currentUser`, lo verifica contra `JWT_SECRET` y expone el payload en `req.user`.

El JWT se genera y la cookie se setea en el **controller**, no en las estrategias — Passport solo se encarga de validar credenciales.

### Preparado para futuros providers

`passport.config.js` está estructurado para agregar nuevas estrategias (por ejemplo, Google OAuth o GitHub) simplemente sumando un nuevo `passport.use(...)`, sin necesidad de modificar `app.js` ni las rutas existentes.

## Variables de entorno

\`\`\`
PORT=8080
NODE_ENV=development
MONGO_URL=
JWT_SECRET=
JWT_EXPIRES_IN=1h
\`\`\`
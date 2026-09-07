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

## Roles y autorización

El sistema implementa autorización basada en roles. El campo `role` del modelo `User` puede tomar los valores `user`, `organizer` o `admin`, con `user` como valor por defecto. El registro público (`POST /api/sessions/register`) **no permite** setear `role` desde el body — siempre se asigna `user`, y el ascenso a `organizer` o `admin` se hace manualmente en la base de datos (por un administrador).

### Matriz de permisos

| Acción                              | user | organizer | admin |
|--------------------------------------|:----:|:---------:|:-----:|
| Consultar eventos publicados         | ✅   | ✅        | ✅    |
| Crear eventos                        | ❌   | ✅        | ✅    |
| Modificar/cancelar eventos propios   | ❌   | ✅        | ✅    |
| Modificar cualquier evento           | ❌   | ❌        | ✅    |
| Ver todos los usuarios               | ❌   | ❌        | ✅    |

### Diferencia entre 401 y 403

- **401 (No autenticado):** no hay sesión válida (falta la cookie, el token es inválido o expiró). El sistema no sabe quién sos.
- **403 (Prohibido):** hay una sesión válida, el sistema sabe quién sos, pero tu rol (o la propiedad del recurso) no te habilita a realizar esa acción específica.

### Middlewares

- **`middlewares/passport.middleware.js` (`authenticateCurrent`):** valida el JWT desde la cookie `currentUser`. Si no hay sesión válida, responde 401.
- **`middlewares/authorize.middleware.js` (`authorize(...roles)`):** middleware reutilizable que recibe los roles permitidos como parámetros y los compara contra `req.user.role`. Si no coincide, responde 403. Ejemplo de uso: `authorize('organizer', 'admin')`.

### Rutas protegidas

| Método | Ruta               | Protección                                      |
|--------|--------------------|--------------------------------------------------|
| GET    | /api/events        | Pública                                          |
| POST   | /api/events        | Autenticado + rol `organizer` o `admin`          |
| PUT    | /api/events/:id    | Autenticado + rol `organizer`/`admin` + dueño del evento (o `admin`) |
| GET    | /api/users         | Autenticado + rol `admin`                        |
| GET    | /api/sessions/current | Solo autenticado                              |

### Propiedad de recursos

Al modificar un evento (`PUT /api/events/:id`), el sistema valida que quien hace la request sea el `organizer` que creó ese evento específico, o bien tenga rol `admin` (que puede modificar cualquier evento). Esta validación vive en `services/events.service.js`.

## Entidad Events

### Modelo

| Campo | Tipo | Detalle |
|---|---|---|
| title | String | Obligatorio |
| description | String | Obligatorio |
| category | String | Obligatorio |
| date | Date | Obligatorio, no puede ser fecha pasada al crear |
| location | String | Obligatorio |
| capacity | Number | Obligatorio, debe ser > 0 |
| price | Number | Opcional (default 0), no puede ser negativo |
| status | String | `draft` \| `published` \| `cancelled` \| `finished` (default `draft`) |
| organizer | ObjectId (ref User) | Se asigna automáticamente desde el usuario autenticado |

### Rutas

| Método | Ruta | Acceso |
|---|---|---|
| POST | /api/events | organizer, admin |
| GET | /api/events | público |
| GET | /api/events/:id | público |
| PUT | /api/events/:id | dueño del evento o admin |
| PATCH | /api/events/:id/status | dueño del evento o admin |

### Filtros y paginación (GET /api/events)

Query params soportados:
- `status`, `category`, `location`: filtro exacto
- `dateFrom`, `dateTo`: rango de fechas
- `page`, `limit`: paginación (default `page=1`, `limit=10`)
- `sort`: ordenamiento, ej. `sort=date` (ascendente) o `sort=-date` (descendente)

Ejemplo: `GET /api/events?status=published&category=workshop&page=1&limit=5`

Respuesta:
\`\`\`json
{
    "status": "success",
    "data": [ ... ],
    "page": 1,
    "limit": 5,
    "total": 1,
    "totalPages": 1
}
\`\`\`

### Reglas de negocio principales

- El `organizer` de un evento se asigna automáticamente desde el usuario autenticado; nunca puede venir del body.
- No se puede crear un evento con fecha pasada.
- `capacity` debe ser mayor a 0; `price` no puede ser negativo.
- Un evento cancelado no puede modificarse (ni sus datos ni su estado).
- No se puede publicar un evento que ya está `finished` o `cancelled`.
- Un `organizer` solo puede modificar sus propios eventos; `admin` puede modificar cualquiera.
- Los eventos nunca se eliminan físicamente: cancelar un evento significa cambiar su `status` a `cancelled`.
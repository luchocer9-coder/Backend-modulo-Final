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

## Tickets e inscripciones

### Modelo Ticket

| Campo | Tipo | Detalle |
|---|---|---|
| user | ObjectId (ref User) | Referencia al usuario inscripto |
| event | ObjectId (ref Event) | Referencia al evento |
| status | String | `confirmed` \| `pending` \| `cancelled` (default `confirmed`) |
| quantity | Number | Cantidad de entradas (default 1) |
| reservationCode | String | Código único generado al confirmar |
| cancelledAt | Date | Se completa al cancelar |
| createdAt / updatedAt | Date | Automáticos (timestamps) |

### Rutas

| Método | Ruta | Acceso |
|---|---|---|
| POST | /api/events/:eid/tickets | autenticado |
| GET | /api/tickets/my-tickets | autenticado (propios) |
| GET | /api/events/:eid/tickets | organizer (dueño del evento) o admin |
| PATCH | /api/tickets/:tid/cancel | dueño del ticket o admin |

### Flujo de inscripción

1. Se valida que el evento exista y esté en estado `published` (no `draft`, `cancelled` ni `finished`).
2. Se valida que `quantity` sea un número mayor a 0.
3. Se valida que el usuario no tenga ya una inscripción activa para ese evento (una inscripción activa por usuario).
4. Se calculan los cupos ocupados (suma de `quantity` de todos los tickets **no cancelados** de ese evento) y se compara contra la `capacity` del evento.
5. Si hay cupo suficiente, se crea el ticket con `status: "confirmed"` y un `reservationCode` único.
6. Se envía un email de confirmación al usuario mediante Nodemailer.

### Cancelación

Cancelar un ticket cambia su `status` a `cancelled` y completa `cancelledAt` con la fecha actual. **El documento nunca se elimina.** Como el cálculo de cupos ocupados excluye los tickets cancelados, el cupo queda disponible automáticamente para nuevas inscripciones.

### Variables de entorno para email (Nodemailer + Mailtrap)

\`\`\`
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
\`\`\`

Se usa Mailtrap (Email Sandbox) como servidor SMTP de testing, para no enviar emails reales durante el desarrollo.

## Arquitectura en capas

El proyecto está organizado siguiendo una arquitectura profesional en capas, donde cada una tiene una responsabilidad única y bien delimitada:

### DAO (Data Access Object)
Únicos archivos que importan modelos de Mongoose directamente (`src/dao/`). Exponen operaciones de acceso a datos puras: `findById`, `create`, `find`, `update`, `count`, sin ninguna lógica de negocio.

### Repository
Capa intermedia (`src/repositories/`) que usa los DAO correspondientes, nunca modelos directamente. Expone métodos orientados al dominio (`getUserByEmail`, `getOccupiedQuantity`, `modifyTicket`), sirviendo de puente entre el acceso a datos y la lógica de negocio.

### Service
Concentra toda la lógica de negocio (`src/services/`): validaciones de cupos, estados de eventos, duplicados de inscripción, permisos sobre recursos propios, generación de tokens, envío de emails. Consume repositories, nunca DAOs ni modelos de Mongoose directamente. Aplica los DTOs antes de devolver cualquier dato.

### DTO (Data Transfer Object)
`src/dtos/` contiene funciones que filtran los documentos de Mongoose antes de exponerlos en una respuesta HTTP. Existen DTOs para usuario (`userDTO`), evento (`eventDTO`) y ticket (`ticketDTO`). Ninguna respuesta de la API expone el campo `password`, ni siquiera hasheado. Cuando un documento viene con `populate` (por ejemplo, el evento dentro de un ticket), el DTO correspondiente también filtra esos datos relacionados.

### Controller
Solo coordina la request y la response (`src/controllers/`): extrae datos de `body`/`params`/`query`, llama al service correspondiente, y devuelve la respuesta o delega el error al middleware centralizado con `next(error)`. No contiene lógica de negocio ni importa modelos de Mongoose.

### Manejo de errores centralizado
`src/middlewares/errorHandler.middleware.js` es un middleware de 4 parámetros (`err, req, res, next`) conectado al final de `app.js`. Todos los controllers delegan sus errores ahí con `next(error)`, asegurando un formato de respuesta de error consistente en toda la API:

\`\`\`json
{ "status": "error", "message": "..." }
\`\`\`

Los códigos de estado se diferencian según el tipo de error: `400` (datos inválidos), `401` (no autenticado), `403` (sin permisos), `404` (no encontrado), `409` (conflicto), `500` (error interno).
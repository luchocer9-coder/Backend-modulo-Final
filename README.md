# Plataforma de Eventos e Inscripciones

API REST backend para gestionar eventos e inscripciones. Los organizadores publican eventos, los usuarios se inscriben (con control de cupos) y reciben un email de confirmación.

## Tecnologías

- Node.js (ESM) y Express
- MongoDB Atlas y Mongoose
- Passport.js (`passport-local`, `passport-jwt`)
- JWT en cookie `httpOnly`
- bcryptjs (hash de contraseñas)
- Nodemailer (probado con Mailtrap)
- dotenv y cookie-parser

## Instalación

```bash
git clone https://github.com/luchocer9-coder/Backend-modulo-Final
cd plataforma-eventos
npm install
```

## Variables de entorno

Copiar `.env.example` a `.env` y completar los valores:

| Variable | Descripción |
|---|---|
| PORT | Puerto del servidor (ej. 8080) |
| NODE_ENV | `development` o `production` |
| MONGO_URL | Connection string de MongoDB Atlas |
| JWT_SECRET | Clave secreta para firmar los JWT |
| JWT_EXPIRES_IN | Duración del token (ej. `1h`) |
| MAIL_HOST | Host SMTP |
| MAIL_PORT | Puerto SMTP |
| MAIL_USER | Usuario SMTP |
| MAIL_PASS | Contraseña SMTP |
| MAIL_FROM | Remitente de los emails |

## Comandos

```bash
npm start      # levanta el servidor
npm run dev    # levanta con reinicio automático
```

## Arquitectura en capas

```
src/
├── config/        conexión a MongoDB y estrategias de Passport
├── models/        schemas de Mongoose (User, Event, Ticket)
├── dao/           único lugar que importa modelos; acceso a datos
├── repositories/  capa intermedia sobre los DAO, con métodos de dominio
├── services/      lógica de negocio (cupos, estados, permisos, emails)
├── dtos/          filtran lo que se devuelve (nunca exponen password)
├── controllers/   coordinan request/response
├── middlewares/   autenticación (401), autorización por rol (403), errores
├── routes/        definición de endpoints
└── utils/         hash (bcrypt), jwt, mailer
```

Flujo de una request: `route → middleware → controller → service → repository → dao → modelo`. La respuesta vuelve por el mismo camino, pasando por un DTO en el service.

Reglas de la arquitectura:

- Los modelos de Mongoose solo se importan en los DAO.
- Los services usan repositories, nunca DAO ni modelos.
- Los controllers no tienen lógica de negocio.
- Los errores se delegan con `next(error)` a un middleware centralizado.

## Roles y permisos

| Acción | user | organizer | admin |
|---|:---:|:---:|:---:|
| Consultar eventos | ✅ | ✅ | ✅ |
| Inscribirse a un evento | ✅ | ✅ | ✅ |
| Crear eventos | ❌ | ✅ | ✅ |
| Modificar/cancelar eventos propios | ❌ | ✅ | ✅ |
| Modificar cualquier evento | ❌ | ❌ | ✅ |
| Ver inscripciones de un evento | ❌ | ✅ (propios) | ✅ |
| Ver todos los usuarios | ❌ | ❌ | ✅ |

- **401**: no hay sesión válida (falta la cookie o el token es inválido/expirado).
- **403**: hay sesión, pero el rol o la propiedad del recurso no alcanzan.

### Usuarios de prueba

El registro público siempre crea usuarios con rol `user` (el `role` del body se ignora). Para probar los otros roles:

1. Registrar el usuario con `POST /api/sessions/register`.
2. En MongoDB Atlas → colección `users`, editar el documento y cambiar `role` a `organizer` o `admin`.
3. Volver a hacer login para que el nuevo JWT tenga el rol actualizado.

## Endpoints

### Sesiones

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | /api/sessions/register | público | Registra un usuario |
| POST | /api/sessions/login | público | Login; setea cookie `currentUser` |
| GET | /api/sessions/current | autenticado | Datos del usuario autenticado |
| POST | /api/sessions/logout | público | Borra la cookie |

### Eventos

| Método | Ruta | Acceso |
|---|---|---|
| POST | /api/events | organizer, admin |
| GET | /api/events | público |
| GET | /api/events/:id | público |
| PUT | /api/events/:id | dueño o admin |
| PATCH | /api/events/:id/status | dueño o admin |

Filtros de `GET /api/events`: `status`, `category`, `location`, `dateFrom`, `dateTo`, `page`, `limit`, `sort` (ej. `sort=date` o `sort=-date`).

### Tickets

| Método | Ruta | Acceso |
|---|---|---|
| POST | /api/events/:eid/tickets | autenticado |
| GET | /api/tickets/my-tickets | autenticado (propios) |
| GET | /api/events/:eid/tickets | organizer dueño o admin |
| PATCH | /api/tickets/:tid/cancel | dueño del ticket o admin |

### Usuarios

| Método | Ruta | Acceso |
|---|---|---|
| GET | /api/users | admin |

## Ejemplos de uso

**Registro**
```json
POST /api/sessions/register
{ "first_name": "Ana", "last_name": "Pérez", "email": "ana@mail.com", "password": "Secreta123" }
```
Respuesta 201:
```json
{ "status": "success", "payload": { "id": "...", "first_name": "Ana", "last_name": "Pérez", "email": "ana@mail.com", "role": "user" } }
```

**Crear evento** (organizer o admin)
```json
POST /api/events
{ "title": "Workshop de Node", "description": "Intro a Node.js", "category": "workshop", "date": "2026-12-15", "location": "CABA", "capacity": 30, "price": 500 }
```

**Listado paginado**
```
GET /api/events?status=published&category=workshop&page=1&limit=5
```
```json
{ "status": "success", "data": [ ... ], "page": 1, "limit": 5, "total": 1, "totalPages": 1 }
```

**Inscripción**
```json
POST /api/events/:eid/tickets
{ "quantity": 1 }
```
Respuesta 201 con el ticket (`status: "confirmed"`, `reservationCode`). Errores: 404 (evento inexistente), 400 (evento no publicado o sin cupo), 409 (inscripción duplicada activa).

## Flujo de autenticación

1. `POST /api/sessions/register` valida los datos, normaliza el email, hashea la contraseña con bcrypt y crea el usuario (estrategia `register`).
2. `POST /api/sessions/login` valida las credenciales (estrategia `login`). El controller genera el JWT (`{ id, email, role }`) y lo guarda en la cookie `currentUser` (`httpOnly`, `sameSite: lax`, `secure` solo en producción).
3. `GET /api/sessions/current` lee la cookie, verifica el JWT (estrategia `current`) y devuelve `{ id, email, role }`.
4. `POST /api/sessions/logout` elimina la cookie.

Ante credenciales incorrectas siempre se responde `"Credenciales inválidas"`, sin distinguir si falló el email o la contraseña. Ninguna respuesta incluye `password`.

## Flujo de inscripción

1. El usuario autenticado hace `POST /api/events/:eid/tickets`.
2. El service valida: el evento existe, está `published`, `quantity` es válida, no hay una inscripción activa previa del usuario y hay cupo suficiente.
3. **Regla de cupos:** cupo ocupado = suma de `quantity` de los tickets del evento que **no** están `cancelled`.
4. Se crea el ticket `confirmed` con un `reservationCode` único y se envía el email de confirmación con Nodemailer.
5. Cancelar (`PATCH /api/tickets/:tid/cancel`) cambia el estado a `cancelled` y registra `cancelledAt`. El documento no se elimina y el cupo queda libre automáticamente.

## Reglas de negocio de eventos

- El `organizer` se asigna desde el usuario autenticado, nunca desde el body.
- No se permite crear eventos con fecha pasada, `capacity <= 0` ni `price < 0`.
- Los eventos cancelados no se pueden modificar ni cambiar de estado.
- No se puede publicar un evento `finished` o `cancelled`.
- Los eventos no se eliminan: cancelar es cambiar el `status` a `cancelled`.
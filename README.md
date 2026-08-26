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
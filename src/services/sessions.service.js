import { registerUser, getUserByEmail } from '../repositories/users.repository.js';
import { hashPassword } from '../utils/hash.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export const register = async ({ first_name, last_name, email, password }) => {
    // 1. Validar presencia de campos
    if (!first_name || !last_name || !email || !password) {
        throw { status: 400, message: 'Faltan campos obligatorios' };
    }

    // 2. Normalizar email (trim + lowercase)
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Validar formato de email
    if (!EMAIL_REGEX.test(normalizedEmail)) {
        throw { status: 400, message: 'El formato del email es inválido' };
    }

    // 4. Validar longitud mínima de contraseña
    if (password.length < MIN_PASSWORD_LENGTH) {
        throw { status: 400, message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` };
    }

    // 5. Verificar si el email ya existe
    const existingUser = await getUserByEmail(normalizedEmail);
    if (existingUser) {
        throw { status: 409, message: 'El email ya está registrado' };
    }

    // 6. Hashear la contraseña
    const hashedPassword = await hashPassword(password);

    // 7. Crear el usuario (role NO viene del body, queda fijo en 'user')
    const newUser = await registerUser({
        first_name,
        last_name,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'user',
    });

    // 8. Devolver el usuario SIN la contraseña
    return {
        id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role: newUser.role,
    };
};
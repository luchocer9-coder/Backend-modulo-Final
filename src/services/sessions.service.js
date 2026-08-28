import { registerUser, getUserByEmail } from '../repositories/users.repository.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';

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

export const login = async ({ email, password }) => {
    // 1. Validar presencia de campos
    if (!email || !password) {
        throw { status: 400, message: 'Faltan campos obligatorios' };
    }

    // 2. Normalizar email (mismo criterio que en el registro)
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Buscar usuario por email
    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
        throw { status: 401, message: 'Credenciales inválidas' };
    }

    // 4. Comparar contraseña
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw { status: 401, message: 'Credenciales inválidas' };
    }

    // 5. Generar el token con datos mínimos (sin password)
    const token = generateToken({
        id: user._id,
        email: user.email,
        role: user.role,
    });

    return token;
};
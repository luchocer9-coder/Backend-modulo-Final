import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { getUserByEmail, registerUser } from '../repositories/users.repository.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { Strategy as JwtStrategy } from 'passport-jwt';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

passport.use('register', new LocalStrategy(
    {
        usernameField: 'email',
        passReqToCallback: true,
    },
    async (req, email, password, done) => {
        try {
            const { first_name, last_name } = req.body;

            if (!first_name || !last_name || !email || !password) {
                return done(null, false, { message: 'Faltan campos obligatorios' });
            }

            const normalizedEmail = email.trim().toLowerCase();

            if (!EMAIL_REGEX.test(normalizedEmail)) {
                return done(null, false, { message: 'El formato del email es inválido' });
            }

            if (password.length < MIN_PASSWORD_LENGTH) {
                return done(null, false, { message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` });
            }

            const existingUser = await getUserByEmail(normalizedEmail);
            if (existingUser) {
                return done(null, false, { message: 'El email ya está registrado' });
            }

            const hashedPassword = await hashPassword(password);

            const newUser = await registerUser({
                first_name,
                last_name,
                email: normalizedEmail,
                password: hashedPassword,
                role: 'user',
            });

            return done(null, newUser);
        } catch (error) {
            return done(error);
        }
    }
));

passport.use('login', new LocalStrategy(
    {
        usernameField: 'email',
    },
    async (email, password, done) => {
        try {
            const normalizedEmail = email.trim().toLowerCase();

            const user = await getUserByEmail(normalizedEmail);
            if (!user) {
                return done(null, false, { message: 'Credenciales inválidas' });
            }

            const isPasswordValid = await comparePassword(password, user.password);
            if (!isPasswordValid) {
                return done(null, false, { message: 'Credenciales inválidas' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

const cookieExtractor = (req) => {
    if (req && req.cookies) {
        return req.cookies.currentUser;
    }
    return null;
};

passport.use('current', new JwtStrategy(
    {
        jwtFromRequest: cookieExtractor,
        secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
        try {
            return done(null, payload);
        } catch (error) {
            return done(error);
        }
    }
));

export default passport;
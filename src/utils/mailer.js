import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

export const sendTicketConfirmationEmail = async (userEmail, eventTitle, reservationCode) => {
    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: userEmail,
            subject: 'Confirmación de inscripción',
            html: `
                <h2>¡Inscripción confirmada!</h2>
                <p>Te inscribiste correctamente al evento: <strong>${eventTitle}</strong></p>
                <p>Tu código de reserva es: <strong>${reservationCode}</strong></p>
            `,
        });
    } catch (error) {
        console.error('Error al enviar el email de confirmación:', error.message);
    }
};
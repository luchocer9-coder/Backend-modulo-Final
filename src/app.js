import express from 'express';
import eventsRouter from './routes/events.router.js';
import sessionsRouter from './routes/sessions.router.js';

const app = express();

app.use(express.json());

// Ruta de health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Servidor activo' });
});

// Rutas
app.use('/api/events', eventsRouter);
app.use('/api/sessions', sessionsRouter);

export default app;
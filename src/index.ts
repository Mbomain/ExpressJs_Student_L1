import express from 'express';
import { Express } from 'express';
import dotenv from 'dotenv';
import corsMiddleware from './configuration/cors';
import { StudentController } from './controllers/StudentController';
import { AuthController } from './controllers/AuthController';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(corsMiddleware);
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

new AuthController(app);
new StudentController(app);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

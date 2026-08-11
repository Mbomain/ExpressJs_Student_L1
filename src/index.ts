import express from 'express';
import dotenv from 'dotenv';
import { StudentController } from './controllers/StudentController';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

new StudentController(app);
  
app.listen(PORT)

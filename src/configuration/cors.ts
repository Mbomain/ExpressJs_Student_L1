import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const ALL_ORIGINS = '*';
const ORIGINS = process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()) || [
  ALL_ORIGINS,
];

export default cors({
  origin: ORIGINS.includes(ALL_ORIGINS) ? ALL_ORIGINS : ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import preferencesRoutes from './routes/preferences';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Runtime API is running' });
});

app.use('/auth', authRoutes);
app.use('/preferences', preferencesRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
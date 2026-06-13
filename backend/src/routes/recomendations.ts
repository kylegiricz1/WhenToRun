import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getTomorrowForecast } from '../services/weather';
import { getBestWindow } from '../services/scoring';

const router = Router();

router.use(authenticate);

router.get('/tomorrow', async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { preferences: true }
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (!user.latitude || !user.longitude) {
    res.status(400).json({ error: 'No location set. Please update your profile.' });
    return;
  }

  if (!user.preferences) {
    res.status(400).json({ error: 'No preferences set. Please complete your profile.' });
    return;
  }

  // Check if we already generated one today
  const existingRec = await prisma.recommendation.findFirst({
    where: {
      userId: req.userId as string,
      date: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    }
  });

  if (existingRec) {
    res.json(existingRec);
    return;
  }

  // Generate a fresh recommendation
  const forecast = await getTomorrowForecast(user.latitude, user.longitude);
  const best = getBestWindow(forecast, user.preferences);

  if (!best) {
    res.status(500).json({ error: 'Could not generate recommendation' });
    return;
  }

  const recommendation = await prisma.recommendation.create({
    data: {
      userId: req.userId as string,
      date: new Date(),
      windowStart: best.start,
      windowEnd: best.end,
      summary: best.summary,
      score: best.score
    }
  });

  res.json(recommendation);
});

router.get('/history', async (req: AuthRequest, res: Response) => {
  const recommendations = await prisma.recommendation.findMany({
    where: { userId: req.userId },
    orderBy: { date: 'desc' },
    take: 30,
    include: { runLog: true }
  });

  res.json(recommendations);
});

export default router;
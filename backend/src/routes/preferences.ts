import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  const prefs = await prisma.preferences.findUnique({
    where: { userId: req.userId }
  });

  if (!prefs) {
    res.status(404).json({ error: 'Preferences not found' });
    return;
  }

  res.json(prefs);
});

router.put('/', async (req: AuthRequest, res: Response) => {
  const {
    minTemp,
    maxTemp,
    preferMorning,
    preferAfternoon,
    preferEvening,
    activeDays
  } = req.body;

  const prefs = await prisma.preferences.upsert({
    where: { userId: req.userId as string },
    update: {
      minTemp,
      maxTemp,
      preferMorning,
      preferAfternoon,
      preferEvening,
      activeDays
    },
    create: {
      userId: req.userId as string,
      minTemp,
      maxTemp,
      preferMorning,
      preferAfternoon,
      preferEvening,
      activeDays
    }
  });

  res.json(prefs);
});

export default router;
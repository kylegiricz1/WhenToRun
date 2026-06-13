import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.put('/location', async (req: AuthRequest, res: Response) => {
  const { latitude, longitude } = req.body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    res.status(400).json({ error: 'latitude and longitude must be numbers' });
    return;
  }

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { latitude, longitude }
  });

  res.json({ latitude: user.latitude, longitude: user.longitude });
});

router.put('/push-token', async (req: AuthRequest, res: Response) => {
  const { pushToken } = req.body;

  if (!pushToken) {
    res.status(400).json({ error: 'pushToken is required' });
    return;
  }

  await prisma.user.update({
    where: { id: req.userId },
    data: { pushToken }
  });

  res.json({ success: true });
});

export default router;
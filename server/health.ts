import { Request, Response, Router } from 'express';
import { Server as SocketServer } from 'socket.io';

export function createHealthRouter(io: SocketServer, getActiveRoomsCount: () => number) {
  const router = Router();
  let isShuttingDown = false;

  // Liveness Endpoint
  router.get('/healthz', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  });

  // Readiness Endpoint (Inspects heap memory & shutdown state)
  router.get('/readyz', (_req: Request, res: Response) => {
    if (isShuttingDown) {
      return res.status(503).json({ status: 'shutting_down', reason: 'Server initiating graceful shutdown' });
    }

    const memory = process.memoryUsage();
    const heapUsedRatio = memory.heapUsed / memory.heapTotal;

    if (heapUsedRatio > 0.92) {
      return res.status(503).json({ status: 'unhealthy', reason: 'High memory usage', heapUsedRatio });
    }

    res.status(200).json({
      status: 'ready',
      activeConnections: io.engine.clientsCount,
      activeRooms: getActiveRoomsCount(),
    });
  });

  // Application Telemetry Endpoint
  router.get('/metrics', (_req: Request, res: Response) => {
    res.status(200).json({
      activeConnections: io.engine.clientsCount,
      activeRooms: getActiveRoomsCount(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    });
  });

  return {
    router,
    setShuttingDown: () => { isShuttingDown = true; }
  };
}

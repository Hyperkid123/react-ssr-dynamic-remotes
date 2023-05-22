import type { Request, Response, NextFunction } from 'express';

export default (clientDir: string) =>
  async function serverRender(req: Request, res: Response, next: NextFunction) {
    const renderer = (await import('./render')).default;
    return renderer(req, res, next, clientDir);
  };

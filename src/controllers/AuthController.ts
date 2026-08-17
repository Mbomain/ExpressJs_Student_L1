import { Express, Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { authenticate } from '../security/AuthMiddleware';
import { HttpError } from '../security/HttpError';

export class AuthController {
  private authService: AuthService;

  constructor(app: Express) {
    this.authService = new AuthService();
    this.setupRoutes(app);
  }

  private setupRoutes(app: Express): void {
    app.post('/api/auth/register', (req, res) => this.register(req, res));
    app.post('/api/auth/login', (req, res) => this.login(req, res));
    app.get('/api/auth/whoami', authenticate, (req, res) => res.status(200).json(req.authUser));
  }

  private async register(req: Request, res: Response) {
    try {
      const authentication = await this.authService.register(req.body);
      res.status(201).json(authentication);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async login(req: Request, res: Response) {
    try {
      const authentication = await this.authService.login(req.body);
      res.status(200).json(authentication);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Internal server error';

    res.status(status).json({ error: message });
  }
}

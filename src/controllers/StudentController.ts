import { Request, Response, Express } from 'express';
import { StudentService } from '../services/StudentService';

export class StudentController {
  private studentService: StudentService;

  constructor(app: Express) {
    this.studentService = new StudentService();
    this.setupRoutes(app);
  }

  private setupRoutes(app: Express): void {
    app.get('/api/students', (req, res) => this.getAll(req, res));
    app.get('/api/students/:id', (req, res) => this.getById(req, res));
    app.post('/api/students', (req, res) => this.create(req, res));
    app.put('/api/students/:id', (req, res) => this.update(req, res));
    app.patch('/api/students/:id', (req, res) => this.patch(req, res));
    app.delete('/api/students/:id', (req, res) => this.delete(req, res));
  }

  private async getAll(req: Request, res: Response) {
    try {
      const students = await this.studentService.getAllStudents();
      res.status(200).json(students);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const student = await this.studentService.getStudentById(id);
      res.status(200).json(student);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async create(req: Request, res: Response) {
    try {
      const student = await this.studentService.createStudent(req.body);
      res.status(201).json(student);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const student = await this.studentService.updateStudent(id, req.body);
      res.status(200).json(student);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async patch(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const student = await this.studentService.updateStudent(id, req.body);
      res.status(200).json(student);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      await this.studentService.deleteStudent(id);
      res.status(204).send();
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: unknown, res: Response): void {
    const message = error instanceof Error ? error.message : 'Internal server error';

    if (message.includes('not found')) {
      res.status(404).json({ error: message });
    } else if (
      message.includes('already exists') ||
      message.includes('required') ||
      message.includes('Invalid')
    ) {
      res.status(400).json({ error: message });
    } else {
      res.status(500).json({ error: message });
    }
  }
}

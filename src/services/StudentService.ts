import { StudentRepository } from '../repositories/StudentRepository';
import { Student, CreateStudentDTO, UpdateStudentDTO } from '../models/Student';

export class StudentService {
  private studentRepository: StudentRepository;

  constructor() {
    this.studentRepository = new StudentRepository();
  }

  async getAllStudents(): Promise<Student[]> {
    return this.studentRepository.findAll();
  }

  async getStudentById(id: number): Promise<Student> {
    if (id <= 0) throw new Error('Invalid student ID');

    const student = await this.studentRepository.findById(id);
    if (!student) throw new Error('Student not found');

    return student;
  }

  async createStudent(data: CreateStudentDTO): Promise<Student> {
    this.validateStudentData(data);

    const existingStudent = await this.studentRepository.findByEmail(data.email);
    if (existingStudent) throw new Error('Email already exists');

    return this.studentRepository.create(data);
  }

  async updateStudent(id: number, data: UpdateStudentDTO): Promise<Student> {
    if (id <= 0) throw new Error('Invalid student ID');

    const student = await this.studentRepository.findById(id);
    if (!student) throw new Error('Student not found');

    if (data.email && data.email !== student.email) {
      const existingStudent = await this.studentRepository.findByEmail(data.email);
      if (existingStudent) throw new Error('Email already exists');
    }

    const updated = await this.studentRepository.update(id, data);
    if (!updated) throw new Error('Student not found');

    return updated;
  }

  async deleteStudent(id: number): Promise<void> {
    if (id <= 0) throw new Error('Invalid student ID');

    const student = await this.studentRepository.findById(id);
    if (!student) throw new Error('Student not found');

    await this.studentRepository.delete(id);
  }

  private validateStudentData(data: CreateStudentDTO): void {
    if (!data.firstName?.trim()) throw new Error('First name is required');
    if (!data.lastName?.trim()) throw new Error('Last name is required');
    if (!data.email?.trim()) throw new Error('Email is required');
    if (!this.isValidEmail(data.email)) throw new Error('Invalid email format');
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

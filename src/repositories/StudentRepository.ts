import pool from '../configuration/database';
import { Student, CreateStudentDTO, UpdateStudentDTO } from '../models/Student';

export class StudentRepository {
  async findAll(): Promise<Student[]> {
    const result = await pool.query(
      'SELECT * FROM students ORDER BY created_at DESC'
    );
    return result.rows;
  }

  async findById(id: number): Promise<Student | null> {
    const result = await pool.query(
      'SELECT * FROM students WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<Student | null> {
    const result = await pool.query(
      'SELECT * FROM students WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async create(data: CreateStudentDTO): Promise<Student> {
    const result = await pool.query(
      `INSERT INTO students (first_name, last_name, email, phone, date_of_birth, address, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [
        data.firstName,
        data.lastName,
        data.email,
        data.phone || null,
        data.dateOfBirth || null,
        data.address || null,
      ]
    );
    return result.rows[0];
  }

  async update(id: number, data: UpdateStudentDTO): Promise<Student | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (data.firstName !== undefined) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(data.firstName);
    }
    if (data.lastName !== undefined) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(data.lastName);
    }
    if (data.email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(data.email);
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(data.phone || null);
    }
    if (data.dateOfBirth !== undefined) {
      updates.push(`date_of_birth = $${paramCount++}`);
      values.push(data.dateOfBirth || null);
    }
    if (data.address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(data.address || null);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    if (updates.length === 1) return this.findById(id);

    const result = await pool.query(
      `UPDATE students SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<Student | null> {
    const result = await pool.query(
      'DELETE FROM students WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  }
}

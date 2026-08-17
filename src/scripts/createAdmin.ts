import pool from '../configuration/database';
import { AuthService } from '../services/AuthService';

const createAdmin = async () => {
  const [email, password] = process.argv.slice(2);

  if (!email || !password) {
    console.error('Usage: npm run create:admin -- <email> <password>');
    process.exit(1);
  }

  try {
    const { user } = await new AuthService().register({ email, password }, 'ADMIN');
    console.log(`Admin created: #${user.id} ${user.email}`);
    await pool.end();
  } catch (error) {
    console.error('Admin creation failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

createAdmin();

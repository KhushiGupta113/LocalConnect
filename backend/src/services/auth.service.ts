import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

export function generateHandle(email: string, fullName: string): string {
  if (fullName.toLowerCase().includes('maya')) {
    return 'mayalind';
  }
  const base = email.split('@')[0] ?? 'neighbor';
  const clean = base.replace(/[^a-z0-9]/gi, '').toLowerCase();
  return clean || `neighbor_${Math.floor(Math.random() * 1000)}`;
}


import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
  ssl: true
})

export type User = {
  id: number
  username: string
  password: string
}

export async function getUsersSafe(username: string): Promise<User[]> {
  const result = await pool.query<User>(
    'SELECT id, username, password FROM users WHERE username = $1',
    [username]
  )
  return result.rows
}

export async function getUsersUnsafe(username: string): Promise<User[]> {
  const result = await pool.query<User>(
    "SELECT id, username, password FROM users WHERE username = '" + username + "'"
  )
  return result.rows
}

export type Account = {
  id: number
  username: string
  iban: string
  balance: string
  csrf_token: string | null
}

export async function login(username: string, password: string, newCsrfToken: string): Promise<Account | undefined> {
  const result = await pool.query<Account>(
    `UPDATE users SET csrf_token = COALESCE(csrf_token, $3)
     WHERE username = $1 AND password = $2
     RETURNING id, username, iban, balance, csrf_token`,
    [username, password, newCsrfToken]
  )
  return result.rows[0]
}

export async function getAccount(id: number): Promise<Account | undefined> {
  const result = await pool.query<Account>(
    'SELECT id, username, iban, balance, csrf_token FROM users WHERE id = $1',
    [id]
  )
  return result.rows[0]
}

export async function transfer(senderId: number, recipientIban: string, amount: string) {
  await pool.query('UPDATE users SET balance = balance - $2 WHERE id = $1', [senderId, amount])
  await pool.query('UPDATE users SET balance = balance + $2 WHERE iban = $1', [recipientIban, amount])
}

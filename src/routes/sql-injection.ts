import express from 'express'
import { getUsersSafe, getUsersUnsafe, type User } from '../db/pool.ts'

const router = express.Router()

router.get('/', async (req, res) => {
  const username = req.query.username as string


  const vulnerable = req.query.vulnerable === 'on'
  let users: User[] = []
  let error: string | undefined
  try {
    if (vulnerable) {
      users = await getUsersUnsafe(username)
    } else {
      users = await getUsersSafe(username)
    }
  } catch (err) {
    error = (err as Error).message
  }

  res.render('sql-injection', { username, vulnerable, users, error, searched: true })
})

export default router

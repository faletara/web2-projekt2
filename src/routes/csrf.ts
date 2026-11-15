import express from 'express'
import crypto from 'crypto'
import { login, getAccount, transfer, type Account } from '../db/pool.ts'

const router = express.Router()

let csrfVulnerable = true

async function getSignedInAccount(req: express.Request): Promise<Account | undefined> {
  const userId = req.signedCookies.userId
  if (!userId) return undefined
  return getAccount(Number(userId))
}

function validCsrfToken(req: express.Request, account: Account | undefined) {
  return Boolean(account?.csrf_token) && req.body.csrfToken === account?.csrf_token
}

router.get('/login', (req, res) => {
  res.render('csrf-login')
})

router.post('/logout', (req, res) => {
  res.clearCookie('userId')
  res.redirect('/csrf/login')
})

router.post('/login', async (req, res) => {
  const newCsrfToken = crypto.randomBytes(32).toString('hex')
  const account = await login(req.body.username, req.body.password, newCsrfToken)
  if (!account) {
    res.render('csrf-login', { error: 'Pogrešno korisničko ime ili lozinka', username: req.body.username })
    return
  }

  res.cookie('userId', account.id, {
    signed: true,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  })
  res.redirect('/csrf')
})

router.get('/', async (req, res) => {
  const account = await getSignedInAccount(req)
  if (!account) {
    res.redirect('/csrf/login')
    return
  }

  res.render('csrf', { account, csrfVulnerable, csrfToken: account.csrf_token })
})

router.post('/toggle', async (req, res) => {
  if (!csrfVulnerable && !validCsrfToken(req, await getSignedInAccount(req))) {
    res.status(403).send('CSRF token neispravan')
    return
  }

  csrfVulnerable = req.body.vulnerable === 'on'
  res.redirect('/csrf')
})

router.post('/transfer', async (req, res) => {
  const account = await getSignedInAccount(req)
  if (!account) {
    res.redirect('/csrf/login')
    return
  }

  if (!csrfVulnerable && !validCsrfToken(req, account)) {
    res.status(403).send('CSRF token neispravan')
    return
  }

  await transfer(account.id, req.body.iban, req.body.amount)
  res.redirect('/csrf')
})

export default router

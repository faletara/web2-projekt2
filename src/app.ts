import express from 'express'
import path from 'path'
import cookieParser from 'cookie-parser'
import { port, baseURL, onRender, cookieKey } from './config.ts'
import sqlInjectionRouter from './routes/sql-injection.ts'
import csrfRouter from './routes/csrf.ts'

const app = express()
app.set('views', path.join(import.meta.dirname, 'views'))
app.set('view engine', 'pug')

const hostname = onRender ? '0.0.0.0' : '127.0.0.1'

app.use(express.urlencoded({ extended: true }))

app.use(cookieParser(cookieKey))


app.get('/', (req, res) => {
  res.render('index')
})

app.use('/sql-injection', sqlInjectionRouter)
app.use('/csrf', csrfRouter)

app.listen(port, hostname, () => {
  console.log(`Server running at ${baseURL}`)
})

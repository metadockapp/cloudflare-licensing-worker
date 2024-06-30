import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/activate', (c) => {
  if (c.req.method.toLowerCase() != "post") {
    return c.text("");
  }
})

export default app

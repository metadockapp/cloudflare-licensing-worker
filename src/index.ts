import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { uuid } from 'uuidv4'

type Bindings = {
  licenses: KVNamespace,
  activations: KVNamespace,
  hardwareIds: KVNamespace,
  tokens: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

const schema = z.object({
  licenseKey: z.string().uuid(),
  hardwareId: z.string().length(64)
})



app.get('/activate', zValidator('json', schema), async (c) => {
  if (c.req.method.toLowerCase() != "post") {
    return c.text("", 403)
  }

  const data = c.req.valid('json')
  const { hardwareId, licenseKey } = data
  const expiration = await c.env.licenses.get(licenseKey)
  const activationToken = await c.env.activations.get(licenseKey)
  
  // license key does not exist
  if (!expiration) {
    return c.json({
      success: false
    })
  }

  const expirationTimestamp = Number.parseInt(expiration)
  // license expired
  if (Date.now() > expirationTimestamp) {
    return c.json({
      success: false
    })
  }

  // deactivate the existing activation token, so a license key can only be used once
  if (activationToken != null) {
    await c.env.hardwareIds.delete(activationToken)
    await c.env.tokens.delete(activationToken)
    await c.env.activations.delete(licenseKey)
  }

  // create a new activation token and activate it, then return them the token
  const newActivationToken = uuid();
  await c.env.tokens.put(newActivationToken, licenseKey);
  await c.env.hardwareIds.put(newActivationToken, hardwareId);
  await c.env.activations.put(licenseKey, newActivationToken);

  return c.json({
    token: newActivationToken,
    success: true
  })
})

export default app

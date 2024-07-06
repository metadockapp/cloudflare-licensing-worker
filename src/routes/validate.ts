import { Context  } from "hono"
import Bindings from "../includes/bindings"
import * as openpgp from 'openpgp'

export default async (c: Context<{ Bindings: Bindings }>) => {
    /** @ts-ignore */
    const { token, hardwareId } = c.req.valid('json')

    const activeHardwareId = await c.env.hardwareIds.get(token)
    const licenseKey = await c.env.tokens.get(token)
    
    if (!licenseKey || !activeHardwareId) {
      return c.text("", 402)
    }
    
    if (activeHardwareId != hardwareId) {
      return c.text("", 402)
    }
    
    let currentActivationToken = await c.env.activations.get(licenseKey)
    
    if (currentActivationToken != token) {
      await c.env.tokens.delete(token)
      await c.env.hardwareIds.delete(token)
    
      return c.text("", 402)
    }
    
    
    let expiration = await c.env.licenses.get(licenseKey)
    
    // license key does not exist
    if (!expiration) {
      return c.text("", 402)
    }
    
    const expirationTimestamp = Number.parseInt(expiration)
    
    // license expired
    if (Date.now() > expirationTimestamp) {
      return c.text("", 402)
    }

    const privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: c.env.PRIVATE_KEY }),
        passphrase: c.env.PASSPHRASE
    });

    const unsignedMessage = await openpgp.createCleartextMessage({ text: '' });
    const signedMessage = await openpgp.sign({
        message: unsignedMessage, // CleartextMessage or Message object
        signingKeys: privateKey
    });

    return c.text(signedMessage)
}
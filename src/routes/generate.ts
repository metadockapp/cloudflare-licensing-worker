import { Context  } from "hono"
import Bindings from "../includes/bindings"
import * as openpgp from 'openpgp'
import {v4 as uuid} from "uuid";

export default async (c: Context<{ Bindings: Bindings }>) => {
    const apiKey = c.req.header('x-api-key')
    if (!apiKey || apiKey != c.env.API_KEY) {
        return c.text("", 403)
    }

    const json = await c.req.json()

    if (typeof json['expiration'] == 'undefined') {
        return c.text("", 402)
    }

    const expiration = json["expiration"] as number

    if (expiration < Date.now()) {
        return c.text("", 402)
    }

    let quantity = 1
    if (typeof json['quantity'] == 'number') {
        quantity = json['quantity']
    }

    let keys: string[] = []

    for (let i = 0; i < quantity; i++) {
        const licenseKey = await createLicenseKey(c, expiration)
        keys.push(licenseKey)
    }

    return c.json({
        keys
    })
}

async function createLicenseKey(c: Context<{ Bindings: Bindings}>, expiration: number) {
    const licenseKey = uuid()
    await c.env.licenses.put(licenseKey, expiration.toString())

    return licenseKey
}
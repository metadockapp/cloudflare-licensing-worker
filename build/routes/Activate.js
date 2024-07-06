import { v4 as uuid } from 'uuid';
export default async (c) => {
    /** @ts-ignore */
    const data = c.req.valid('json');
    const { hardwareId, licenseKey } = data;
    const expiration = await c.env.licenses.get(licenseKey);
    const activationToken = await c.env.activations.get(licenseKey);
    // license key does not exist
    if (!expiration) {
        return c.text("", 402);
    }
    const expirationTimestamp = Number.parseInt(expiration);
    // license expired
    if (Date.now() > expirationTimestamp) {
        return c.text("", 402);
    }
    // deactivate the existing activation token, so a license key can only be used once
    if (activationToken != null) {
        await c.env.hardwareIds.delete(activationToken);
        await c.env.tokens.delete(activationToken);
        await c.env.activations.delete(licenseKey);
    }
    // create a new activation token and activate it, then return them the token
    const newActivationToken = uuid();
    await c.env.tokens.put(newActivationToken, licenseKey);
    await c.env.hardwareIds.put(newActivationToken, hardwareId);
    await c.env.activations.put(licenseKey, newActivationToken);
    return c.json({
        token: newActivationToken,
        success: true
    });
};

import { z } from 'zod'

export default z.object({
    licenseKey: z.string().uuid(),
    hardwareId: z.string().length(64)
  })
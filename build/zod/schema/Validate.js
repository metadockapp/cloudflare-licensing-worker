import { z } from 'zod';
export default z.object({
    token: z.string().uuid(),
    hardwareId: z.string().length(64)
});

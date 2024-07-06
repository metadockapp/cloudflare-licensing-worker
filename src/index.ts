import {Context, Hono} from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import ActivateSchema from './schema/activate'
import ValidateSchema from './schema/validate'
import Bindings from './includes/bindings'
import Activate from './routes/activate'
import Validate from './routes/validate'
import Generate from './routes/generate'

const app = new Hono<{ Bindings: Bindings }>()

app.post('/activate', zValidator('json', ActivateSchema), Activate)
app.post('/validate', zValidator('json', ValidateSchema), Validate)
app.post('/generate', Generate)
export default app

import { Router, type Router as ExpressRouter } from 'express'
import { getHealth } from './health.controller.js'

export const healthRoutes: ExpressRouter = Router()

healthRoutes.get('/api/health', getHealth)

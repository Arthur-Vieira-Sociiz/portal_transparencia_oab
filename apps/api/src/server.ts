import './environment.js'
import { createApp } from './app.js'
import { readEnvironment } from './environment.js'

const { port } = readEnvironment()

createApp().listen(port, () => {
  console.log(`API disponível em http://localhost:${port}`)
})

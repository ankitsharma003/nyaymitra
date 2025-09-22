// Health check endpoint
import serverApp from '../backend/src/server.js'

export default async function handler(req, res) {
  // Use the Express app to handle the request
  return new Promise((resolve) => {
    serverApp(req, res, () => {
      resolve()
    })
  })
}

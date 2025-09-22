// Vercel serverless function entry point
import serverApp from '../backend/src/server.js'

// Export the Express app for Vercel
export default async function handler(req, res) {
  // Use the Express app to handle the request
  return new Promise((resolve) => {
    serverApp(req, res, () => {
      resolve()
    })
  })
}

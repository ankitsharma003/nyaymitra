/* eslint-disable @typescript-eslint/no-unused-vars */
/* src/config/database.js */
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/nyaymitra'

// Internal state
let connected = false
let connecting = false

// Basic retry config
const MAX_RETRIES = parseInt(process.env.MONGODB_CONNECT_RETRIES || '5', 10)
const RETRY_DELAY_MS = parseInt(
  process.env.MONGODB_RETRY_DELAY_MS || '5000',
  10
)

async function _connectWithRetry(retriesLeft = MAX_RETRIES) {
  if (connecting) return
  connecting = true

  try {
    // Use modern mongoose defaults with additional options for stability
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    })

    connected = true
    connecting = false
    console.log('✅ MongoDB connected to', mongoose.connection.host)
  } catch (err) {
    connecting = false
    connected = false
    console.error(`MongoDB connection attempt failed: ${err.message}`)

    if (retriesLeft > 0) {
      console.log(
        `⏳ Retrying MongoDB connection in ${RETRY_DELAY_MS}ms... (${retriesLeft} retries left)`
      )
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS))
      return _connectWithRetry(retriesLeft - 1)
    } else {
      console.error('❌ MongoDB connection failed after retries.')
      // Do not exit here in serverless environment; keep the flag false and return
      // process.exit(1) // uncomment only if you want process to exit
    }
  }
}

// Public function to initiate connection (call once at app start)
// eslint-disable-next-line no-unused-vars
async function connectDB() {
  if (connected) {
    return
  }
  await _connectWithRetry()
  // Set up listeners
  mongoose.connection.on('connected', () => {
    connected = true
    console.log('MongoDB connection event: connected')
  })

  mongoose.connection.on('disconnected', () => {
    connected = false
    console.warn('MongoDB connection event: disconnected')
  })

  mongoose.connection.on('error', (err) => {
    connected = false
    console.error('MongoDB connection event: error', err)
  })

  // Graceful shutdown
  if (typeof process !== 'undefined') {
    const shutdown = async () => {
      try {
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.close(false)
          console.log('🔌 MongoDB connection closed.')
        }
      } catch (e) {
        console.error('Error closing MongoDB connection:', e)
      } finally {
        // Only exit in non-serverless local environments if desired
        if (
          process.env.NODE_ENV !== 'production' &&
          process.env.FORCE_EXIT_ON_DB_CLOSE === 'true'
        ) {
          process.exit(0)
        }
      }
    }

    process.on('SIGINT', shutdown)
    process.on('SIGTERM', shutdown)
  }
}

// Exported accessor used by middleware
function isDBConnected() {
  // mongoose.connection.readyState values:
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  try {
    return (
      mongoose && mongoose.connection && mongoose.connection.readyState === 1
    )
  } catch (e) {
    return false
  }
}

// Helpful: exposes the underlying mongoose for models/tests
export { _connectWithRetry as connectDB, isDBConnected, mongoose }

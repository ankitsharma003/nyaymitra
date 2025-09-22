#!/usr/bin/env node

// Comprehensive Vercel deployment test
import { readFileSync, existsSync, statSync } from 'fs'
import { join } from 'path'

console.log('🧪 Vercel Deployment Test')
console.log('=========================')

// Check file structure
console.log('📁 Checking File Structure:')

const requiredFiles = [
  'vercel.json',
  'package.json',
  'api/index.js',
  'backend/src/server.js',
  'backend/package.json'
]

let allFilesExist = true
requiredFiles.forEach(file => {
  if (existsSync(file)) {
    console.log(`   ✅ ${file}`)
  } else {
    console.log(`   ❌ ${file} - MISSING`)
    allFilesExist = false
  }
})

// Check API directory structure
console.log('\n📂 Checking API Directory:')
const apiFiles = [
  'api/index.js',
  'api/health.js',
  'api/auth/[...slug].js',
  'api/documents/[...slug].js',
  'api/users/[...slug].js',
  'api/lawyers/[...slug].js',
  'api/qa/[...slug].js'
]

apiFiles.forEach(file => {
  if (existsSync(file)) {
    console.log(`   ✅ ${file}`)
  } else {
    console.log(`   ❌ ${file} - MISSING`)
    allFilesExist = false
  }
})

// Check vercel.json configuration
console.log('\n🔧 Checking Vercel Configuration:')
try {
  const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'))
  
  console.log(`   Version: ${vercelConfig.version}`)
  console.log(`   Builds: ${vercelConfig.builds?.length || 0}`)
  
  if (vercelConfig.builds) {
    vercelConfig.builds.forEach((build, index) => {
      console.log(`     Build ${index + 1}: ${build.src} (${build.use})`)
    })
  }
  
  if (vercelConfig.routes) {
    console.log(`   Routes: ${vercelConfig.routes.length}`)
    vercelConfig.routes.forEach((route, index) => {
      console.log(`     Route ${index + 1}: ${route.src} -> ${route.dest}`)
    })
  }
  
  if (vercelConfig.functions) {
    console.log(`   Functions: ${Object.keys(vercelConfig.functions).length}`)
    Object.keys(vercelConfig.functions).forEach(func => {
      console.log(`     Function: ${func}`)
    })
  }
  
} catch (error) {
  console.error('   ❌ Invalid vercel.json:', error.message)
  allFilesExist = false
}

// Check package.json
console.log('\n📦 Checking Package Configuration:')
try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
  
  console.log(`   Name: ${packageJson.name}`)
  console.log(`   Version: ${packageJson.version}`)
  console.log(`   Dependencies: ${Object.keys(packageJson.dependencies || {}).length}`)
  console.log(`   Scripts: ${Object.keys(packageJson.scripts || {}).length}`)
  
  // Check if it's a Next.js project
  if (packageJson.dependencies?.next) {
    console.log('   ✅ Next.js project detected')
  } else {
    console.log('   ⚠️ Next.js not found in dependencies')
  }
  
} catch (error) {
  console.error('   ❌ Invalid package.json:', error.message)
  allFilesExist = false
}

// Check backend package.json
console.log('\n🔧 Checking Backend Package:')
try {
  const backendPackage = JSON.parse(readFileSync('backend/package.json', 'utf8'))
  
  console.log(`   Name: ${backendPackage.name}`)
  console.log(`   Main: ${backendPackage.main}`)
  console.log(`   Type: ${backendPackage.type}`)
  console.log(`   Dependencies: ${Object.keys(backendPackage.dependencies || {}).length}`)
  
  // Check if it's an ES module
  if (backendPackage.type === 'module') {
    console.log('   ✅ ES Module configuration correct')
  } else {
    console.log('   ⚠️ Not configured as ES Module')
  }
  
} catch (error) {
  console.error('   ❌ Invalid backend/package.json:', error.message)
  allFilesExist = false
}

// Check API entry points
console.log('\n🚀 Checking API Entry Points:')
const apiEntryPoints = [
  'api/index.js',
  'api/health.js'
]

apiEntryPoints.forEach(file => {
  try {
    const content = readFileSync(file, 'utf8')
    
    if (content.includes('import serverApp from')) {
      console.log(`   ✅ ${file} imports serverApp correctly`)
    } else {
      console.log(`   ❌ ${file} does not import serverApp`)
      allFilesExist = false
    }
    
    if (content.includes('export default')) {
      console.log(`   ✅ ${file} exports handler correctly`)
    } else {
      console.log(`   ❌ ${file} does not export handler`)
      allFilesExist = false
    }
    
  } catch (error) {
    console.error(`   ❌ Error reading ${file}:`, error.message)
    allFilesExist = false
  }
})

// Final assessment
console.log('\n🎯 Deployment Assessment:')
if (allFilesExist) {
  console.log('   ✅ All required files exist')
  console.log('   ✅ Configuration looks correct')
  console.log('   ✅ API entry points are properly configured')
  console.log('   🚀 Ready for deployment!')
} else {
  console.log('   ❌ Some issues found')
  console.log('   🔧 Please fix the issues above before deploying')
}

console.log('\n📋 Next Steps:')
console.log('   1. Commit and push changes to GitHub')
console.log('   2. Deploy to Vercel')
console.log('   3. Set environment variables in Vercel dashboard')
console.log('   4. Test API endpoints')

if (allFilesExist) {
  console.log('\n🎉 All tests passed! Your deployment should work.')
  process.exit(0)
} else {
  console.log('\n💥 Some tests failed. Please fix the issues above.')
  process.exit(1)
}

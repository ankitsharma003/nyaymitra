#!/usr/bin/env node

// Test API endpoints to verify they're working
const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

console.log('🧪 Testing API Endpoints')
console.log('========================')
console.log(`Base URL: ${baseUrl}`)

const endpoints = [
  { method: 'GET', path: '/api', description: 'Main API endpoint' },
  { method: 'GET', path: '/api/health', description: 'Health check' },
  { method: 'POST', path: '/api/auth/login', description: 'Login endpoint' },
  { method: 'POST', path: '/api/auth/register', description: 'Register endpoint' },
  { method: 'GET', path: '/api/auth/me', description: 'User info endpoint' },
  { method: 'GET', path: '/api/documents', description: 'Get documents' },
  { method: 'POST', path: '/api/documents/upload', description: 'Upload document' },
  { method: 'GET', path: '/api/users/profile', description: 'User profile' },
  { method: 'GET', path: '/api/lawyers', description: 'Get lawyers' },
  { method: 'GET', path: '/api/lawyers/search', description: 'Search lawyers' },
  { method: 'GET', path: '/api/qa/faqs', description: 'Get FAQs' },
  { method: 'GET', path: '/api/qa/search', description: 'Search FAQs' },
  { method: 'GET', path: '/api/qa/categories', description: 'Get FAQ categories' },
  { method: 'POST', path: '/api/qa/submit-question', description: 'Submit question' }
]

async function testEndpoint(method, path, description) {
  try {
    const url = `${baseUrl}${path}`
    console.log(`\n🔍 Testing ${method} ${path}`)
    console.log(`   Description: ${description}`)
    console.log(`   URL: ${url}`)

    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }

    // Add body for POST requests
    if (method === 'POST') {
      options.body = JSON.stringify({ test: true })
    }

    const response = await fetch(url, options)
    const data = await response.json()

    if (response.ok) {
      console.log(`   ✅ Status: ${response.status}`)
      console.log(`   📝 Response: ${JSON.stringify(data, null, 2)}`)
    } else {
      console.log(`   ❌ Status: ${response.status}`)
      console.log(`   📝 Error: ${JSON.stringify(data, null, 2)}`)
    }

    return { success: response.ok, status: response.status, data }

  } catch (error) {
    console.log(`   💥 Error: ${error.message}`)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('Starting API endpoint tests...\n')

  const results = []
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.method, endpoint.path, endpoint.description)
    results.push({
      ...endpoint,
      ...result
    })
  }

  // Summary
  console.log('\n📊 Test Summary')
  console.log('================')
  
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  console.log(`✅ Successful: ${successful}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((successful / results.length) * 100)}%`)

  if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    results.filter(r => !r.success).forEach(result => {
      console.log(`   ${result.method} ${result.path} - ${result.error || result.data?.error || 'Unknown error'}`)
    })
  }

  console.log('\n🎯 Next Steps:')
  if (successful === results.length) {
    console.log('   🎉 All API endpoints are working correctly!')
    console.log('   🚀 Your Vercel deployment is fully functional.')
  } else {
    console.log('   🔧 Some endpoints are not working. Check the errors above.')
    console.log('   📝 Make sure your Vercel deployment is up to date.')
  }

  console.log('\n📋 Available Endpoints:')
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    console.log(`   ${status} ${result.method} ${result.path}`)
  })
}

// Run the tests
runTests().catch(console.error)

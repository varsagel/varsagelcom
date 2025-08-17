// Using built-in fetch (Node.js 18+)

async function testLogin() {
  try {
    console.log('Testing tRPC auth login...');
    
    const response = await fetch('http://localhost:3000/api/trpc/auth.login?batch=1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "0": {
          "json": {
            "email": "admin@varsagel.com",
            "password": "admin123"
          }
        }
      })
    });

    console.log('Response status:', response.status);
    const data = await response.text();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.error('Error testing login:', error);
  }
}

testLogin();
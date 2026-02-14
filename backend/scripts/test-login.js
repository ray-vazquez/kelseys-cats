#!/usr/bin/env node
import fetch from 'node-fetch';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function testLogin() {
  console.log('\n🔐 Login Test\n');
  
  const username = await question('Username: ');
  const password = await question('Password: ');
  
  console.log('\n⏳ Testing login...');
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('\n✅ Login successful!');
      console.log('\nToken:', data.token.substring(0, 50) + '...');
      console.log('User:', data.user);
    } else {
      console.log('\n❌ Login failed:', data);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nMake sure backend is running: npm run start');
  }
  
  rl.close();
}

testLogin();

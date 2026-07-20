import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  withCredentials: true,
  validateStatus: () => true, // Don't throw on error status
});

async function run() {
  console.log('--- E2E TEST START ---');
  
  // 1. Register
  const testEmail = `test_${Date.now()}@example.com`;
  const testUser = `testuser_${Date.now()}`;
  const password = 'Password@123';
  
  console.log(`\nRegistering user ${testEmail}...`);
  const regRes = await api.post('/users/register', {
    fullName: 'Test User',
    username: testUser,
    email: testEmail,
    password,
  });
  console.log(`Register Status: ${regRes.status}`, regRes.data);

  if (regRes.status !== 201) return;

  // 2. Fetch OTP from DB
  console.log('\nFetching OTP from DB...');
  const otpRecord = await prisma.oTP.findFirst({
    where: { email: testEmail, purpose: 'REGISTER' },
    orderBy: { createdAt: 'desc' },
  });
  
  if (!otpRecord) {
    console.log('OTP not found in DB!');
    return;
  }
  console.log(`Found OTP: ${otpRecord.otpCode}`);

  // 3. Verify OTP
  console.log('\nVerifying OTP...');
  const verifyRes = await api.post('/users/verify-otp', {
    email: testEmail,
    otp: otpRecord.otpCode,
  });
  console.log(`Verify Status: ${verifyRes.status}`, verifyRes.data);

  // 4. Login
  console.log('\nLogging in...');
  const loginRes = await api.post('/users/login', {
    email: testEmail,
    password,
  });
  console.log(`Login Status: ${loginRes.status}`, loginRes.data);
  
  // Extract cookies
  const cookies = loginRes.headers['set-cookie'];
  if (cookies) {
    console.log('Cookies received:');
    cookies.forEach(c => console.log(' - ' + c.split(';')[0]));
    api.defaults.headers.Cookie = cookies.map(c => c.split(';')[0]).join('; ');
  } else {
    console.log('NO COOKIES RECEIVED!');
  }

  // 5. Get Current User (Protected Route)
  console.log('\nFetching current user (/users/me)...');
  const meRes = await api.get('/users/me');
  console.log(`Me Status: ${meRes.status}`, meRes.data);

  console.log('\n--- E2E TEST END ---');
}

run().catch(console.error).finally(() => prisma.$disconnect());

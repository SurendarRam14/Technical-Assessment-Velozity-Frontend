import { io } from 'socket.io-client';
import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';
const WS_URL = 'http://localhost:4000';

async function login(email, password) {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
  return res.data.accessToken;
}

function connectUser(token, name) {
  return new Promise((resolve, reject) => {
    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log(`[${name}] Connected to socket server: ${socket.id}`);
      resolve(socket);
    });

    socket.on('connect_error', (err) => {
      console.error(`[${name}] Connection error:`, err.message);
      reject(err);
    });
  });
}

async function run() {
  console.log('=== Starting Phase 6 Client Presence Real-Time Test ===\n');

  // 1. Log in Admin
  console.log('1. Logging in Admin...');
  const adminToken = await login('admin@velozity.com', 'Password123!');
  const adminSocket = await connectUser(adminToken, 'Admin');

  let adminPresenceCounts = [];
  adminSocket.on('presence:count', ({ count }) => {
    console.log(`[Admin] Received presence:count -> ${count}`);
    adminPresenceCounts.push(count);
  });

  // Test explicit presence:join
  console.log('\n2. Emitting presence:join from Admin...');
  adminSocket.emit('presence:join');
  await new Promise((r) => setTimeout(r, 400));

  // 3. Connect Dev1
  console.log('\n3. Logging in and connecting Dev1...');
  const dev1Token = await login('dev1@velozity.com', 'Password123!');
  const dev1Socket = await connectUser(dev1Token, 'Dev1');
  await new Promise((r) => setTimeout(r, 600));

  // 4. Connect PM1
  console.log('\n4. Logging in and connecting PM1...');
  const pm1Token = await login('pm1@velozity.com', 'Password123!');
  const pm1Socket = await connectUser(pm1Token, 'PM1');
  await new Promise((r) => setTimeout(r, 600));

  // 5. Disconnect Dev1
  console.log('\n5. Disconnecting Dev1...');
  dev1Socket.disconnect();
  await new Promise((r) => setTimeout(r, 600));

  // 6. Disconnect PM1
  console.log('\n6. Disconnecting PM1...');
  pm1Socket.disconnect();
  await new Promise((r) => setTimeout(r, 600));

  // 7. Cleanup Admin
  adminSocket.disconnect();

  console.log('\nRecorded Admin presence counts:', adminPresenceCounts);
  if (adminPresenceCounts.length < 3) {
    throw new Error('Admin did not receive enough presence updates!');
  }

  console.log('\n=== SUCCESS: Phase 6 Presence tracking verified end-to-end! ===');
  process.exit(0);
}

run().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});

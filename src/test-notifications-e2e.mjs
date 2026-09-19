import { io } from 'socket.io-client';
import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';
const WS_URL = 'http://localhost:4000';

async function login(email, password) {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
  return { token: res.data.accessToken, user: res.data.user };
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
      console.error(`[${name}] Socket connection error:`, err.message);
      reject(err);
    });
  });
}

async function run() {
  console.log('=== Starting Phase 7 Notifications Real-Time & REST Verification ===\n');

  // 1. Log in PM1
  console.log('1. Logging in PM1...');
  const { token: pm1Token, user: pm1User } = await login('pm1@velozity.com', 'Password123!');
  console.log(`   PM1 ID: ${pm1User.id}`);

  // 2. Fetch initial notifications
  console.log('\n2. Fetching PM1 notifications via GET /api/notifications...');
  const initialRes = await axios.get(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${pm1Token}` },
  });
  console.log(`   PM1 initial unread count: ${initialRes.data.unreadCount}`);
  console.log(`   PM1 total notifications: ${initialRes.data.notifications.length}`);

  // 3. Connect PM1 to WebSocket
  console.log('\n3. Connecting PM1 WebSocket...');
  const pm1Socket = await connectUser(pm1Token, 'PM1');

  let receivedNotification = null;
  pm1Socket.on('notification:new', (notif) => {
    console.log('\n>>> [PM1 Socket] Received notification:new:', notif);
    receivedNotification = notif;
  });

  // 4. Log in Dev1
  console.log('\n4. Logging in Dev1...');
  const { token: dev1Token, user: dev1User } = await login('dev1@velozity.com', 'Password123!');

  // 5. Find a task in PM1 project to move to IN_REVIEW
  console.log('\n5. Finding a task in PM1 project...');
  const tasksRes = await axios.get(`${API_BASE}/tasks?projectId=5297281c-57f8-45e4-aac7-6a444c482892`, {
    headers: { Authorization: `Bearer ${dev1Token}` },
  });
  const tasks = tasksRes.data.tasks || tasksRes.data;
  const targetTask = tasks.find((t) => t.status !== 'IN_REVIEW') || tasks[0];
  console.log(`   Target Task: "${targetTask.title}" (ID: ${targetTask.id}, Current Status: ${targetTask.status})`);

  // Reset status to TODO first if it was already IN_REVIEW
  if (targetTask.status === 'IN_REVIEW') {
    await axios.patch(
      `${API_BASE}/tasks/${targetTask.id}/status`,
      { status: 'TODO' },
      { headers: { Authorization: `Bearer ${dev1Token}` } }
    );
  }

  // 6. Dev1 moves task to IN_REVIEW -> triggers notification to PM1
  console.log('\n6. Dev1 transitions task to IN_REVIEW via PATCH /api/tasks/:id/status...');
  const updateRes = await axios.patch(
    `${API_BASE}/tasks/${targetTask.id}/status`,
    { status: 'IN_REVIEW' },
    { headers: { Authorization: `Bearer ${dev1Token}` } }
  );
  console.log(`   Task updated status: ${updateRes.data.task.status}`);

  // 7. Wait for notification:new on PM1 socket
  console.log('\n7. Awaiting real-time notification:new on PM1 socket...');
  for (let i = 0; i < 20; i++) {
    if (receivedNotification) break;
    await new Promise((r) => setTimeout(r, 200));
  }

  if (!receivedNotification) {
    throw new Error('PM1 did not receive notification:new event within 4 seconds!');
  }
  console.log('   ✓ Real-time notification:new successfully received on PM1 socket!');

  // 8. Test mark-as-read
  console.log('\n8. Testing mark-as-read on received notification...');
  const markReadRes = await axios.patch(
    `${API_BASE}/notifications/${receivedNotification.id}/read`,
    {},
    { headers: { Authorization: `Bearer ${pm1Token}` } }
  );
  console.log(`   Notification read status: ${markReadRes.data.notification.read}`);
  if (!markReadRes.data.notification.read) {
    throw new Error('markAsRead did not set read: true');
  }

  // 9. Test mark-all-as-read
  console.log('\n9. Testing mark-all-as-read...');
  const markAllRes = await axios.patch(
    `${API_BASE}/notifications/read-all`,
    {},
    { headers: { Authorization: `Bearer ${pm1Token}` } }
  );
  console.log(`   markAllAsRead response:`, markAllRes.data);

  // 10. Confirm unreadCount is 0
  const finalRes = await axios.get(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${pm1Token}` },
  });
  console.log(`   Final PM1 unread count: ${finalRes.data.unreadCount}`);
  if (finalRes.data.unreadCount !== 0) {
    throw new Error(`Expected unreadCount to be 0, got ${finalRes.data.unreadCount}`);
  }

  // Cleanup
  pm1Socket.disconnect();

  console.log('\n=== ALL PHASE 7 NOTIFICATION TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

run().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});

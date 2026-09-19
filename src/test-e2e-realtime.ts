import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:4000';

async function runRealtimeE2ETest() {
  console.log('=== STARTING REAL-TIME MULTI-USER SOCKET VERIFICATION ===\n');

  // 1. Log in PM1
  console.log('1. Logging in PM1 (pm1@velozity.com)...');
  const pmLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'pm1@velozity.com', password: 'Password123!' }),
  });
  const pmData = (await pmLoginRes.json()) as any;
  const pmToken = pmData.accessToken;
  console.log('   PM1 logged in successfully.');

  // 2. Log in Dev1
  console.log('2. Logging in Dev1 (dev1@velozity.com)...');
  const devLoginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dev1@velozity.com', password: 'Password123!' }),
  });
  const devData = (await devLoginRes.json()) as any;
  const devToken = devData.accessToken;
  console.log('   Dev1 logged in successfully.\n');

  // 3. Connect Sockets for both users simultaneously
  console.log('3. Connecting WebSockets for both sessions...');
  const pmSocket = io(BACKEND_URL, {
    auth: { token: pmToken },
    transports: ['websocket'],
  });

  const devSocket = io(BACKEND_URL, {
    auth: { token: devToken },
    transports: ['websocket'],
  });

  await Promise.all([
    new Promise<void>((resolve) => pmSocket.on('connect', resolve)),
    new Promise<void>((resolve) => devSocket.on('connect', resolve)),
  ]);

  console.log('   Both PM1 and Dev1 sockets connected successfully to backend.');

  // 4. Find a task in Project 1 to update
  console.log('4. Finding an active task in Enterprise Cloud Portal...');
  const tasksRes = await fetch(`${BACKEND_URL}/api/tasks?projectId=5297281c-57f8-45e4-aac7-6a444c482892`, {
    headers: { Authorization: `Bearer ${pmToken}` },
  });
  const tasks = (await tasksRes.json()) as any[];
  const targetTask = tasks.find((t) => t.status === 'TODO') || tasks[0];

  console.log(`   Selected task: "${targetTask.title}" (ID: ${targetTask.id}, Current Status: ${targetTask.status})`);

  const nextStatus = targetTask.status === 'TODO' ? 'IN_PROGRESS' : 'TODO';

  // 5. Set up event listener on Dev1's socket to catch live activity:new
  console.log(`5. Setting up live listener on Dev1's socket for activity:new...`);
  const receivedOnDevPromise = new Promise<any>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout: Dev1 did not receive activity:new within 5s')), 5000);
    devSocket.on('activity:new', (event) => {
      if (event.taskId === targetTask.id) {
        clearTimeout(timeout);
        resolve(event);
      }
    });
  });

  // 6. PM1 mutates task status via REST endpoint
  console.log(`6. PM1 changing status to "${nextStatus}" via PATCH /api/tasks/:id/status...`);
  const patchRes = await fetch(`${BACKEND_URL}/api/tasks/${targetTask.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${pmToken}`,
    },
    body: JSON.stringify({ status: nextStatus }),
  });

  if (!patchRes.ok) {
    throw new Error(`PATCH failed: ${await patchRes.text()}`);
  }
  console.log('   Status update HTTP response received: 200 OK');

  // 7. Verify Dev1 received the live event in real time without refreshing
  console.log('7. Awaiting live event on Dev1 socket...');
  const devReceivedEvent = await receivedOnDevPromise;
  console.log('   Dev1 received live activity:new event without refresh!');
  console.log('   Event payload:', devReceivedEvent);

  pmSocket.disconnect();
  devSocket.disconnect();

  console.log('\n=== REAL-TIME MULTI-USER SOCKET VERIFICATION PASSED! ===');
}

runRealtimeE2ETest().catch((err) => {
  console.error('Real-time test failed:', err);
  process.exit(1);
});

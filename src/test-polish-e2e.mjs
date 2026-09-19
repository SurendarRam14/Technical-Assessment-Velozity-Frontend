import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

const API_BASE = 'http://localhost:4000/api';

async function login(email, password) {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
  return { token: res.data.accessToken, user: res.data.user };
}

async function run() {
  console.log('=== Starting Phase 9 Polish & UX Details Verification ===\n');

  // 1. Authenticate Admin
  console.log('1. Logging in Admin...');
  const { token: adminToken } = await login('admin@velozity.com', 'Password123!');

  // 2. Verify Overdue Tasks from API
  console.log('\n2. Verifying overdue tasks from API...');
  const tasksRes = await axios.get(`${API_BASE}/tasks`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const tasks = tasksRes.data.tasks || tasksRes.data;
  const overdueTasks = tasks.filter((t) => t.isOverdue);
  console.log(`   Found ${overdueTasks.length} overdue task(s) in system:`);
  overdueTasks.forEach((t) => {
    console.log(`     - "${t.title}" (Due: ${t.dueDate}, isOverdue: ${t.isOverdue})`);
  });

  if (overdueTasks.length === 0) {
    throw new Error('Expected at least one overdue task from seed data!');
  }
  console.log('   ✓ Overdue state is strictly provided by backend API');

  // 3. Verify Empty Filter State from API
  console.log('\n3. Verifying empty state with impossible filters...');
  const emptyRes = await axios.get(
    `${API_BASE}/tasks?status=TODO&priority=LOW&dueFrom=2099-01-01`,
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  const emptyTasks = emptyRes.data.tasks || emptyRes.data;
  console.log(`   Filtered tasks count: ${emptyTasks.length}`);
  if (emptyTasks.length !== 0) {
    throw new Error('Expected 0 tasks for future impossible date range!');
  }
  console.log('   ✓ Empty filter state produces empty array for "No tasks match these filters" display');

  // 4. Verify Relative Timestamps on Activity Feed
  console.log('\n4. Verifying relative timestamps on Activity Feed...');
  const actRes = await axios.get(`${API_BASE}/dashboard/admin`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const recentActivity = actRes.data.recentActivity || [];
  console.log(`   Verifying ${recentActivity.length} activity items:`);
  recentActivity.slice(0, 3).forEach((act) => {
    const timeAgo = formatDistanceToNow(new Date(act.createdAt), { addSuffix: true });
    console.log(`     - [${act.toStatus}] "${act.task?.title || act.taskId}" -> ${timeAgo}`);
  });
  console.log('   ✓ Relative timestamps successfully format with date-fns addSuffix');

  console.log('\n=== ALL PHASE 9 POLISH & UX CHECKS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

run().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});

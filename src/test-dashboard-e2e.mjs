import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

async function login(email, password) {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
  return { token: res.data.accessToken, user: res.data.user };
}

async function run() {
  console.log('=== Starting Phase 8 Dashboard Aggregates Verification ===\n');

  // 1. Test Admin Dashboard
  console.log('1. Testing Admin Dashboard (admin@velozity.com)...');
  const { token: adminToken } = await login('admin@velozity.com', 'Password123!');
  const adminRes = await axios.get(`${API_BASE}/dashboard/admin`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('   Admin Totals:', adminRes.data.totals);
  console.log('   Admin TasksByStatus:', adminRes.data.tasksByStatus);
  console.log(`   Admin Recent Activity Count: ${adminRes.data.recentActivity.length}`);

  if (
    typeof adminRes.data.totals.totalProjects !== 'number' ||
    typeof adminRes.data.totals.totalTasks !== 'number' ||
    typeof adminRes.data.totals.totalUsers !== 'number'
  ) {
    throw new Error('Admin dashboard missing required totals!');
  }

  // 2. Test PM Dashboard
  console.log('\n2. Testing PM Dashboard (pm1@velozity.com)...');
  const { token: pmToken } = await login('pm1@velozity.com', 'Password123!');
  const pmRes = await axios.get(`${API_BASE}/dashboard/pm`, {
    headers: { Authorization: `Bearer ${pmToken}` },
  });
  console.log('   PM Totals:', pmRes.data.totals);
  console.log(`   PM Owned Projects Count: ${pmRes.data.projects.length}`);
  if (pmRes.data.projects.length > 0) {
    const firstProj = pmRes.data.projects[0];
    console.log(`   Sample Project: "${firstProj.name}" (${firstProj.progressPercentage}% complete)`);
  }
  console.log('   PM TasksByPriority:', pmRes.data.tasksByPriority);

  if (
    typeof pmRes.data.totals.totalProjects !== 'number' ||
    !Array.isArray(pmRes.data.projects)
  ) {
    throw new Error('PM dashboard missing required projects summary!');
  }

  // 3. Test Developer Dashboard
  console.log('\n3. Testing Developer Dashboard (dev1@velozity.com)...');
  const { token: devToken } = await login('dev1@velozity.com', 'Password123!');
  const devRes = await axios.get(`${API_BASE}/dashboard/developer`, {
    headers: { Authorization: `Bearer ${devToken}` },
  });
  console.log('   Developer Totals:', devRes.data.totals);
  console.log(`   Developer Assigned Tasks Count: ${devRes.data.assignedTasks.length}`);
  if (devRes.data.assignedTasks.length > 0) {
    console.log('   First 3 Assigned Tasks:');
    devRes.data.assignedTasks.slice(0, 3).forEach((t) => {
      console.log(`     - [${t.priority}] "${t.title}" (Status: ${t.status}, Due: ${t.dueDate || 'none'})`);
    });
  }

  if (
    typeof devRes.data.totals.totalAssignedTasks !== 'number' ||
    !Array.isArray(devRes.data.assignedTasks)
  ) {
    throw new Error('Developer dashboard missing required assignedTasks!');
  }

  // 4. Test Role Restrictions (403 Forbidden)
  console.log('\n4. Testing Role Scoping & 403 Forbidden enforcement...');

  // PM trying to access Admin dashboard
  try {
    await axios.get(`${API_BASE}/dashboard/admin`, {
      headers: { Authorization: `Bearer ${pmToken}` },
    });
    throw new Error('PM should NOT be able to access Admin dashboard!');
  } catch (err) {
    if (err.response?.status === 403) {
      console.log('   ✓ PM access to /api/dashboard/admin correctly rejected with 403 Forbidden');
    } else {
      throw err;
    }
  }

  // Developer trying to access PM dashboard
  try {
    await axios.get(`${API_BASE}/dashboard/pm`, {
      headers: { Authorization: `Bearer ${devToken}` },
    });
    throw new Error('Developer should NOT be able to access PM dashboard!');
  } catch (err) {
    if (err.response?.status === 403) {
      console.log('   ✓ Developer access to /api/dashboard/pm correctly rejected with 403 Forbidden');
    } else {
      throw err;
    }
  }

  console.log('\n=== ALL PHASE 8 DASHBOARD TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

run().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});

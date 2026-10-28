import fetch from 'node-fetch';

async function test() {
  try {
    // 1. Deactivate
    console.log("Deactivating user 448...");
    let res = await fetch('http://localhost:3009/api/auth/update-status/448', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'deactivated' })
    });
    let data = await res.json();
    console.log("Response:", data);

    // 2. Fetch to verify deactivated status
    res = await fetch('http://localhost:3009/api/auth/users-status');
    data = await res.json();
    const user = data.find(u => u.id === 448);
    console.log("User status now:", user ? user.status : 'not found');

    // 3. Reactivate
    console.log("Reactivating user 448...");
    res = await fetch('http://localhost:3009/api/auth/update-status/448', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' })
    });
    data = await res.json();
    console.log("Response:", data);

    // 4. Verify reactivated status
    res = await fetch('http://localhost:3009/api/auth/users-status');
    data = await res.json();
    const user2 = data.find(u => u.id === 448);
    console.log("User status now:", user2 ? user2.status : 'not found');

  } catch (err) {
    console.error("Error making request:", err.message);
  }
}
test();

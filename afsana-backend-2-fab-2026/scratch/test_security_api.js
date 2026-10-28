import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:3009/api/auth/users-status');
    if (res.ok) {
      const data = await res.json();
      console.log("✅ GET /users-status Success. Total users fetched:", data.length);
      if (data.length > 0) {
        console.log("First user info:", { id: data[0].id, email: data[0].email, status: data[0].status });
      }
    } else {
      console.error("❌ GET /users-status Failed. Status:", res.status);
    }
  } catch (err) {
    console.error("Error making request:", err.message);
  }
}
test();

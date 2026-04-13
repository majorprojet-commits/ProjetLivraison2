async function checkHealth() {
  try {
    const res = await fetch('http://localhost:3000/api/health');
    console.log('Status:', res.status);
    console.log('Body:', await res.json());
  } catch (e) {
    console.error('Health check failed:', e);
  }
}
checkHealth();

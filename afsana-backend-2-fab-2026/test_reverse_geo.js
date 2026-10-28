import axios from 'axios';

async function testReverseGeocode() {
  try {
    // Example lat/lon for Indore
    const lat = 22.71955;
    const lon = 75.85772;
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { headers: { 'User-Agent': 'AfsanaPlatform/1.0' } }
    );
    console.log('REVERSE GEOCODED ADDRESS:', res.data.display_name);
    console.log('ADDRESS BREAKDOWN:', res.data.address);
  } catch (err) {
    console.error(err.message);
  }
}

testReverseGeocode();

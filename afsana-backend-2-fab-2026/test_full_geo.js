import axios from 'axios';

async function testFullGeo() {
  try {
    const res = await axios.get('http://ip-api.com/json/?fields=66846719');
    console.log('FULL GEO OBJECT:', res.data);
  } catch (err) {
    console.error(err);
  }
}

testFullGeo();

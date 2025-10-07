const axios = require('axios');
const fs = require('fs');

const url = 'https://www.instagram.com/setupspawn/';

async function scrapeInstagram() {
    try {
        const res = await axios.get(url);
        const html = res.data;

        // Example: just save the HTML for now
        fs.writeFileSync('profile.html', html);
        console.log('Profile saved!');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

scrapeInstagram();

const axios = require('axios');

const url = 'https://fortalabs.uazapi.com/message/find';
const token = 'a235279d-5a23-433b-a8c0-ca9b6da76e4a';
const chatId = '558588127637@s.whatsapp.net';

async function run() {
    try {
        console.log(`Searching messages for ${chatId}...`);
        const payload = {
            chatid: chatId,
            limit: 5,
            offset: 0
        };
        
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'token': token
            }
        });

        console.log('Status:', response.status);
        if (Array.isArray(response.data)) {
            console.log(`Found ${response.data.length} messages.`);
            response.data.forEach((msg, index) => {
                console.log(`\n--- Message ${index + 1} ---`);
                console.log(JSON.stringify(msg, null, 2));
            });
        } else if (response.data && response.data.data) {
             console.log(`Found ${response.data.data.length} messages (nested).`);
             response.data.data.forEach((msg, index) => {
                console.log(`\n--- Message ${index + 1} ---`);
                console.log(JSON.stringify(msg, null, 2));
            });
        } else {
            console.log('Response data:', JSON.stringify(response.data, null, 2));
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

run();

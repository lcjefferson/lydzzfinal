const axios = require('axios');
const fs = require('fs');
const path = require('path');

const url = 'https://fortalabs.uazapi.com/message/download';
const token = 'a235279d-5a23-433b-a8c0-ca9b6da76e4a';
const messageId = '3EB054BDC7599FDEE5CD6A'; // The image message ID from previous step

async function run() {
    try {
        console.log(`Downloading media for message ${messageId}...`);
        const payload = {
            id: messageId,
            return_base64: true,
            generate_mp3: false,
            return_link: false,
            transcribe: false,
            download_quoted: false
        };
        
        const response = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'token': token
            }
        });

        console.log('Status:', response.status);
        if (response.data) {
            console.log('Keys:', Object.keys(response.data));
            if (response.data.base64) {
                console.log('Base64 length:', response.data.base64.length);
                const mimetype = response.data.mimetype || 'application/octet-stream';
                console.log('Mimetype:', mimetype);
                
                // Decode and save to verify
                const matches = response.data.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                let buffer;
                if (matches && matches.length === 3) {
                    console.log('Base64 has data URI prefix');
                    buffer = Buffer.from(matches[2], 'base64');
                } else {
                    console.log('Base64 is raw');
                    buffer = Buffer.from(response.data.base64, 'base64');
                }
                
                const ext = mimetype.split('/')[1] || 'bin';
                const filename = `test_download.${ext}`;
                fs.writeFileSync(filename, buffer);
                console.log(`Saved to ${filename}`);
            } else {
                console.log('No base64 field found.');
                console.log(JSON.stringify(response.data, null, 2));
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

run();

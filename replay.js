require('dotenv').config();
const mqtt = require('mqtt');
const csv = require('csv-parser');
const fs = require('fs');
const crypto = require('crypto');

const defaultCsvFilePath = 'mqtt_messages.csv';

const client = mqtt.connect(
    `mqtts://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`,
    {
        clientId: crypto.randomUUID(),
        clean: true,
        username: process.env.MQTT_USERNAME || "",
        password: process.env.MQTT_PASSWORD || "",
        rejectUnauthorized: false,
    }
);

// Function to replay messages with correct delays
function replayMessages(messages) {
    messages.forEach((msg, index) => {
        console.log(msg)

        const prevTimestamp = index > 0 ? new Date(messages[0].Timestamp) : new Date();
        const currentTimestamp = new Date(msg.Timestamp);
        const delay = (currentTimestamp - prevTimestamp);


        setTimeout(() => {
            console.log(`Replaying message ${index + 1}: ${msg.Message}`);
            client.publish(msg.Topic, msg.Message);
        }, delay);
    });
}

// Read messages from CSV file
const messages = [];
fs.createReadStream(process.env.FILE_PATH || defaultCsvFilePath)
    .pipe(csv())
    .on('data', (row) => {
        messages.push(row);
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
        // Replay messages after reading CSV file
        replayMessages(messages);
    });

// Handle errors
client.on('error', (err) => {
    console.error('MQTT error:', err);
});

// Handle closing of the client
process.on('SIGINT', () => {
    console.log('Closing MQTT client');
    client.end();
});

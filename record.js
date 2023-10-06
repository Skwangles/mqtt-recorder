require('dotenv').config();
const mqtt = require('mqtt');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
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


const csvWriter = createCsvWriter({
    path: process.env.FILE_PATH || defaultCsvFilePath,
    header: [
        { id: 'topic', title: 'Topic' },
        { id: 'message', title: 'Message' },
        { id: 'timestamp', title: 'Timestamp' },
    ],
});

let messages = [];

// Record messages to CSV with timestamps
client.on('message', (topic, message) => {
    const timestamp = new Date().toISOString();
    const msg = { topic, message: message.toString(), timestamp };
    messages.push(msg);
    csvWriter.writeRecords([msg]).then(() => {
        console.log(`Recorded message from topic '${topic}' to CSV`);
    });
});

// Subscribe to all topics
client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe('#', (err) => {
        if (err) {
            console.error('Error subscribing to topics:', err);
        } else {
            console.log('Subscribed to all topics');
        }
    });
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

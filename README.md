# mqtt-recorder
Record MQTT publishes to be played back at a later time

# Use
Replace the values in the .env with your specifics
I have assumed that a username/password is needed, so have provided this as ENV arguments

## Username/Password
If you don't need username/password - I don't know if it will cause an issue being an empty string - otherwise remove the 'username/password' fields from the mqtt.connect function call.

# start
Setup:
`npm install`

Record:
`npm run record`

Replay:
`npm run replay`

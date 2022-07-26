import Keyv from "keyv";

export const db_gate = new Keyv('sqlite://db.sqlite3', {table: 'gate'});

db_gate.on('error', (err) => console.log('Connection Error', err));

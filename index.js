import dotenv from 'dotenv';
const cors = require('cors');
const express = require('express');
const app = express();
const mysql2 = require('mysql2');
dotenv.config();
app.use(express.json());
const db = mysql2.createConnection({
    host: '127.0.0.1',
    user: process.env.SQL_USERNAME,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATA_NAME,
});
app.use(cors())
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});




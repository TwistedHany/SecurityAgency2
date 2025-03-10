console.log('Starting server...');

const express = require('express');
const bodyParser = require('body-parser'); 
const cors = require('cors'); 
const pool = require('./db'); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(bodyParser.json()); 

app.get('/', (req, res) => {
    res.send('Server is running');
});

// Route to handle personnel form submission
app.post('/submitPersonnel', (req, res) => {
    const { name, age, civilStatus, gender, street, barangay, city, province, zipcode, contactNumber, email } = req.body;

    pool.getConnection()
        .then(conn => {
            // Insert address into address table
            conn.query('INSERT INTO address (Street, Barangay, City, Province, Postal_Code) VALUES (?, ?, ?, ?, ?)', 
            [street, barangay, city, province, zipcode])
                .then(result => {
                    const addressId = result.insertId;

                    // Insert personnel data into personnel table
                    return conn.query('INSERT INTO personnel (Personnel_Name, Personnel_Age, CivilStatus_ID, Gender_ID, Address_ID, ContactNo, Email) VALUES (?, ?, ?, ?, ?, ?, ?)', 
                    [name, age, civilStatus, gender, addressId, contactNumber, email]);
                })
                .then(result => {
                    res.send('Personnel data inserted successfully');
                    conn.release();
                })
                .catch(err => {
                    res.status(500).send('Error inserting personnel data');
                    console.error('Error inserting personnel data:', err);
                    conn.release();
                });
        })
        .catch(err => {
            res.status(500).send('Database connection failed');
            console.error('Database connection failed:', err);
        });
});

// Route to get personnel data
app.get('/getPersonnel', (req, res) => {
    pool.getConnection()
        .then(conn => {
            conn.query('SELECT p.Personnel_ID, p.Personnel_Name, p.Personnel_Age, c.Title AS CivilStatus, g.GenderName AS Gender, a.Street, a.Barangay, a.City, a.Province, a.Postal_Code AS Zipcode, p.ContactNo, p.Email FROM personnel p JOIN address a ON p.Address_ID = a.Address_ID JOIN civilstatus c ON p.CivilStatus_ID = c.CivilStatus_ID JOIN gender g ON p.Gender_ID = g.Gender_ID')
                .then(rows => {
                    res.json(rows);
                    conn.release();
                })
                .catch(err => {
                    res.status(500).send('Error fetching personnel data');
                    console.error('Error fetching personnel data:', err);
                    conn.release();
                });
        })
        .catch(err => {
            res.status(500).send('Database connection failed');
            console.error('Database connection failed:', err);
        });
});

// Start server (only once)
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

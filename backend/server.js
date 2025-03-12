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
    console.log('Received Data:', req.body); // Log received data

    pool.getConnection()
        .then(conn => {
            // Check if the personnel already exists
            conn.query('SELECT * FROM personnel WHERE Personnel_Name = ? AND ContactNo = ? AND Email = ?', [name, contactNumber, email])
                .then(result => {
                    if (result.length > 0) {
                        res.status(400).send('Personnel already exists');
                        conn.release();
                    } else {
                        // Insert address into address table
                        conn.query('INSERT INTO address (Street, Barangay, City, Province, Postal_Code) VALUES (?, ?, ?, ?, ?)', 
                        [street, barangay, city, province, zipcode])
                
                    .then(result => {
                                const addressId = result.insertId;
                                console.log('Inserted Address ID:', addressId); // Log inserted address ID

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
                    }
                })
                .catch(err => {
                    res.status(500).send('Error checking personnel data');
                    console.error('Error checking personnel data:', err);
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

// Route to search personnel data
app.get('/searchPersonnel', (req, res) => {
    const query = req.query.query.toLowerCase();
    pool.getConnection()
        .then(conn => {
            conn.query('SELECT p.Personnel_ID, p.Personnel_Name, p.Personnel_Age, c.Title AS CivilStatus, g.GenderName AS Gender, a.Street, a.Barangay, a.City, a.Province, a.Postal_Code AS Zipcode, p.ContactNo, p.Email FROM personnel p JOIN address a ON p.Address_ID = a.Address_ID JOIN civilstatus c ON p.CivilStatus_ID = c.CivilStatus_ID JOIN gender g ON p.Gender_ID = g.Gender_ID WHERE LOWER(p.Personnel_ID) LIKE ? OR LOWER(p.Personnel_Name) LIKE ?', [`%${query}%`, `%${query}%`])
                .then(rows => {
                    res.json(rows);
                    conn.release();
                })
                .catch(err => {
                    res.status(500).send('Error searching personnel data');
                    console.error('Error searching personnel data:', err);
                    conn.release();
                });
        })
        .catch(err => {
            res.status(500).send('Database connection failed');
            console.error('Database connection failed:', err);
        });
});

// Route to delete personnel data
app.delete('/deletePersonnel', (req, res) => {
    const personnelId = req.query.personnelId;
    pool.getConnection()
        .then(conn => {
            conn.query('DELETE FROM personnel WHERE Personnel_ID = ?', [personnelId])
                .then(result => {
                    if (result.affectedRows > 0) {
                        res.send('Personnel deleted successfully');
                    } else {
                        res.status(404).send('Personnel not found');
                    }
                    conn.release();
                })
                .catch(err => {
                    res.status(500).send('Error deleting personnel data');
                    console.error('Error deleting personnel data:', err);
                    conn.release();
                });
        })
        .catch(err => {
            res.status(500).send('Database connection failed');
            console.error('Database connection failed:', err);
        });
});

// Route to get client data
app.get('/getClients', (req, res) => {
    pool.getConnection()
        .then(conn => {
            conn.query('SELECT c.Client_ID, c.ClientName, c.ContactPerson, c.ContactNumber, c.Email, CONCAT(a.Street, ", ", a.Barangay, ", ", a.City, ", ", a.Province, ", ", a.Postal_Code) AS Address FROM client c JOIN address a ON c.Address_ID = a.Address_ID')
                .then(rows => {
                    res.json(rows);
                    conn.release();
                })
                .catch(err => {
                    res.status(500).send('Error fetching client data');
                    console.error('Error fetching client data:', err);
                    conn.release();
                });
        })
        .catch(err => {
            res.status(500).send('Database connection failed');
            console.error('Database connection failed:', err);
        });
});

// Route to get contract data
app.get('/getContracts', (req, res) => {
    pool.getConnection()
        .then(conn => {
            conn.query('SELECT c.Contract_ID, cl.ClientName AS Client, c.StartDate, c.EndDate, p.Type AS PaymentMode, s.StatusName AS Status, c.ContractValue FROM contract c JOIN client cl ON c.Client_ID = cl.Client_ID JOIN paymenttype p ON c.PaymentType_ID = p.PaymentType_ID JOIN status s ON c.Status_ID = s.Status_ID')
                .then(rows => {
                    res.json(rows);
                    conn.release();
                })
                .catch(err => {
                    res.status(500).send('Error fetching contract data');
                    console.error('Error fetching contract data:', err);
                    conn.release();
                });
        })
        .catch(err => {
            res.status(500).send('Database connection failed');
            console.error('Database connection failed:', err);
        });
});

// Route to get assignment data
app.get('/getAssignments', (req, res) => {
    pool.getConnection()
        .then(conn => {
            conn.query('SELECT a.Assignment_ID, a.Personnel_ID, a.Contract_ID, a.StartDate, a.EndDate, s.StatusName AS Status, p.Type AS PaymentMode FROM assignment a JOIN status s ON a.Status_ID = s.Status_ID JOIN paymenttype p ON a.PaymentType_ID = p.PaymentType_ID')
                .then(rows => {
                    res.json(rows);
                    conn.release();
                })
                .catch(err => {
                    res.status(500).send('Error fetching assignment data');
                    console.error('Error fetching assignment data:', err);
                    conn.release();
                });
        })
        .catch(err => {
            res.status(500).send('Database connection failed');
            console.error('Database connection failed:', err);
        });
});

// Route to add assignment data
app.post('/addAssignment', (req, res) => {
    const { personnelId, contractId, assignmentStart, assignmentEnd, statusId, salaryId } = req.body;

    pool.getConnection()
        .then(conn => {
            conn.query('INSERT INTO assignment (Personnel_ID, Contract_ID, AssignmentStart, AssignmentEnd, Status_ID, Salary_ID) VALUES (?, ?, ?, ?, ?, ?)', [personnelId, contractId, assignmentStart, assignmentEnd, statusId, salaryId])
                .then(result => {
                    res.send('Assignment added successfully');
                    conn.release();
                })
                .catch(err => {
                    res.status(500).send('Error adding assignment data');
                    console.error('Error adding assignment data:', err);
                    conn.release();
                });
        })
        .catch(err => {
            res.status(500).send('Database connection failed');
            console.error('Database connection failed:', err);
        });
});

// Route to add new client
app.post('/addClient', (req, res) => {
    const { clientName, businessName, contactPerson, contactNumber, email, clientType, street, barangay, city, province, zipcode } = req.body;

    pool.getConnection()
        .then(conn => {
            conn.query('INSERT INTO address (Street, Barangay, City, Province, Postal_Code) VALUES (?, ?, ?, ?, ?)', [street, barangay, city, province, zipcode])
                .then(result => {
                    const addressId = result.insertId;
                    return conn.query('INSERT INTO client (ClientName, ClientType_ID, ContactPerson, ContactNumber, Email, Address_ID) VALUES (?, ?, ?, ?, ?, ?)', [clientName, clientType, contactPerson, contactNumber, email, addressId]);
                })
                .then(result => {
                    res.send('Client added successfully');
                    conn.release();
                })
                .catch(err => {
                    res.status(500).send('Error adding client');
                    console.error('Error adding client:', err);
                    conn.release();
                });
        })
        .catch(err => {
            res.status(500).send('Database connection failed');
            console.error('Database connection failed:', err);
        });
});

// Route to add new contract
app.post('/addContract', (req, res) => {
    const { client, startDate, endDate, paymentMode, status, contractValue } = req.body;

    pool.getConnection()
        .then(conn => {
            conn.query('INSERT INTO contract (Client_ID, StartDate, EndDate, PaymentType_ID, Status_ID, ContractValue) VALUES (?, ?, ?, ?, ?, ?)', [client, startDate, endDate, paymentMode, status, contractValue])
                .then(result => {
                    res.send('Contract added successfully');
                    conn.release();
                })
                .catch(err => {
                    res.status(500).send('Error adding contract');
                    console.error('Error adding contract:', err);
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

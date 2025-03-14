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
            conn.query(`
                SELECT 
                    a.Assignment_ID, 
                    a.Personnel_ID, 
                    a.Contract_ID, 
                    a.AssignmentStart AS StartDate, 
                    a.AssignmentEnd AS EndDate, 
                    s.StatusName AS Status
                FROM assignment a 
                JOIN status s ON a.Status_ID = s.Status_ID 
            `)
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
    const { assignmentId, personnelId, contractId, assignmentStart, assignmentEnd, statusId, salaryId } = req.body;

    pool.getConnection()
        .then(conn => {
            // Start a transaction
            conn.beginTransaction()
                .then(() => {
                    // Insert assignment data into assignment table
                    return conn.query('INSERT INTO assignment (Assignment_ID, Personnel_ID, Contract_ID, AssignmentStart, AssignmentEnd, Status_ID, Salary_ID) VALUES (?, ?, ?, ?, ?, ?, ?)', 
                    [assignmentId, personnelId, contractId, assignmentStart, assignmentEnd, statusId, salaryId]);
                })
                .then(result => {
                    // Update the Assignment_ID field in the personnel table
                    return conn.query('UPDATE personnel SET Assignment_ID = ? WHERE Personnel_ID = ?', [assignmentId, personnelId]);
                })
                .then(result => {
                    // Commit the transaction
                    return conn.commit();
                })
                .then(() => {
                    res.send('Assignment added and personnel updated successfully');
                    conn.release();
                })
                .catch(err => {
                    // Rollback the transaction in case of error
                    conn.rollback()
                        .then(() => {
                            res.status(500).send('Error adding assignment data');
                            console.error('Error adding assignment data:', err);
                            conn.release();
                        });
                });
        })
        .catch(err => {
            res.status(500).send('Database connection failed');
            console.error('Database connection failed:', err);
        });
});


app.post('/addClient', (req, res) => {
    const { clientName, businessName, contactPerson, contactNumber, email, clientType, street, barangay, city, province, zipcode } = req.body;

    pool.getConnection()
        .then(conn => {
            conn.query('INSERT INTO address (Street, Barangay, City, Province, Postal_Code) VALUES (?, ?, ?, ?, ?)', [street, barangay, city, province, zipcode])
                .then(result => {
                    const addressId = result.insertId;
                    return conn.query('INSERT INTO client (ClientName, ClientType_ID, ContactPerson, ContactNumber, Email, Address_ID) VALUES (?, ?, ?, ?, ?, ?)', [businessName, clientType, contactPerson, contactNumber, email, addressId]);
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

// add contract ni frank, from front end to backend database
app.post('/addContract', (req, res) => {
    const { client, startDate, endDate, paymentMode, status, contractValue } = req.body;

    pool.getConnection()
        .then(conn => {
            conn.query('INSERT INTO contract (Client_ID, StartDate, EndDate, PaymentType_ID, Status_ID, ContractValue) VALUES (?, ?, ?, ?, ?, ?)', 
            [client, startDate, endDate, paymentMode, status, contractValue])
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

// Route to get counts for dashboard


// Route to get personnel data by ID
app.get('/api/getPersonnelData', (req, res) => {
    const personnelId = req.query.personnelId;

    pool.getConnection()
        .then(conn => {
            conn.query('SELECT * FROM personnel WHERE Personnel_ID = ?', [personnelId])
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


app.post('/api/addPayslip', (req, res) => {
    const { personnelId, salary, bonus, allowance, deduction1, deduction2, deduction3, sssAccountNumber, pagibigAccountNumber, philhealthAccountNumber } = req.body;

    pool.getConnection()
        .then(conn => {
            conn.beginTransaction()
                .then(() => {
                    // Insert into personnelsalary table
                    return conn.query('INSERT INTO personnelsalary (Personnel_ID, BaseSalary, BaseBonus, BaseAllowance) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE BaseSalary = VALUES(BaseSalary), BaseBonus = VALUES(BaseBonus), BaseAllowance = VALUES(BaseAllowance)', 
                    [personnelId, salary, bonus, allowance]);
                })
                .then(() => {
                    // Insert into personnel_deductions table
                    return Promise.all([
                        conn.query('INSERT INTO personnel_deductions (Personnel_ID, Deduction_ID, AccountNo, Contribution_Amount) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE AccountNo = VALUES(AccountNo), Contribution_Amount = VALUES(Contribution_Amount)', 
                        [personnelId, 1, sssAccountNumber, deduction1]),
                        conn.query('INSERT INTO personnel_deductions (Personnel_ID, Deduction_ID, AccountNo, Contribution_Amount) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE AccountNo = VALUES(AccountNo), Contribution_Amount = VALUES(Contribution_Amount)', 
                        [personnelId, 2, pagibigAccountNumber, deduction2]),
                        conn.query('INSERT INTO personnel_deductions (Personnel_ID, Deduction_ID, AccountNo, Contribution_Amount) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE AccountNo = VALUES(AccountNo), Contribution_Amount = VALUES(Contribution_Amount)', 
                        [personnelId, 3, philhealthAccountNumber, deduction3])
                    ]);
                })
                .then(() => {
                    return conn.commit();
                })
                .then(() => {
                    res.send('Payslip added successfully');
                    conn.release();
                })
                .catch(err => {
                    conn.rollback()
                        .then(() => {
                            res.status(500).send('Error adding payslip');
                            console.error('Error adding payslip:', err);
                            conn.release();
                        });
                });
        })
        .catch(err => {
            res.status(500).send('Database connection failed');
            console.error('Database connection failed:', err);
        });
});

app.get('/api/getPersonnelSalaryAndDeductions', (req, res) => {
    const personnelId = req.query.personnelId;

    pool.getConnection()
        .then(conn => {
            const salaryQuery = conn.query('SELECT * FROM personnelsalary WHERE Personnel_ID = ?', [personnelId]);
            const deductionsQuery = conn.query('SELECT * FROM personnel_deductions WHERE Personnel_ID = ?', [personnelId]);

            return Promise.all([salaryQuery, deductionsQuery])
                .then(([salaryRows, deductionsRows]) => {
                    res.json({
                        salary: salaryRows[0],
                        deductions: deductionsRows
                    });
                    conn.release();
                })
                .catch(err => {
                    res.status(500).send('Error fetching personnel salary and deductions');
                    console.error('Error fetching personnel salary and deductions:', err);
                    conn.release();
                });
        })
        .catch(err => {
            res.status(500).send('Database connection failed');
            console.error('Database connection failed:', err);
        });
});

// Route to save payroll data
app.post('/api/savePayroll', (req, res) => {
    const { personnelId, totalGross, totalDeduction, totalNet, dateStart, dateEnd } = req.body;

    pool.getConnection()
        .then(conn => {
            conn.beginTransaction()
                .then(() => {
                    // Insert into salary table
                    return conn.query('INSERT INTO salary (Personnel_ID, Total_Gross, Total_Deductions, NetGross) VALUES (?, ?, ?, ?)', 
                    [personnelId, totalGross, totalDeduction, totalNet]);
                })
                .then(() => {
                    return conn.commit();
                })
                .then(() => {
                    res.send('Payroll saved successfully');
                    conn.release();
                })
                .catch(err => {
                    conn.rollback()
                        .then(() => {
                            res.status(500).send('Error saving payroll');
                            console.error('Error saving payroll:', err);
                            conn.release();
                        });
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

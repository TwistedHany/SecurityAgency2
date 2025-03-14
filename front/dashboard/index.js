app.get('/getCounts', (req, res) => {
    pool.getConnection()
        .then(conn => {
            const queries = [
                'SELECT COUNT(*) AS activePersonnel FROM personnel WHERE Assignment_ID IS NOT NULL', // Active personnel have an Assignment_ID
                'SELECT COUNT(*) AS inactivePersonnel FROM personnel WHERE Assignment_ID IS NULL', // Inactive personnel do not have an Assignment_ID
                'SELECT COUNT(*) AS availableContracts FROM contract WHERE Status_ID = 1' // Assuming Status_ID 1 is for active contracts
            ];

            Promise.all(queries.map(query => conn.query(query)))
                .then(results => {
                    const counts = {
                        activePersonnel: results[0][0].activePersonnel,
                        inactivePersonnel: results[1][0].inactivePersonnel,
                        availableContracts: results[2][0].availableContracts
                    };
                    res.json(counts);
                    conn.release();
                })
                .catch(err => {
                    res.status(500).send('Error fetching counts');
                    console.error('Error fetching counts:', err);
                    conn.release();
                });
        })
        .catch(err => {
            res.status(500).send('Database connection failed');
            console.error('Database connection failed:', err);
        });
});
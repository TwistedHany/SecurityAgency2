document.addEventListener('DOMContentLoaded', function() {
    loadClientData();
    loadContractData();
    loadAssignmentData();
});

function loadClientData() {
    fetch('http://localhost:5000/getClients')
        .then(response => response.json())
        .then(data => {
            const clientData = document.getElementById('clientData');
            clientData.innerHTML = '';
            data.forEach(client => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${client.Client_ID}</td>
                    <td>${client.ClientName}</td>
                    <td>${client.ContactPerson}</td>
                    <td>${client.ContactNumber}</td>
                    <td>${client.Email}</td>
                    <td>${client.Address}</td>
                `;
                clientData.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching client data:', error);
        });
}

function loadContractData() {
    fetch('http://localhost:5000/getContracts')
        .then(response => response.json())
        .then(data => {
            const contractData = document.getElementById('contractData');
            contractData.innerHTML = '';
            data.forEach(contract => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${contract.Contract_ID}</td>
                    <td>${contract.Client}</td>
                    <td>${contract.StartDate}</td>
                    <td>${contract.EndDate}</td>
                    <td>${contract.PaymentMode}</td>
                    <td>${contract.Status}</td>
                    <td>${contract.ContractValue}</td>
                `;
                contractData.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching contract data:', error);
        });
}

function loadAssignmentData() {
    fetch('http://localhost:5000/getAssignments')
        .then(response => response.json())
        .then(data => {
            const assignmentGrid = document.getElementById('assignmentGrid');
            assignmentGrid.innerHTML = ''; // Clear existing data
            data.forEach(assignment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${assignment.Assignment_ID}</td>
                    <td>${assignment.Personnel_ID}</td>
                    <td>${assignment.Contract_ID}</td>
                    <td>${assignment.StartDate}</td>
                    <td>${assignment.EndDate}</td>
                    <td>${assignment.Status}</td>
                `;
                assignmentGrid.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching assignment data:', error));
}

function addClient(event) {
    event.preventDefault(); // Prevent the default form submission

    const clientForm = document.getElementById('clientForm');
    const formData = new FormData(clientForm);
    const clientData = Object.fromEntries(formData.entries());

    fetch('http://localhost:5000/addClient', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        clientForm.reset();
        loadClientData();
    })
    .catch(error => {
        console.error('Error adding client:', error);
    });
}

function addContract(event) {
    event.preventDefault(); // Prevent the default form submission

    const contractForm = document.getElementById('contractForm');
    const formData = new FormData(contractForm);
    const contractData = Object.fromEntries(formData.entries());

    fetch('http://localhost:5000/addContract', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(contractData)
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        contractForm.reset();
        loadContractData();
    })
    .catch(error => {
        console.error('Error adding contract:', error);
    });
}

function addAssignment(event) {
    event.preventDefault(); 

    const assignmentForm = document.getElementById('assignmentForm');
    const formData = new FormData(assignmentForm);
    const assignmentData = Object.fromEntries(formData.entries());

    fetch('http://localhost:5000/addAssignment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        assignmentForm.reset();
        loadAssignmentData();
    })
    .catch(error => {
        console.error('Error adding assignment:', error);
    });
}
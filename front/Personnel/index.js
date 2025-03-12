document.addEventListener('DOMContentLoaded', () => {
    loadPersonnelData();
  
    document.getElementById('personnelForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        fetch('http://localhost:5000/submitPersonnel', {
            method: 'POST',
            body: JSON.stringify(Object.fromEntries(formData)),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            this.reset();
            loadPersonnelData();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});

function loadPersonnelData() {
    fetch('http://localhost:5000/getPersonnel')
        .then(response => response.json())
        .then(data => {
            const personnelData = document.getElementById('personnelData');
            personnelData.innerHTML = '';
            data.forEach(personnel => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${personnel.Personnel_ID}</td>
                    <td>${personnel.Personnel_Name}</td>
                    <td>${personnel.Personnel_Age}</td>
                    <td>${personnel.CivilStatus}</td>
                    <td>${personnel.Gender}</td>
                    <td>${personnel.Street}, ${personnel.Barangay}, ${personnel.City}, ${personnel.Province}, ${personnel.Zipcode}</td>
                    <td>${personnel.ContactNo}</td>
                    <td>${personnel.Email}</td>
                `;
                personnelData.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function searchPersonnel() {
    const searchValue = document.getElementById('search').value;

    fetch(`http://localhost:5000/searchPersonnel?query=${searchValue}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const personnel = data[0];
                document.getElementById('personnelId').value = personnel.Personnel_ID;
                document.getElementById('personnelName').value = personnel.Personnel_Name;
                document.getElementById('personnelAge').value = personnel.Personnel_Age;
                document.getElementById('personnelCivilStatus').value = personnel.CivilStatus;
                document.getElementById('personnelGender').value = personnel.Gender;
                document.getElementById('personnelAddress').value = `${personnel.Street}, ${personnel.Barangay}, ${personnel.City}, ${personnel.Province}, ${personnel.Zipcode}`;
                document.getElementById('personnelContactNumber').value = personnel.ContactNo;
                document.getElementById('personnelEmail').value = personnel.Email;

                document.getElementById('personnelDetailsCard').style.display = 'block';
            } else {
                alert('No personnel found');
                document.getElementById('personnelDetailsCard').style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching personnel data:', error);
        });
}

function deletePersonnel() {
    const personnelId = document.getElementById('personnelId').value;
    if (confirm('Are you sure you want to delete this personnel?')) {
        fetch(`http://localhost:5000/deletePersonnel?personnelId=${personnelId}`, {
            method: 'DELETE'
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            document.getElementById('personnelDetailsCard').style.display = 'none';
            loadPersonnelData();
        })
        .catch(error => {
            console.error('Error deleting personnel:', error);
        });
    }
}

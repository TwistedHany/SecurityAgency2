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
    fetch('http://localhost:3000/getPersonnel')
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

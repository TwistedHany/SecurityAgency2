document.getElementById('searchButton').addEventListener('click', function() {
    const personnelId = document.getElementById('personnelIdInput').value;

    fetch(`/api/getPersonnelData?personnelId=${personnelId}`)
        .then(response => response.json())
        .then(data => {
            const personnelData = document.getElementById('personnelData');
            personnelData.innerHTML = '';

            data.forEach(person => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="padding: 10px; text-align: left;">${person.personnelId}</td>
                    <td style="padding: 10px; text-align: left;">${person.name}</td>
                    <td style="padding: 10px; text-align: left;">${person.status}</td>
                    <td style="padding: 10px; text-align: left;">${person.payId}</td>
                    <td style="padding: 10px; text-align: left;">${person.totalGross}</td>
                    <td style="padding: 10px; text-align: left;">${person.totalDeduction}</td>
                    <td style="padding: 10px; text-align: left;">${person.totalNet}</td>
                `;
                personnelData.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching personnel data:', error));
});
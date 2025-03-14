
document.getElementById('confirmButton').addEventListener('click', function() {
    const personnelId = document.getElementById('personnelIdInputEarnings').value;
    const salary = document.getElementById('salaryInput').value;
    const bonus = document.getElementById('bonusInput').value;
    const allowance = document.getElementById('allowanceInput').value;
    const deduction1 = document.getElementById('deduction1Input').value;
    const deduction2 = document.getElementById('deduction2Input').value;
    const deduction3 = document.getElementById('deduction3Input').value;
    const sssAccountNumber = document.getElementById('sssAccountNumber').value;
    const pagibigAccountNumber = document.getElementById('pagibigAccountNumber').value;
    const philhealthAccountNumber = document.getElementById('philhealthAccountNumber').value;

    const payslipData = {
        personnelId,
        salary,
        bonus,
        allowance,
        deduction1,
        deduction2,
        deduction3,
        sssAccountNumber,
        pagibigAccountNumber,
        philhealthAccountNumber
    };

    fetch('/api/addPayslip', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payslipData)
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
    })
    .catch(error => console.error('Error adding payslip:', error));
});

document.getElementById('calculateButton').addEventListener('click', function() {
    const salary = parseFloat(document.getElementById('salaryInput').value) || 0;
    const bonus = parseFloat(document.getElementById('bonusInput').value) || 0;
    const allowance = parseFloat(document.getElementById('allowanceInput').value) || 0;
    const deduction1 = parseFloat(document.getElementById('deduction1Input').value) || 0;
    const deduction2 = parseFloat(document.getElementById('deduction2Input').value) || 0;
    const deduction3 = parseFloat(document.getElementById('deduction3Input').value) || 0;

    const totalGross = salary + bonus + allowance;
    const totalDeduction = deduction1 + deduction2 + deduction3;
    const totalNet = totalGross - totalDeduction;

    alert(`Total Gross: ${totalGross}\nTotal Deduction: ${totalDeduction}\nTotal Net: ${totalNet}`);
});

document.getElementById('computationSearchButton').addEventListener('click', function() {
    const personnelId = document.getElementById('computationPersonnelIdInput').value;

    fetch(`http://127.0.0.1:5000/api/getPersonnelSalaryAndDeductions?personnelId=${personnelId}`)
        .then(response => response.json())
        .then(data => {
            if (data.salary) {
                document.getElementById('baseSalary').value = data.salary.BaseSalary;
                document.getElementById('baseBonus').value = data.salary.BaseBonus;
                document.getElementById('baseAllowance').value = data.salary.BaseAllowance;
            }
            if (data.deductions) {
                data.deductions.forEach(deduction => {
                    if (deduction.Deduction_ID === 1) {
                        document.getElementById('sssContribution').value = deduction.Contribution_Amount;
                    } else if (deduction.Deduction_ID === 2) {
                        document.getElementById('pagibigContribution').value = deduction.Contribution_Amount;
                    } else if (deduction.Deduction_ID === 3) {
                        document.getElementById('philhealthContribution').value = deduction.Contribution_Amount;
                    }
                });
            }
        })
        .catch(error => console.error('Error fetching personnel salary and deductions:', error));
});

document.getElementById('computeButton').addEventListener('click', function() {
    const salary = parseFloat(document.getElementById('baseSalary').value) || 0;
    const bonus = parseFloat(document.getElementById('baseBonus').value) || 0;
    const allowance = parseFloat(document.getElementById('baseAllowance').value) || 0;
    const deduction1 = parseFloat(document.getElementById('sssContribution').value) || 0;
    const deduction2 = parseFloat(document.getElementById('pagibigContribution').value) || 0;
    const deduction3 = parseFloat(document.getElementById('philhealthContribution').value) || 0;

    const grossComponents = [
        document.getElementById('grossComponents1').value,
        document.getElementById('grossComponents2').value,
        document.getElementById('grossComponents3').value
    ];

    const deductionComponents = [
        document.getElementById('deductionComponents1').value,
        document.getElementById('deductionComponents2').value,
        document.getElementById('deductionComponents3').value
    ];

    let totalGross = 0;
    let totalDeduction = 0;

    grossComponents.forEach(component => {
        if (component === 'salary') totalGross += salary;
        if (component === 'bonus') totalGross += bonus;
        if (component === 'allowance') totalGross += allowance;
    });

    deductionComponents.forEach(component => {
        if (component === 'deduction1') totalDeduction += deduction1;
        if (component === 'deduction2') totalDeduction += deduction2;
        if (component === 'deduction3') totalDeduction += deduction3;
    });

    const totalNet = totalGross - totalDeduction;

    document.getElementById('totalGross').value = totalGross.toFixed(2);
    document.getElementById('totalDeduction').value = totalDeduction.toFixed(2);
    document.getElementById('totalNet').value = totalNet.toFixed(2);
});

document.getElementById('saveButton').addEventListener('click', function() {
    const personnelId = document.getElementById('computationPersonnelIdInput').value;
    const totalGross = parseFloat(document.getElementById('totalGross').value) || 0;
    const totalDeduction = parseFloat(document.getElementById('totalDeduction').value) || 0;
    const totalNet = parseFloat(document.getElementById('totalNet').value) || 0;
    const currentDate = new Date().toISOString().split('T')[0];

    const payrollData = {
        personnelId,
        totalGross,
        totalDeduction,
        totalNet,
        dateStart: currentDate,
        dateEnd: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString().split('T')[0]
    };

    fetch('http://127.0.0.1:5000/api/savePayroll', { // Ensure the URL matches the server's URL and port
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payrollData)
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
    })
    .catch(error => console.error('Error saving payroll:', error));
});

document.getElementById('searchPersonnelButton').addEventListener('click', function() {
    const personnelId = document.getElementById('searchPersonnelIdInput').value;

    fetch(`/api/getPersonnelAccountNumbers?personnelId=${personnelId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('searchSssAccountNumber').value = data.sssAccountNumber || '';
            document.getElementById('searchPagibigAccountNumber').value = data.pagibigAccountNumber || '';
            document.getElementById('searchPhilhealthAccountNumber').value = data.philhealthAccountNumber || '';
            document.getElementById('searchStatus').value = data.status || 'Pending';
        })
        .catch(error => console.error('Error fetching personnel account numbers:', error));
});

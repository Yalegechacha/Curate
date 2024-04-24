function populateSummary(data) {
    const summaryContentElement = document.getElementById('summary-content');
    summaryContentElement.innerHTML = ''; // Clear out existing content

    // Create the Patient Overview section
    const patientOverviewTitle = document.createElement('h3');
    patientOverviewTitle.textContent = 'Patient Overview';
    summaryContentElement.appendChild(patientOverviewTitle);

    const patientOverviewElement = document.createElement('p');
    patientOverviewElement.textContent = data.overview;
    summaryContentElement.appendChild(patientOverviewElement);

    // Create the Problems section
    const problemsTitle = document.createElement('h3');
    problemsTitle.textContent = 'Problems';
    summaryContentElement.appendChild(problemsTitle);

    const problemsContainer = document.createElement('div');
    data.problems.forEach(problem => {
        const problemButton = document.createElement('button');
        problemButton.textContent = `${problem.name}: ${problem.active ? 'Active' : 'Inactive'}`;
        problemButton.className = 'summary-button';
        problemButton.onclick = function () {
            // Your logic to navigate to the problem details
        };
        problemsContainer.appendChild(problemButton);
    });
    summaryContentElement.appendChild(problemsContainer);

    // Create the Medications section
    const medicationsTitle = document.createElement('h3');
    medicationsTitle.textContent = 'Medications';
    summaryContentElement.appendChild(medicationsTitle);

    const medicationsContainer = document.createElement('div');
    data.medications.forEach(medication => {
        const medicationButton = document.createElement('button');
        medicationButton.textContent = `${medication.name} ${medication.dosage} (${medication.active ? 'Active' : 'Inactive'})`;
        medicationButton.className = 'summary-button';
        medicationButton.onclick = function () {
            // Your logic to navigate to the medication details
        };
        medicationsContainer.appendChild(medicationButton);
    });
    summaryContentElement.appendChild(medicationsContainer);
}


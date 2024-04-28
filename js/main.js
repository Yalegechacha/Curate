const tabMap = {
    'Summary': '.summary-container',
    'Problems': '.problem-container',
    'Medications': '.medication-container',
    'Surgeries': '.surgeries-container',
    'Tests': '.tests-container'
};


let overviewData = [];
let conditionsData = [];

async function fetchOverviewData() {
    try {
        const response = await fetch('http://https://curate-cornell-9e700cd2e9e3.herokuapp.com/patient/overview', {
            method: 'GET'
        });
        if (!response.ok) throw new Error('Failed to fetch medications data');
        const data = await response.json();
        overviewData = data;
        medicationsData = overviewData.medications;
    } catch (error) {
        console.error('Error fetching overviews data:', error);
    }
}

async function fetchConditionsData() {
    try {
        const response = await fetch('http://https://curate-cornell-9e700cd2e9e3.herokuapp.com/patient/documents', {
            method: 'GET'
        })
        if (!response.ok) throw new Error('Failed to fetch conditions data');
        const data = await response.json();
        conditionsData = data;
    } catch (error) {
        console.error('Error fetching conditions data:', error);
    }
}

async function initializeApp() {
    await fetchOverviewData();
    await fetchConditionsData();
    populatePatientInfo(overviewData.particulars)
    initializeTabs();
}

// Initialize tabs with click events
function initializeTabs() {
    const tabs = document.querySelectorAll('.tabs button');
    tabs.forEach(tab => {
        tab.addEventListener('click', (event) => {
            resetTabs(); // Reset the styling for all tabs
            event.target.classList.add('active'); // Set the clicked tab to active
            showTabContent(event.target.textContent.trim()); // Show the corresponding tab content
            populatePatientInfo(overviewData.particulars)
        });
    });

    const summaryTab = document.querySelector('.tabs button:first-child'); // Assuming Summary is the first button
    if (summaryTab) {
        summaryTab.classList.add('active');
        showTabContent('Summary'); // Show Summary content
    }
}

// This function will be responsible for displaying the correct tab content
function showTabContent(tabName) {
    // Hide all tab contents
    Object.values(tabMap).forEach(contentSelector => {
        const content = document.querySelector(contentSelector);
        if (content) {
            content.style.display = 'none';
        }
    });

    // Show the selected tab content
    const content = document.querySelector(tabMap[tabName]);
    if (content) {
        content.style.display = 'flex'; // Adjust this as necessary for your layout

        // Populate the content if needed
        if (tabName === 'Summary' && overviewData) {
            populateSummary(overviewData);
        }
    }
}

async function loadFile() {
    const fileInput = document.getElementById('file-input');
    
    if (fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        try {
            // First, upload the file
            const uploadResponse = await fetch('https://curate-cornell-9e700cd2e9e3.herokuapp.com/upload', {
                method: 'POST',
                body: formData,
            });
            const uploadResult = await uploadResponse.json();
            if (!uploadResponse.ok) throw new Error(uploadResult.message);

            alert('File uploaded successfully!');
            document.getElementById('loading').style.display = 'block';

            // Then, call the /init API
            const initResponse = await fetch('https://curate-cornell-9e700cd2e9e3.herokuapp.com/init', {
                method: 'POST'
            });
            const initResult = await initResponse.json();
            if (!initResponse.ok) throw new Error(initResult.message);

            alert('Database initialized!');

            // If everything is successful, initialize the app
            console.log('initializing app')
            initializeApp();
            console.log('app initialized')
        } catch (error) {
            console.error('Error during the upload or initialization process:', error);
            alert(error.message);
        }
    } else {
        alert('Please select a file.');
    }
}

function resetTabs() {
    const tabs = document.querySelectorAll('.tabs button');
    tabs.forEach(tab => tab.classList.remove('active'));

    const contents = document.querySelectorAll('.tab-content > div');
    contents.forEach(content => content.style.display = 'none');
}

function populatePatientInfo(particulars) {
    const sidebar = document.querySelector('.patient-info');
    const patientInfoElement = document.createElement('div')
    patientInfoElement.innerHTML = `
        <h1>${particulars.name}</h1>
        <p><strong>Age:</strong> ${particulars.age}</p>
        <p><strong>Gender:</strong> ${particulars.gender}</p>
        <p><strong>Date of Birth:</strong> ${particulars.dob}</p>
    `;
    sidebar.appendChild(patientInfoElement);
    patientInfoElement.style.display = 'block';
}


function populateSummary(data) {
    if (data) {
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
                const problemId = problem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        
                // Find the tab that has the same `data-condition-id` as the problemId
                const conditionTab = document.querySelector(`.condition-tab[data-condition-id="${problemId}"]`);
                if (conditionTab) {
                    document.querySelector('.tabs button:nth-child(2)').click();
                    conditionTab.click(); // Simulate a click on the condition tab
                } else {
                    console.error(`No tab found for condition id: ${problemId}`);
                }
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
            const button = document.createElement('button');
            button.textContent = `${medication.name} (${medication.dosage}) - ${medication.active ? 'Active' : 'Inactive'}`;
            button.className = 'summary-button';
            button.id = `${medication.name}-button`;
            button.onclick = () => {
                const conditionId = findConditionIdBySourcePath(medication.source_path);
                if (conditionId) {
                    const problemsTab = document.querySelector('.tabs button:nth-child(2)');
                    const conditionTab = document.querySelector(`.condition-button[data-condition-id="${conditionId}"]`);
        
                    if (problemsTab && conditionTab) {
                        // Click the Problems tab first
                        problemsTab.click();
                        // Wait for the UI to update
                        setTimeout(() => {
                            // Then click the specific condition tab
                            console.log(conditionTab)
                            conditionTab.click();
                            // Another delay to ensure the UI has updated
                            setTimeout(() => {
                                // Now show the PDF
                                showReportPDF(medication.source_path, conditionId);
                            }, 100);
                        }, 100);
                    } else {
                        console.error("Required tabs not found:", {problemsTab, conditionTab});
                    }
                } else {
                    console.error("Condition ID not found for the given source path.");
                }
            };
            medicationsContainer.appendChild(button);
        });
        summaryContentElement.appendChild(medicationsContainer);

        // Add any additional elements you need for the summary content here...
    }
}

function findConditionIdBySourcePath(sourcePath) {
    const condition = conditionsData.find(condition => condition.source_path.includes(sourcePath));
    return condition ? condition.problem.replace(/ /g, '-').toLowerCase() : null; // transform the problem name into a valid ID format if necessary
}

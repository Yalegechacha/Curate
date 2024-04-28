let document_summary = {}

document.addEventListener('DOMContentLoaded', function() {
    setupDashboard(); // This function will continue the initialization specific to dashboard.html
});

async function fetchDocumentSummary(filePath) {
    try {
        fileTitle = extractTitle(filePath);
        const response = await fetch(`http://https://curate-cornell-9e700cd2e9e3.herokuapp.com/patient/document-summary/${fileTitle}`);
        if (!response.ok) throw new Error('Failed to fetch medications data');
        const data = await response.json();
        document_summary[fileTitle] = data
    } catch (error) {
        console.error('Error fetching overviews data:', error);
    }
    
}

function showConditionContent(conditionId, conditionData) {
    const conditionContents = document.querySelectorAll('.condition-details .problem-section');
    conditionContents.forEach(section => section.style.display = 'none');  // Hide all sections

    const conditionContent = document.getElementById(conditionId);
    if (conditionContent) {
        conditionContent.style.display = 'block';  // Display the active condition
        const summaryElement = conditionContent.querySelector('p:nth-of-type(1)');
        if (summaryElement) {
            summaryElement.textContent = conditionData.summary;  // Update the summary
        }
        setupReportsButton(conditionId, conditionData.source_path);  // Setup report buttons
    } else {
        console.error(`No content found for condition id: ${conditionId}`);
    }
}

async function fetchReportsData(conditionName) {
    const response = await fetch(`jsons/documents.json`);
    if (!response.ok) throw new Error('Failed to fetch reports data');
    const reportsData = await response.json();
    const conditionData = reportsData.find(report => report.problem === conditionName);
    if (!conditionData) throw new Error('No reports found for the given condition');
    return conditionData; // Return the entire object, which includes both source_path and summary
}

function setupConditionTabs() {
    const conditionTabs = document.querySelectorAll('.condition-button');
    conditionTabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            const conditionName = tab.textContent.trim();
            conditionTabs.forEach(ct => ct.classList.remove('active'));
            tab.classList.add('active');

            try {
                const conditionData = await fetchReportsData(conditionName);
                showConditionContent(tab.dataset.conditionId, conditionData);
            } catch (error) {
                console.error('Error fetching reports data:', error);
            }
        });
    });

    if (conditionTabs.length > 0) {
        conditionTabs[0].click(); // Click the first tab by default
    }
}

function setupReportsButton(conditionId, sourcePaths) {
    // Hide all report content containers
    hideAllReportContainer();

    const reportsContainer = document.getElementById(`${conditionId}-reports-content`);
    if (!reportsContainer) {
        console.error('Report container not found for:', conditionId);
        return;
    }
    reportsContainer.innerHTML = ''; // Clear existing content
    reportsContainer.style.display = 'block';

    sourcePaths.forEach(sourcePath => {
        const reportButton = document.createElement('button');
        reportButton.className = 'report-button';
        const reportTitle = extractTitle(sourcePath);
        reportButton.textContent = reportTitle;
        reportButton.onclick = () => {
            updateSidebar(sourcePath);
            showReportPDF(sourcePath, conditionId);
            createConditionSubTab(reportTitle, sourcePath, conditionId)
        }
        reportsContainer.appendChild(reportButton);
        //reportsContainer.style.display = 'active'
    });
}

function showReportPDF(path, conditionId) {
    const conditionContent = document.getElementById(conditionId);
    const pdfContainer = conditionContent.querySelector('.report-content-container');
    pdfContainer.innerHTML = `
        <iframe src="http://https://curate-cornell-9e700cd2e9e3.herokuapp.com/patient/document/${extractTitle(path)}" style="width:100%; height:800px;" frameborder="0"></iframe>
        <button class="close-pdf" onclick="hidePDFDisplay('${conditionId}')">Close PDF</button>
    `;
    pdfContainer.style.display = 'block';
}

function hidePDFDisplay(conditionId) {
    const conditionContent = document.getElementById(conditionId);
    const pdfContainer = conditionContent.querySelector('.report-content-container');
    pdfContainer.innerHTML = '';  // Clear the iframe
    const problemSection = conditionContent.querySelector('.problem-section');
    problemSection.style.display = 'block';  // Show the original content
}

function extractTitle(filePath) {
    const fileNameWithExtension = filePath.split('/').pop();
    const fileName = fileNameWithExtension.split('.').slice(0, -1).join('.');
    return fileName.replace(/_/g, ' ');
}

function hideAllReportContainer() {
    const reportContainers = document.querySelectorAll('.report-content-container');
    reportContainers.forEach(container => {
        container.style.display = 'none';
    });
}

function updateSidebar(sourcePath) {
    const sidebar = document.querySelector('.patient-info');
    sidebar.firstElementChild.style.display = 'none';
    const pdfSummary = document.createElement('div');
    const authorElement = document.createElement('p');
    const summaryElement = document.createElement('p');
    fileTitle = extractTitle(sourcePath);
    fileContent = document_summary[fileTitle];

    authorElement.innerHTML = `<strong>Author:</strong> ${fileContent.author}`;
    summaryElement.innerHTML = `<strong>Summary:</strong> ${fileContent.author}`;
    authorElement.classList.add('dynamic-info');
    summaryElement.classList.add('dynamic-info');

    pdfSummary.appendChild(authorElement);
    pdfSummary.appendChild(summaryElement);
    pdfSummary.style.display = 'block';
    sidebar.appendChild(pdfSummary)
}

// Assuming this script is included after main.js and executes after main.js has set up the tabs
setupConditionTabs();
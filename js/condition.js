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
    const conditionTabs = document.querySelectorAll('.condition-tab');
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
            showReportPDF(sourcePath, conditionId);
        }
        reportsContainer.appendChild(reportButton);
        //reportsContainer.style.display = 'active'
    });
}

function showReportPDF(path, conditionId) {
    const conditionContent = document.getElementById(conditionId);
    const pdfContainer = conditionContent.querySelector('.report-content-container');
    pdfContainer.innerHTML = `
        <iframe src="${path}" style="width:100%; height:800px;" frameborder="0"></iframe>
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

/* function createConditionSubTab(title, path, conditionId) {
    const conditionTab = document.querySelector(`#${conditionId}-condition-tabs`); // Assuming a specific ID structure
    if (!conditionTab) {
        console.error('Condition tab not found for:', conditionId);
        return;
    }
    const subTab = document.createElement('button');
    subTab.className = 'condition-sub-tab';
    subTab.textContent = title;
    subTab.onclick = () => showReportPDF(path);
    
    conditionTab.appendChild(subTab);
}

function updateSidebar(author, summary) {
    const sidebar = document.querySelector('.patient-info');
    const authorElement = document.createElement('p');
    const summaryElement = document.createElement('p');

    authorElement.innerHTML = `<strong>Author:</strong> ${author}`;
    summaryElement.innerHTML = `<strong>Summary:</strong> ${summary}`;

    // Append these under the existing patient info but clear previous report info
    sidebar.querySelectorAll('.dynamic-info').forEach(e => e.remove()); // Clear previous dynamic info
    authorElement.classList.add('dynamic-info');
    summaryElement.classList.add('dynamic-info');

    sidebar.appendChild(authorElement);
    sidebar.appendChild(summaryElement);
} */

// Assuming this script is included after main.js and executes after main.js has set up the tabs
setupConditionTabs();
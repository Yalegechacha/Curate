const tabMap = {
    'Summary': '.summary-container',
    'Problems': '.problem-container',
    'Medicine': '.medicine-container',
    'Surgeries': '.surgeries-container',
    'Tests': '.tests-container'
};

function loadFile() {
    var fileInput = document.getElementById('file-input');
    var filePath = fileInput.value;
    
    // Check if any file is selected or not
    if (fileInput.files.length > 0) {
        var allowedExtensions = /(\.pdf)$/i;
        
        if (!allowedExtensions.exec(filePath)) {
            alert('Please upload file having extensions .pdf only.');
            fileInput.value = ''; // Clear the input
            return false;
        } else {
            // Image preview
            document.getElementById('loading').style.display = 'block';
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 3000); // simulate loading time
        }
    } else {
        alert('Please select a file.');
    }
}

function generateTimeline() {
    const timelineData = [
        { type: 'Diagnosis', date: 'Feb 2022', color: 'navy' },
        { type: 'Surgery', date: 'Mar 2022', color: 'red' },
        // Add more timeline events as needed
    ];

    const timelineElement = document.querySelector('.timeline');
    timelineData.forEach(event => {
        const barElement = document.createElement('div');
        barElement.style.backgroundColor = event.color;
        barElement.title = `${event.type} - ${event.date}`;
        timelineElement.appendChild(barElement);
    });
}

function showTabContent(tabName) {
    const selector = tabMap[tabName];
    if (selector) {
        const content = document.querySelector(selector);
        content.style.display = 'flex'; // Show the selected tab content
        if (tabName === 'Problems') {
            generateTimeline();
            setupConditionTabs();
        }
    }
}

function resetTabs(allTabContents, tabs) {
    allTabContents.forEach(content => content.style.display = 'none');
    tabs.forEach(tab => tab.classList.remove('active'));
}

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tabs button');
    const allTabContents = document.querySelectorAll('.tab-content > div');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            resetTabs(allTabContents, tabs); // Hide all content and remove 'active' class
            e.target.classList.add('active'); // Add 'active' class to the clicked tab
            showTabContent(e.target.textContent.trim()); // Show content for the clicked tab
        });
    });

    // Set the default tab as active and show its content
    const defaultTab = document.querySelector('.tabs button:nth-child(2)'); // Assuming 'Problems' is the second tab
    if (defaultTab) {
        defaultTab.classList.add('active');
        showTabContent(defaultTab.textContent.trim());
        // Note: setupConditionTabs will be defined in condition.js
        setupConditionTabs(); // This will now refer to the setupConditionTabs in condition.js
    }
});
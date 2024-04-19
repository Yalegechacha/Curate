function showConditionContent(conditionId) {
    // Hide all condition sections
    const conditionContents = document.querySelectorAll('.condition-details .problem-section');
    conditionContents.forEach(section => {
        section.style.display = 'none'; // Initially hide all condition content
    });

    // Show the content for the clicked condition
    const conditionContent = document.getElementById(conditionId);
    if (conditionContent) {
        conditionContent.style.display = 'block'; // Display the content for the active condition
    }
}

function setupConditionTabs() {
    const conditionTabs = document.querySelectorAll('.condition-tab');
    conditionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            conditionTabs.forEach(ct => ct.classList.remove('active'));
            tab.classList.add('active');
            showConditionContent(tab.dataset.conditionId);
        });
    });

    // Trigger click on the first condition tab to set it as active by default
    if (conditionTabs.length > 0) {
        conditionTabs[0].click();
    }
}

// Assuming this script is included after main.js and executes after main.js has set up the tabs
setupConditionTabs();
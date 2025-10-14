// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Department page loaded successfully');
    
    // Initialize - hide all departments and doctors
    const departmentLists = document.querySelectorAll('.departments');
    departmentLists.forEach(list => {
        list.style.display = 'none';
    });
    
    const doctorLists = document.querySelectorAll('.doctors');
    doctorLists.forEach(list => {
        list.style.display = 'none';
    });
    
    // Set 'All' location as default selected
    filterByLocation('all');
    
    // Add event listener for Enter key in search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Clear search when input is empty
        searchInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                resetSearch();
            }
        });
    }
});

// Handle key press for search input
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

// Toggle departments visibility
function toggleDepartments(departmentId) {
    const departments = document.getElementById(departmentId);
    const allDepts = document.querySelectorAll('.departments');
    
    // Close all other departments first
    allDepts.forEach(dept => {
        if (dept.id !== departmentId && dept.style.display === 'block') {
            dept.style.display = 'none';
        }
    });
    
    // Toggle the clicked department
    if (departments.style.display === 'none' || departments.style.display === '') {
        departments.style.display = 'block';
    } else {
        departments.style.display = 'none';
    }
}

// Toggle doctors visibility
function toggleDoctors(header) {
    const doctorsList = header.nextElementSibling;
    const arrow = header.querySelector('.arrow');
    
    // Close all other doctor lists in the same hospital
    const hospital = header.closest('.hospital');
    const allDoctorsLists = hospital.querySelectorAll('.doctors');
    const allArrows = hospital.querySelectorAll('.arrow');
    
    allDoctorsLists.forEach(list => {
        if (list !== doctorsList && list.style.display === 'block') {
            list.style.display = 'none';
        }
    });
    
    allArrows.forEach(arr => {
        if (arr !== arrow && arr.classList.contains('active')) {
            arr.classList.remove('active');
        }
    });
    
    // Toggle the clicked doctors list
    if (doctorsList.style.display === 'none' || doctorsList.style.display === '') {
        doctorsList.style.display = 'block';
        arrow.classList.add('active');
    } else {
        doctorsList.style.display = 'none';
        arrow.classList.remove('active');
    }
}

// Filter hospitals by location
function filterByLocation(location) {
    console.log('Filtering by location:', location);
    
    // Update active button state
    const locationButtons = document.querySelectorAll('.location-btn');
    locationButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('onclick').includes(`'${location}'`) || 
            (location === 'all' && button.textContent.trim().toLowerCase() === 'all')) {
            button.classList.add('active');
        }
    });
    
    // Filter hospitals
    const hospitals = document.querySelectorAll('.hospital');
    let visibleCount = 0;
    
    hospitals.forEach(hospital => {
        if (location === 'all') {
            hospital.style.display = 'block';
            visibleCount++;
        } else {
            const hospitalLocation = hospital.getAttribute('data-location');
            if (hospitalLocation === location) {
                hospital.style.display = 'block';
                visibleCount++;
            } else {
                hospital.style.display = 'none';
            }
        }
    });
    
    // Clear any existing search results message
    clearNoResultsMessage();
    
    // Show message if no hospitals found
    if (visibleCount === 0) {
        const locationName = location.charAt(0).toUpperCase() + location.slice(1);
        showNoResults(`No hospitals found in ${locationName}.`);
    }
    
    // Reset search highlights
    resetSearchHighlights();
}

// Perform search across hospitals, departments, and doctors
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchText = searchInput.value.toLowerCase().trim();
    
    console.log('Performing search for:', searchText);
    
    // If search is empty, reset to current location filter
    if (!searchText) {
        resetSearch();
        return;
    }
    
    // Get search options
    const searchHospitals = document.getElementById('searchHospitals').checked;
    const searchDepartments = document.getElementById('searchDepartments').checked;
    const searchDoctors = document.getElementById('searchDoctors').checked;
    
    // Get all hospitals
    const hospitals = document.querySelectorAll('.hospital');
    let foundResults = false;
    
    // First, reset all highlights and show all hospitals
    resetSearchHighlights();
    
    hospitals.forEach(hospital => {
        let hospitalMatch = false;
        const hospitalName = hospital.querySelector('h2').textContent.toLowerCase();
        const location = hospital.querySelector('.hospital-location').textContent.toLowerCase();
        const specialties = hospital.querySelectorAll('.hospital-info p');
        const departments = hospital.querySelectorAll('.department');
        
        // Check hospital name
        if (searchHospitals && hospitalName.includes(searchText)) {
            highlightText(hospital.querySelector('h2'), searchText);
            hospitalMatch = true;
            foundResults = true;
        }
        
        // Check location
        if (searchHospitals && location.includes(searchText)) {
            highlightText(hospital.querySelector('.hospital-location'), searchText);
            hospitalMatch = true;
            foundResults = true;
        }
        
        // Check specialties
        if (searchHospitals) {
            specialties.forEach(specialty => {
                if (specialty.textContent.toLowerCase().includes(searchText)) {
                    highlightText(specialty, searchText);
                    hospitalMatch = true;
                    foundResults = true;
                }
            });
        }
        
        // Check departments and doctors
        departments.forEach(department => {
            let deptMatch = false;
            const deptHeader = department.querySelector('.dept-header span');
            const deptName = deptHeader.textContent.toLowerCase();
            const doctors = department.querySelectorAll('.doctor span:first-child');
            
            // Check department name
            if (searchDepartments && deptName.includes(searchText)) {
                highlightText(deptHeader, searchText);
                deptMatch = true;
                hospitalMatch = true;
                foundResults = true;
                
                // Ensure department is visible
                const deptContainer = department.closest('.departments');
                if (deptContainer) {
                    deptContainer.style.display = 'block';
                }
                
                // Ensure doctors are visible
                const doctorsList = department.querySelector('.doctors');
                if (doctorsList) {
                    doctorsList.style.display = 'block';
                    const arrow = doctorsList.previousElementSibling.querySelector('.arrow');
                    if (arrow) {
                        arrow.classList.add('active');
                    }
                }
            }
            
            // Check doctors
            if (searchDoctors) {
                doctors.forEach(doctor => {
                    const doctorName = doctor.textContent.toLowerCase();
                    if (doctorName.includes(searchText)) {
                        highlightText(doctor, searchText);
                        deptMatch = true;
                        hospitalMatch = true;
                        foundResults = true;
                        
                        // Ensure doctors list is visible
                        const doctorsList = doctor.closest('.doctors');
                        if (doctorsList) {
                            doctorsList.style.display = 'block';
                            const arrow = doctorsList.previousElementSibling.querySelector('.arrow');
                            if (arrow) {
                                arrow.classList.add('active');
                            }
                        }
                        
                        // Ensure department is visible
                        const deptContainer = doctor.closest('.departments');
                        if (deptContainer) {
                            deptContainer.style.display = 'block';
                        }
                    }
                });
            }
        });
        
        // Hide hospitals with no matches
        hospital.style.display = hospitalMatch ? 'block' : 'none';
    });
    
    // Display message if no results found
    if (!foundResults) {
        showNoResults(`No results found for "${searchText}". Try different keywords.`);
    }
}

// Clear the "No results found" message
function clearNoResultsMessage() {
    const existingNoResults = document.querySelector('.no-results');
    if (existingNoResults) {
        existingNoResults.remove();
    }
}

// Show "No results found" message
function showNoResults(message) {
    const container = document.getElementById('hospitalContainer');
    clearNoResultsMessage();
    
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.innerHTML = `
        <h3>No Results Found</h3>
        <p>${message}</p>
        <button onclick="resetSearch()" style="
            background: #3498db;
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 1rem;
        ">Show All</button>
    `;
    
    container.appendChild(noResults);
}

// Reset search and show all hospitals
function resetSearch() {
    console.log('Resetting search');
    
    // Remove highlights
    resetSearchHighlights();
    
    // Show all hospitals
    const hospitals = document.querySelectorAll('.hospital');
    hospitals.forEach(hospital => {
        hospital.style.display = 'block';
    });
    
    // Reset to current location filter
    const activeLocationBtn = document.querySelector('.location-btn.active');
    if (activeLocationBtn) {
        const location = activeLocationBtn.getAttribute('onclick').match(/'([^']+)'/)[1];
        filterByLocation(location);
    }
    
    // Clear search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Remove no results message
    clearNoResultsMessage();
    
    // Close all department and doctor views
    const departments = document.querySelectorAll('.departments');
    departments.forEach(dept => {
        dept.style.display = 'none';
    });
    
    const doctors = document.querySelectorAll('.doctors');
    doctors.forEach(doc => {
        doc.style.display = 'none';
    });
    
    const arrows = document.querySelectorAll('.arrow');
    arrows.forEach(arrow => {
        arrow.classList.remove('active');
    });
}

// Reset search highlights
function resetSearchHighlights() {
    const highlighted = document.querySelectorAll('.highlight');
    highlighted.forEach(el => {
        const parent = el.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
        }
    });
}

// Highlight matching text
function highlightText(element, searchText) {
    const text = element.textContent;
    const regex = new RegExp(`(${searchText})`, 'gi');
    const newText = text.replace(regex, '<span class="highlight">$1</span>');
    element.innerHTML = newText;
}
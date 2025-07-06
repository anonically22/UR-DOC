// UR DOC - Main JavaScript File
// Handles form submissions, navigation, and interactive features

// Global variables
let currentUser = null;
let currentRole = 'patient';

// Check if API service is loaded
if (typeof api === 'undefined') {
    console.error('API service not loaded. Make sure api.js is included before script.js');
}

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
async function initializeApp() {
    // Initialize the JSON data service
    await api.initialize();
    
    setupFormHandlers();
    setupNavigation();
    setupInteractiveElements();
    loadUserData();
}

// Setup form handlers
function setupFormHandlers() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }

    // Dashboard forms
    const consultationForm = document.getElementById('consultationForm');
    if (consultationForm) {
        consultationForm.addEventListener('submit', handleConsultationRequest);
    }

    const prescriptionForm = document.getElementById('prescriptionForm');
    if (prescriptionForm) {
        prescriptionForm.addEventListener('submit', handlePrescriptionUpload);
    }

    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    // Admin forms
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUser);
    }

    const addDoctorForm = document.getElementById('addDoctorForm');
    if (addDoctorForm) {
        addDoctorForm.addEventListener('submit', handleAddDoctor);
    }
}

// Setup navigation
function setupNavigation() {
    // Role selector functionality
    const roleBtns = document.querySelectorAll('.role-btn');
    roleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            roleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentRole = this.dataset.role;
            
            // Show/hide role-specific fields
            const doctorFields = document.getElementById('doctorFields');
            if (doctorFields) {
                if (currentRole === 'doctor') {
                    doctorFields.classList.add('show');
                } else {
                    doctorFields.classList.remove('show');
                }
            }
        });
    });

    // Dashboard navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            const sections = document.querySelectorAll('.section');
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// Setup interactive elements
function setupInteractiveElements() {
    // Password confirmation validation
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword) {
        confirmPassword.addEventListener('input', validatePasswordMatch);
    }

    // File upload preview
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.addEventListener('change', handleFileUpload);
    });

    // Search functionality
    const searchInputs = document.querySelectorAll('input[placeholder*="Search"]');
    searchInputs.forEach(input => {
        input.addEventListener('input', handleSearch);
    });

    // Modal functionality
    setupModals();
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validation
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    if (!password || password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }

    // Show loading state
    showNotification('Logging in...', 'info');
    const loginBtn = document.querySelector('#loginForm button[type="submit"]');
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
    }
    
    try {
        // Call API
        const response = await api.login({ email, password });
        
        if (response.success) {
            // Store user data
            currentUser = response.data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showNotification('Login successful!', 'success');
            
            // Redirect based on role
            setTimeout(() => {
                if (currentUser.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = `dashboard.html?role=${currentUser.role}`;
                }
            }, 1000);
        } else {
            showNotification(response.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message || 'Login failed. Please try again.', 'error');
    } finally {
        // Reset button state
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Sign In';
        }
    }
}

// Handle registration
async function handleRegistration(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const phone = document.getElementById('phone').value;
    const specialization = document.getElementById('specialization')?.value || null;

    // Validation
    if (!name || name.trim().length < 2) {
        showNotification('Please enter a valid name', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    if (!password || password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    // Show loading state
    showNotification('Creating account...', 'info');
    const registerBtn = document.querySelector('#registerForm button[type="submit"]');
    if (registerBtn) {
        registerBtn.disabled = true;
        registerBtn.textContent = 'Creating Account...';
    }
    
    try {
        // Call API
        const response = await api.register({
            name: name.trim(),
            email: email.toLowerCase(),
            password,
            role: currentRole,
            phone: phone || null,
            specialization: specialization || null
        });
        
        if (response.success) {
            // Store user data
            currentUser = response.data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showNotification('Account created successfully!', 'success');
            
            // Redirect based on role
            setTimeout(() => {
                if (currentUser.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = `dashboard.html?role=${currentUser.role}`;
                }
            }, 1000);
        } else {
            showNotification(response.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
        // Reset button state
        if (registerBtn) {
            registerBtn.disabled = false;
            registerBtn.textContent = 'Create Account';
        }
    }
}

// Handle consultation request
async function handleConsultationRequest(e) {
    e.preventDefault();
    
    const type = document.getElementById('consultationType').value;
    const urgency = document.getElementById('urgency').value;
    const description = document.getElementById('description').value;
    const preferredDate = document.getElementById('preferredDate').value;

    if (!description || description.trim().length < 10) {
        showNotification('Please provide a detailed description (at least 10 characters)', 'error');
        return;
    }

    try {
        const response = await api.createConsultation({
            type,
            urgency,
            description: description.trim(),
            preferred_date: preferredDate || new Date().toISOString()
        });

        if (response.success) {
            showNotification('Consultation request submitted successfully!', 'success');
            document.getElementById('consultationForm').reset();
        } else {
            showNotification(response.message || 'Failed to submit consultation request', 'error');
        }
    } catch (error) {
        console.error('Consultation error:', error);
        showNotification(error.message || 'Failed to submit consultation request', 'error');
    }
}

// Handle prescription upload
async function handlePrescriptionUpload(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('prescriptionFile');
    const file = fileInput.files[0];

    if (!file) {
        showNotification('Please select a file to upload', 'error');
        return;
    }

    // For demo purposes, we'll just show a success message
    // In a real app, this would upload to a server
    showNotification('Prescription uploaded successfully!', 'success');
    fileInput.value = '';
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const name = document.getElementById('profileName').value;
    const phone = document.getElementById('profilePhone').value;
    const specialization = document.getElementById('profileSpecialization')?.value || null;

    try {
        const response = await api.updateProfile({
            name: name.trim(),
            phone: phone || null,
            specialization: specialization || null
        });

        if (response.success) {
            showNotification('Profile updated successfully!', 'success');
            // Update current user data
            currentUser = response.data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            showNotification(response.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showNotification(error.message || 'Failed to update profile', 'error');
    }
}

// Handle add user (admin)
async function handleAddUser(e) {
    e.preventDefault();
    showNotification('User management functionality would be implemented here', 'info');
}

// Handle add doctor (admin)
async function handleAddDoctor(e) {
    e.preventDefault();
    showNotification('Doctor management functionality would be implemented here', 'info');
}

// Validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmPasswordField = document.getElementById('confirmPassword');
    
    if (confirmPassword && password !== confirmPassword) {
        confirmPasswordField.style.borderColor = '#dc3545';
        return false;
    } else {
        confirmPasswordField.style.borderColor = '#28a745';
        return true;
    }
}

// File upload handler
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        // Show file name or preview
        const fileName = file.name;
        showNotification(`File selected: ${fileName}`, 'info');
    }
}

// Search handler
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    // Implement search functionality based on context
    console.log('Searching for:', searchTerm);
}

// Modal functionality
function setupModals() {
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Close modal with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            });
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Dashboard functions
function cancelConsultation(id) {
    if (confirm('Are you sure you want to cancel this consultation?')) {
        showNotification('Consultation cancelled successfully', 'success');
        // In a real app, this would call an API to cancel the consultation
    }
}

function viewPrescription(id) {
    showNotification('Opening prescription...', 'info');
    // In a real app, this would open the prescription file
}

function downloadPrescription(id) {
    showNotification('Downloading prescription...', 'info');
    // In a real app, this would trigger a download
}

function acceptRequest(id) {
    if (confirm('Are you sure you want to accept this consultation request?')) {
        showNotification('Consultation request accepted', 'success');
        // In a real app, this would call an API to accept the request
    }
}

function rejectRequest(id) {
    if (confirm('Are you sure you want to reject this consultation request?')) {
        showNotification('Consultation request rejected', 'success');
        // In a real app, this would call an API to reject the request
    }
}

function viewRequest(id) {
    showNotification('Opening consultation details...', 'info');
    // In a real app, this would open detailed view
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        border-radius: 5px;
        padding: 15px;
        z-index: 1000;
        max-width: 400px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.3s ease-out;
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Utility functions
function getRandomName() {
    const names = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Tom', 'Emma'];
    return names[Math.floor(Math.random() * names.length)];
}

// Load user data
function loadUserData() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('Loaded user data:', currentUser);
        } catch (error) {
            console.error('Error loading user data:', error);
            localStorage.removeItem('currentUser');
        }
    }
}

// Logout function
function logout() {
    api.logout();
    localStorage.removeItem('currentUser');
    currentUser = null;
    window.location.href = 'index.html';
}

// Export functions for use in HTML
window.handleLogin = handleLogin;
window.handleRegistration = handleRegistration;
window.handleConsultationRequest = handleConsultationRequest;
window.handlePrescriptionUpload = handlePrescriptionUpload;
window.handleProfileUpdate = handleProfileUpdate;
window.handleAddUser = handleAddUser;
window.handleAddDoctor = handleAddDoctor;
window.cancelConsultation = cancelConsultation;
window.viewPrescription = viewPrescription;
window.downloadPrescription = downloadPrescription;
window.acceptRequest = acceptRequest;
window.rejectRequest = rejectRequest;
window.viewRequest = viewRequest;
window.openModal = openModal;
window.closeModal = closeModal;
window.logout = logout;
window.forgotPassword = function() {
    showNotification('Password reset functionality would be implemented here.', 'info');
}; 
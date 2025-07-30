// Signup form validation
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('#new-event-form');
    const firstName = document.querySelector('#firstName');
    const lastName = document.querySelector('#lastName');
    const email = document.querySelector('#email');
    const password = document.querySelector('#password');
    const confirmPassword = document.querySelector('#confirmPassword');
    
    // Real-time validation
    firstName.addEventListener('blur', validateFirstName);
    lastName.addEventListener('blur', validateLastName);
    email.addEventListener('blur', validateEmail);
    password.addEventListener('blur', validatePassword);
    confirmPassword.addEventListener('blur', validateConfirmPassword);
    
    form.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
        }
    });
    
    function validateFirstName() {
        const value = firstName.value.trim();
        const errorDiv = document.querySelector('#firstName-error');
        
        if (value.length < 2) {
            showError(errorDiv, 'First name must be at least 2 characters long');
            return false;
        } else if (value.length > 50) {
            showError(errorDiv, 'First name cannot exceed 50 characters');
            return false;
        } else {
            showSuccess(errorDiv);
            return true;
        }
    }
    
    function validateLastName() {
        const value = lastName.value.trim();
        const errorDiv = document.querySelector('#lastName-error');
        
        if (value.length < 2) {
            showError(errorDiv, 'Last name must be at least 2 characters long');
            return false;
        } else if (value.length > 50) {
            showError(errorDiv, 'Last name cannot exceed 50 characters');
            return false;
        } else {
            showSuccess(errorDiv);
            return true;
        }
    }
    
    function validateEmail() {
        const value = email.value.trim();
        const errorDiv = document.querySelector('#email-error');
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        
        if (!emailRegex.test(value)) {
            showError(errorDiv, 'Please enter a valid email address');
            return false;
        } else {
            showSuccess(errorDiv);
            return true;
        }
    }
    
    function validatePassword() {
        const value = password.value;
        const errorDiv = document.querySelector('#password-error');
        
        if (value.length < 6) {
            showError(errorDiv, 'Password must be at least 6 characters long');
            return false;
        } else {
            showSuccess(errorDiv);
            return true;
        }
    }
    
    function validateConfirmPassword() {
        const value = confirmPassword.value;
        const passwordValue = password.value;
        const errorDiv = document.querySelector('#confirmPassword-error');
        
        if (value !== passwordValue) {
            showError(errorDiv, 'Passwords do not match');
            return false;
        } else {
            showSuccess(errorDiv);
            return true;
        }
    }
    
    function validateForm() {
        return validateFirstName() && 
               validateLastName() && 
               validateEmail() && 
               validatePassword() && 
               validateConfirmPassword();
    }
    
    function showError(element, message) {
        element.textContent = message;
        element.className = 'validation-message error';
    }
    
    function showSuccess(element) {
        element.textContent = '';
        element.className = 'validation-message';
    }
});
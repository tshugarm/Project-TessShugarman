// Signup form validation
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('#new-event-form');
    const firstName = document.querySelector('#firstName');
    const lastName = document.querySelector('#lastName');
    const email = document.querySelector('#email');
    const password = document.querySelector('#password');
    const confirmPassword = document.querySelector('#confirmPassword');
    
    // Real-time validation
    if (firstName) firstName.addEventListener('blur', validateFirstName);
    if (lastName) lastName.addEventListener('blur', validateLastName);
    if (email) email.addEventListener('blur', validateEmail);
    if (password) password.addEventListener('blur', validatePassword);
    if (confirmPassword) confirmPassword.addEventListener('blur', validateConfirmPassword);
    
    if (form) {
        form.addEventListener('submit', function(e) {
            if (!validateForm()) {
                e.preventDefault();
            }
        });
    }
    
    function validateFirstName() {
        const value = firstName.value.trim();
        const errorDiv = document.querySelector('#firstName-error');
        
        if (value.length < 2) {
            showError(errorDiv, 'First name must be at least 2 characters long');
            return false;
        } else if (value.length > 50) {
            showError(errorDiv, 'First name cannot exceed 50 characters');
            return false;
        } else if (!/^[A-Za-z\s]+$/.test(value)) {
            showError(errorDiv, 'First name can only contain letters');
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
        } else if (!/^[A-Za-z\s]+$/.test(value)) {
            showError(errorDiv, 'Last name can only contain letters');
            return false;
        } else {
            showSuccess(errorDiv);
            return true;
        }
    }
    
    function validateEmail() {
        const value = email.value.trim();
        const errorDiv = document.querySelector('#email-error');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
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
        
        if (value.length < 8) {
            showError(errorDiv, 'Password must be at least 8 characters long');
            return false;
        } else if (value.length > 64) {
            showError(errorDiv, 'Password cannot exceed 64 characters');
            return false;
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            showError(errorDiv, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');
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
        const validations = [];
        
        if (firstName) validations.push(validateFirstName());
        if (lastName) validations.push(validateLastName());
        if (email) validations.push(validateEmail());
        if (password) validations.push(validatePassword());
        if (confirmPassword) validations.push(validateConfirmPassword());
        
        return validations.every(result => result === true);
    }
    
    function showError(element, message) {
        if (element) {
            element.textContent = message;
            element.className = 'validation-message error';
        }
    }
    
    function showSuccess(element) {
        if (element) {
            element.textContent = '';
            element.className = 'validation-message';
        }
    }
});

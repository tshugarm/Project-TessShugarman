// Login form validation
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('#new-event-form');
    const email = document.querySelector('#email');
    const password = document.querySelector('#password');
    
    // Real-time validation
    email.addEventListener('blur', validateEmail);
    password.addEventListener('blur', validatePassword);
    
    form.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
        }
    });
    
    function validateEmail() {
        const value = email.value.trim();
        const errorDiv = document.querySelector('#email-error');
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        
        if (!value) {
            showError(errorDiv, 'Email is required');
            return false;
        } else if (!emailRegex.test(value)) {
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
        
        if (!value) {
            showError(errorDiv, 'Password is required');
            return false;
        } else {
            showSuccess(errorDiv);
            return true;
        }
    }
    
    function validateForm() {
        return validateEmail() && validatePassword();
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
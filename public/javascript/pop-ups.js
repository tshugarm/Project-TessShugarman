// Auto-hide flash messages after 5 seconds
setTimeout(function() {
    const flashMessages = document.querySelectorAll('.flash-messages .alert');
    flashMessages.forEach(function(message) {
        message.style.opacity = '0';
        setTimeout(function() {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 300);
    });
}, 5000);

// Function to manually close flash messages
function closeFlash(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.opacity = '0';
        setTimeout(function() {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);
    }
}
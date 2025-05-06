// Utility function to show loading spinner
function showLoading(element) {
    element.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
    element.disabled = true;
}

// Utility function to hide loading spinner
function hideLoading(element, originalText) {
    element.innerHTML = originalText;
    element.disabled = false;
}

// Utility function to show alert
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.container').firstChild);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Handle challenge submission
document.addEventListener('DOMContentLoaded', () => {
    const submitForm = document.getElementById('submitFlagForm');
    if (submitForm) {
        submitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = submitForm.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            const flag = submitForm.querySelector('input[name="flag"]').value;
            const challengeId = submitForm.dataset.challengeId;

            try {
                showLoading(submitButton);
                const response = await fetch('/submissions/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ flag, challengeId }),
                });

                const data = await response.json();
                if (response.ok) {
                    showAlert(data.message, 'success');
                    if (data.correct) {
                        // Update UI to show solved status
                        const challengeCard = document.querySelector(`[data-challenge-id="${challengeId}"]`);
                        if (challengeCard) {
                            challengeCard.classList.add('solved');
                        }
                    }
                } else {
                    showAlert(data.error, 'danger');
                }
            } catch (error) {
                showAlert('An error occurred. Please try again.', 'danger');
            } finally {
                hideLoading(submitButton, originalText);
            }
        });
    }

    // Handle challenge card clicks
    const challengeCards = document.querySelectorAll('.challenge-card');
    challengeCards.forEach(card => {
        card.addEventListener('click', () => {
            const challengeId = card.dataset.challengeId;
            window.location.href = `/challenges/${challengeId}`;
        });
    });

    // Handle hint requests
    const hintButtons = document.querySelectorAll('.hint-button');
    hintButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const hintId = button.dataset.hintId;
            const challengeId = button.dataset.challengeId;
            const originalText = button.innerHTML;

            try {
                showLoading(button);
                const response = await fetch(`/challenges/${challengeId}/hints/${hintId}`, {
                    method: 'GET',
                });

                const data = await response.json();
                if (response.ok) {
                    const hintContent = document.querySelector(`#hint-${hintId}`);
                    if (hintContent) {
                        hintContent.textContent = data.hint;
                        button.disabled = true;
                        button.innerHTML = '<i class="bi bi-eye"></i> Hint Revealed';
                    }
                } else {
                    showAlert(data.error, 'danger');
                }
            } catch (error) {
                showAlert('An error occurred. Please try again.', 'danger');
            } finally {
                hideLoading(button, originalText);
            }
        });
    });
}); 
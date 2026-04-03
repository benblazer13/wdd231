import attractions from '../data/attractions.mjs';

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
    renderAttractions();
    handleVisitorTracking();
    initializeFooter();
});

// Render attractions cards
function renderAttractions() {
    const container = document.getElementById('attractionsContainer');

    const cardsHTML = attractions.map((attraction, index) => `
    <article class="attraction-card" style="--card-index: ${index + 1};">
      <h2 class="card-title">${attraction.name}</h2>
      <figure class="card-figure">
        <img 
          src="images/attractions/attraction-${index + 1}.webp" 
          alt="${attraction.name}" 
          width="300" 
          height="200"
          loading="lazy"
        />
      </figure>
      <address class="card-address">${attraction.address}</address>
      <p class="card-description">${attraction.description}</p>
      <button class="card-button" aria-label="Learn more about ${attraction.name}">Learn More</button>
    </article>
  `).join('');

    container.innerHTML = cardsHTML;

    // Add event listeners to buttons
    container.querySelectorAll('.card-button').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.attraction-card');
            const title = card.querySelector('.card-title').textContent;
            alert(`Learn more about ${title} - Additional information would be displayed here.`);
        });
    });
}

// Handle visitor tracking with localStorage
function handleVisitorTracking() {
    const messageDiv = document.getElementById('visitMessage');
    const lastVisitKey = 'lastVisitDate';
    const currentDate = Date.now();
    const lastVisit = localStorage.getItem(lastVisitKey);

    let message = '';

    if (!lastVisit) {
        // First visit
        message = 'Welcome! Let us know if you have any questions.';
    } else {
        const lastVisitDate = parseInt(lastVisit);
        const timeDifference = currentDate - lastVisitDate;
        const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        if (daysDifference < 1) {
            // Less than a day
            message = 'Back so soon! Awesome!';
        } else {
            // More than a day
            const dayWord = daysDifference === 1 ? 'day' : 'days';
            message = `You last visited ${daysDifference} ${dayWord} ago.`;
        }
    }

    // Display message
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';

    // Add close button functionality
    const closeBtn = document.createElement('button');
    closeBtn.className = 'message-close';
    closeBtn.setAttribute('aria-label', 'Close visitor message');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
        messageDiv.style.display = 'none';
    });
    messageDiv.appendChild(closeBtn);

    // Update last visit date
    localStorage.setItem(lastVisitKey, currentDate.toString());
}

// Initialize footer with current year and last modified date
function initializeFooter() {
    document.getElementById('copyright-year').textContent = new Date().getFullYear();
    document.getElementById('last-modified').textContent = document.lastModified;
}

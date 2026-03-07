const courses = [
    { subject: 'CSE', number: 110, title: 'Introduction to Programming', credits: 2, completed: true },
    { subject: 'WDD', number: 130, title: 'Web Fundamentals', credits: 2, completed: true },
    { subject: 'CSE', number: 111, title: 'Programming with Functions', credits: 2, completed: true },
    { subject: 'CSE', number: 210, title: 'Programming with Classes', credits: 2, completed: false },
    { subject: 'WDD', number: 131, title: 'Dynamic Web Fundamentals', credits: 2, completed: true },
    { subject: 'WDD', number: 231, title: 'Frontend Web Development I', credits: 2, completed: false },
];

let currentFilter = 'all';

function getFiltered() {
    if (currentFilter === 'WDD') return courses.filter(c => c.subject === 'WDD');
    if (currentFilter === 'CSE') return courses.filter(c => c.subject === 'CSE');
    return courses;
}

function renderCourses() {
    const filtered = getFiltered();
    const container = document.getElementById('course-cards');
    const creditSpan = document.getElementById('total-credits');

    if (!container) return;

    container.innerHTML = filtered.map(c => `
    <div class="course-card ${c.completed ? 'completed' : ''}">
      ${c.subject} ${c.number}
    </div>
  `).join('');

    if (creditSpan) {
        creditSpan.textContent = filtered.reduce((sum, c) => sum + c.credits, 0);
    }
}

// Filter button listeners
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderCourses();
    });
});

renderCourses();
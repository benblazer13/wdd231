const courses = [
    {
        subject: 'CSE',
        number: 110,
        title: 'Introduction to Programming',
        credits: 2,
        completed: true,
        certificate: 'Web and Computer Programming',
        description: 'This course will introduce students to programming. It will introduce the building blocks of programming languages (variables, decisions, calculations, loops, array, and input/output) and use them to solve problems.',
        technology: ['Python']
    },
    {
        subject: 'WDD',
        number: 130,
        title: 'Web Fundamentals',
        credits: 2,
        completed: true,
        certificate: 'Web and Computer Programming',
        description: 'This course introduces students to the World Wide Web and to careers in web site design and development. The course is hand-on with students actually participating in simple web designs and programming.',
        technology: ['HTML', 'CSS']
    },
    {
        subject: 'CSE',
        number: 111,
        title: 'Programming with Functions',
        credits: 2,
        completed: true,
        certificate: 'Web and Computer Programming',
        description: 'CSE 111 students become more organized and efficient by learning to research and call functions written by others; to write, call, debug, and test their own functions; and to handle errors within functions.',
        technology: ['Python']
    },
    {
        subject: 'CSE',
        number: 210,
        title: 'Programming with Classes',
        credits: 2,
        completed: false,
        certificate: 'Web and Computer Programming',
        description: 'This course will introduce the notion of the class as a way to create complex data types to organize, store, and manipulate data.',
        technology: ['C#']
    },
    {
        subject: 'WDD',
        number: 131,
        title: 'Dynamic Web Fundamentals',
        credits: 2,
        completed: true,
        certificate: 'Web and Computer Programming',
        description: 'This course builds on prior experience in Web Fundamentals and programming. Students will learn to create dynamic websites that use JavaScript to respond to events, update content, and create responsive user experiences.',
        technology: ['HTML', 'CSS', 'JavaScript']
    },
    {
        subject: 'WDD',
        number: 231,
        title: 'Frontend Web Development I',
        credits: 2,
        completed: false,
        certificate: 'Web and Computer Programming',
        description: 'This course builds on prior experience with Dynamic Web Fundamentals and programming. Students will focus on user experience, accessibility, compliance, performance optimization, and basic API usage.',
        technology: ['HTML', 'CSS', 'JavaScript']
    },
];

// --- References ---
const courseDetails = document.getElementById('course-details');
let currentFilter = 'all';

// --- Filter Logic ---
function getFiltered() {
    if (currentFilter === 'WDD') return courses.filter(c => c.subject === 'WDD');
    if (currentFilter === 'CSE') return courses.filter(c => c.subject === 'CSE');
    return courses;
}

// --- Render Course Cards ---
function renderCourses() {
    const filtered = getFiltered();
    const container = document.getElementById('course-cards');
    const creditSpan = document.getElementById('total-credits');

    if (!container) return;

    container.innerHTML = '';

    filtered.forEach(course => {
        const courseDiv = document.createElement('div');
        courseDiv.classList.add('course-card');
        if (course.completed) courseDiv.classList.add('completed');
        courseDiv.textContent = `${course.subject} ${course.number}`;

        courseDiv.addEventListener('click', () => {
            displayCourseDetails(course);
        });

        container.appendChild(courseDiv);
    });

    if (creditSpan) {
        creditSpan.textContent = filtered.reduce((sum, c) => sum + c.credits, 0);
    }
}

// --- Display Modal ---
function displayCourseDetails(course) {
    courseDetails.innerHTML = `
        <button id="closeModal">❌</button>
        <h2>${course.subject} ${course.number}</h2>
        <h3>${course.title}</h3>
        <p><strong>Credits</strong>: ${course.credits}</p>
        <p><strong>Certificate</strong>: ${course.certificate}</p>
        <p>${course.description}</p>
        <p><strong>Technologies</strong>: ${course.technology.join(', ')}</p>
    `;

    courseDetails.showModal();

    // Close via ❌ button
    document.getElementById('closeModal').addEventListener('click', () => {
        courseDetails.close();
    });

    // Close when clicking outside the dialog (on the backdrop)
    courseDetails.addEventListener('click', (e) => {
        const rect = courseDetails.getBoundingClientRect();
        const clickedOutside =
            e.clientX < rect.left || e.clientX > rect.right ||
            e.clientY < rect.top || e.clientY > rect.bottom;
        if (clickedOutside) courseDetails.close();
    }, { once: true });
}

// --- Filter Button Listeners ---
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderCourses();
    });
});

renderCourses();
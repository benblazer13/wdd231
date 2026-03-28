function formatText(value) {
    return value ? value : 'Not provided';
}

function safeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.textContent;
}

const params = new URLSearchParams(window.location.search);
const summaryList = document.getElementById('summaryList');

if (summaryList) {
    const requiredValues = {
        'First name': params.get('firstName'),
        'Last name': params.get('lastName'),
        'Email': params.get('email'),
        'Mobile number': params.get('phone'),
        'Business name': params.get('businessName'),
        'Submitted at': params.get('timestamp'),
    };

    Object.entries(requiredValues).forEach(([label, value]) => {
        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');
        dd.textContent = safeHtml(formatText(value));
        summaryList.append(dt, dd);
    });

    if (!params.has('firstName') || !params.has('lastName')) {
        const warning = document.createElement('p');
        warning.className = 'emphasis';
        warning.textContent = 'It looks like you arrived here directly or with incomplete form data. Please return to the join form to submit properly.';
        summaryList.parentElement?.prepend(warning);
    }
}

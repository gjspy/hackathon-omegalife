const STORAGE_KEY = 'meadow-house-repairs';

const form = document.getElementById('repair-form');
const descriptionInput = document.getElementById('description');
const reporterInput = document.getElementById('reporter');
const priorityInput = document.getElementById('priority');
const formMessage = document.getElementById('form-message');
const formSuccessMessage = document.getElementById('form-success-message');
const jobsList = document.getElementById('jobs-list');
const statusFilter = document.getElementById('status-filter');
const priorityFilter = document.getElementById('priority-filter');
const sortJobs = document.getElementById('sort-jobs');

let jobs = loadJobs();

function setFormMessage(message, tone = 'success') {
  formMessage.textContent = message;
  formMessage.dataset.tone = tone;
}

function setFormSuccessMessage(message) {
  formSuccessMessage.textContent = message;
}

function clearFormSuccessMessage() {
  formSuccessMessage.textContent = '';
}

function clearFieldError(fieldName) {
  const element = document.getElementById(`${fieldName}-error`);
  if (!element) return;
  element.textContent = '';
}

function setFieldError(fieldName, message) {
  const input = document.getElementById(fieldName);
  const error = document.getElementById(`${fieldName}-error`);

  if (input) {
    input.setAttribute('aria-invalid', 'true');
  }

  if (error) {
    error.textContent = message;
  }
}

function clearAllFieldErrors() {
  clearFieldError('description');
  clearFieldError('reporter');

  descriptionInput.removeAttribute('aria-invalid');
  reporterInput.removeAttribute('aria-invalid');
}

function setFieldValueFromInput(input, value) {
  if (!input) return;
  input.value = value;
}

function generateJobId() {
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `MH-${timestamp}-${suffix}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function saveJobs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

function loadJobs() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (!storedValue) return [];

    const parsed = JSON.parse(storedValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Unable to load jobs from local storage.', error);
    return [];
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getFilteredJobs() {
  const statusValue = statusFilter.value;
  const priorityValue = priorityFilter.value;
  const sortValue = sortJobs.value;

  let filtered = [...jobs];

  if (statusValue !== 'All') {
    filtered = filtered.filter((job) => job.status === statusValue);
  }

  if (priorityValue !== 'All') {
    filtered = filtered.filter((job) => job.priority === priorityValue);
  }

  filtered.sort((a, b) => {
    const dateA = new Date(a.history?.[0]?.at || a.date || 0).getTime();
    const dateB = new Date(b.history?.[0]?.at || b.date || 0).getTime();

    switch (sortValue) {
      case 'oldest':
        return dateA - dateB;
      case 'urgent':
        return (b.priority === 'Urgent' ? 1 : 0) - (a.priority === 'Urgent' ? 1 : 0) || dateB - dateA;
      case 'status':
        return a.status.localeCompare(b.status) || dateB - dateA;
      case 'newest':
      default:
        return dateB - dateA;
    }
  });

  return filtered;
}

function renderJobs() {
  const visibleJobs = getFilteredJobs();
  jobsList.innerHTML = '';

  if (!visibleJobs.length) {
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No repair jobs match the selected filters.';
    jobsList.appendChild(emptyState);
    return;
  }

  visibleJobs.forEach((job) => {
    const card = document.createElement('article');
    card.className = 'job-card';

    if (job.isNew) {
      card.classList.add('is-new');
    }

    const header = document.createElement('div');
    header.className = 'job-header';

    const titleWrap = document.createElement('div');
    titleWrap.style.display = 'flex';
    titleWrap.style.alignItems = 'center';
    titleWrap.style.gap = '8px';

    const title = document.createElement('h3');
    title.textContent = `Job ${job.id}`;

    const newBadge = document.createElement('span');
    newBadge.className = 'new-badge';
    newBadge.textContent = 'New';
    newBadge.hidden = !job.isNew;

    titleWrap.appendChild(title);
    titleWrap.appendChild(newBadge);

    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge status-${job.status.toLowerCase().replace(/\s+/g, '-')}`;
    statusBadge.textContent = job.status;

    header.appendChild(titleWrap);
    header.appendChild(statusBadge);

    const meta = document.createElement('div');
    meta.className = 'job-meta';

    const dateItem = document.createElement('span');
    dateItem.textContent = `Date: ${job.date}`;
    const houseItem = document.createElement('span');
    houseItem.textContent = `House: ${job.houseName}`;

    meta.appendChild(dateItem);
    meta.appendChild(houseItem);

    const summary = document.createElement('div');
    summary.className = 'job-summary';

    const descriptionLine = document.createElement('div');
    descriptionLine.className = 'field-value';
    const descriptionLabel = document.createElement('strong');
    descriptionLabel.textContent = 'Description:';
    const descriptionValue = document.createElement('span');
    descriptionValue.textContent = job.description;
    descriptionLine.appendChild(descriptionLabel);
    descriptionLine.appendChild(descriptionValue);

    const reporterLine = document.createElement('div');
    reporterLine.className = 'field-value';
    const reporterLabel = document.createElement('strong');
    reporterLabel.textContent = 'Reporter:';
    const reporterValue = document.createElement('span');
    reporterValue.textContent = job.reporter;
    reporterLine.appendChild(reporterLabel);
    reporterLine.appendChild(reporterValue);

    const priorityLine = document.createElement('div');
    priorityLine.className = 'field-value';
    const priorityLabel = document.createElement('strong');
    priorityLabel.textContent = 'Priority:';
    const priorityValue = document.createElement('span');
    priorityValue.textContent = job.priority;
    priorityLine.appendChild(priorityLabel);
    priorityLine.appendChild(priorityValue);

    summary.appendChild(descriptionLine);
    summary.appendChild(reporterLine);
    summary.appendChild(priorityLine);

    const latestNote = job.notes?.progress || job.notes?.completion || 'No note recorded yet.';
    const latestNoteBox = document.createElement('div');
    latestNoteBox.className = 'latest-note';
    latestNoteBox.innerHTML = `<strong>Latest note:</strong> ${escapeHtml(latestNote)}`;

    const updates = document.createElement('div');
    updates.className = 'job-updates';

	const progressGroup = document.createElement('div');
	progressGroup.className = 'update-row';

	const progressLabel = document.createElement('label');
	progressLabel.setAttribute('for', `progress-${job.id}`);
	progressLabel.textContent = 'Progress note';

	const progressInput = document.createElement('input');
	progressInput.id = `progress-${job.id}`;
	progressInput.type = 'text';
	progressInput.className = 'progress-note';
	progressInput.value = job.notes?.progress || '';
	progressInput.placeholder = 'Enter progress update';
	progressInput.setAttribute('aria-label', `Progress note for job ${job.id}`);

	const progressActions = document.createElement('div');
	progressActions.className = 'update-actions';

	const progressButton = document.createElement('button');
	progressButton.type = 'button';
	progressButton.className = 'secondary-button';
	progressButton.textContent = 'Move to In Progress';
	progressButton.dataset.jobId = job.id;
	progressButton.dataset.action = 'progress';
	progressButton.setAttribute('aria-label', `Move job ${job.id} to In Progress`);

	progressActions.appendChild(progressButton);
	progressGroup.appendChild(progressLabel);
	progressGroup.appendChild(progressInput);
	progressGroup.appendChild(progressActions);

	const completionGroup = document.createElement('div');
	completionGroup.className = 'update-row';

	const completionLabel = document.createElement('label');
	completionLabel.setAttribute('for', `complete-${job.id}`);
	completionLabel.textContent = 'Completion note';

	const completionInput = document.createElement('input');
	completionInput.id = `complete-${job.id}`;
	completionInput.type = 'text';
	completionInput.className = 'completion-note';
	completionInput.value = job.notes?.completion || '';
	completionInput.placeholder = 'Enter completion note';
	completionInput.setAttribute('aria-label', `Completion note for job ${job.id}`);

	const completionActions = document.createElement('div');
	completionActions.className = 'update-actions';

	const completionButton = document.createElement('button');
	completionButton.type = 'button';
	completionButton.className = 'tertiary-button';
	completionButton.textContent = 'Mark Completed';
	completionButton.dataset.jobId = job.id;
	completionButton.dataset.action = 'complete';
	completionButton.setAttribute('aria-label', `Mark job ${job.id} as completed`);

	completionActions.appendChild(completionButton);
	completionGroup.appendChild(completionLabel);
	completionGroup.appendChild(completionInput);
	completionGroup.appendChild(completionActions);

	updates.appendChild(progressGroup);
	updates.appendChild(completionGroup);

	const resultMessage = document.createElement('p');
    resultMessage.className = 'job-message';
    resultMessage.textContent = '';

    const historyPanel = document.createElement('div');
    historyPanel.className = 'history-panel';

    const historyTitle = document.createElement('h4');
    historyTitle.textContent = 'History';

    const historyList = document.createElement('ul');
    historyList.className = 'history-list';

    const historyEntries = Array.isArray(job.history) ? job.history : [];
    if (historyEntries.length === 0) {
      const emptyHistoryItem = document.createElement('li');
      emptyHistoryItem.textContent = 'No history recorded yet.';
      historyList.appendChild(emptyHistoryItem);
    } else {
      historyEntries.forEach((entry) => {
        const item = document.createElement('li');
        const noteText = entry.note ? ` — ${entry.note}` : '';
        item.textContent = `${formatDateTime(entry.at)} • ${entry.status}${noteText}`;
        historyList.appendChild(item);
      });
    }

    historyPanel.appendChild(historyTitle);
    historyPanel.appendChild(historyList);

    updates.appendChild(progressGroup);
    updates.appendChild(resultMessage);

    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(summary);
    card.appendChild(latestNoteBox);
    card.appendChild(updates);
    card.appendChild(historyPanel);
    jobsList.appendChild(card);
  });
}

function triggerConfetti() {
  const layer = document.createElement('div');
  layer.className = 'confetti-layer';

  const colors = ['#1b6d6c', '#f7d179', '#b93f3f', '#0e8a6d', '#7e5be9', '#f59e0b'];

  for (let i = 0; i < 34; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--dx', `${(Math.random() - 0.5) * 260}px`);
    piece.style.setProperty('--rot', `${(Math.random() * 720 - 360).toFixed(2)}deg`);
    piece.style.animationDelay = `${(Math.random() * 0.15).toFixed(2)}s`;
    layer.appendChild(piece);
  }

  document.body.appendChild(layer);

  setTimeout(() => {
    layer.remove();
  }, 1800);
}

function getJobById(jobId) {
  return jobs.find((job) => job.id === jobId);
}

function showJobMessage(jobId, message, tone = 'success') {
  const card = [...jobsList.querySelectorAll('.job-card')].find((item) => item.querySelector('.secondary-button')?.dataset.jobId === jobId || item.querySelector('.tertiary-button')?.dataset.jobId === jobId);

  if (!card) return;

  const messageElement = card.querySelector('.job-message');
  if (!messageElement) return;

  messageElement.textContent = message;
  messageElement.classList.remove('success', 'error');
  messageElement.classList.add(tone);
}

function hasMeaningfulText(value) {
  return /[A-Za-z\u00C0-\u024F]/.test(value);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearAllFieldErrors();
  clearFormSuccessMessage();
  setFormMessage('', 'success');
  setFormSuccessMessage('The report was submitted successfully.');

  const description = descriptionInput.value.trim();
  const reporter = reporterInput.value.trim();
  const priority = priorityInput.value;

  if (!description) {
    setFieldError('description', 'Description is required. Enter a repair description before creating the job.');
    descriptionInput.focus();
    return;
  }

  if (!hasMeaningfulText(description)) {
    setFieldError('description', 'Description must include letters or words, not only numbers or special characters.');
    descriptionInput.focus();
    return;
  }

  if (!reporter) {
    setFieldError('reporter', 'Reporter is required. Please add the name of the person reporting the issue.');
    reporterInput.focus();
    return;
  }

  if (!hasMeaningfulText(reporter)) {
    setFieldError('reporter', 'Reporter name must include letters or words, not only numbers or special characters.');
    reporterInput.focus();
    return;
  }

  if (description.length > 3000) {
    setFieldError('description', 'Description must be 3000 characters or fewer.');
    descriptionInput.focus();
    return;
  }

  if (reporter.length > 200) {
    setFieldError('reporter', 'Reporter name must be 200 characters or fewer.');
    reporterInput.focus();
    return;
  }

  const timestamp = new Date();
  const newJob = {
    id: generateJobId(),
    houseName: 'Meadow House',
    date: formatDate(timestamp),
    description,
    reporter,
    priority,
    status: 'New',
    isNew: true,
    notes: {
      progress: '',
      completion: '',
    },
    history: [
      {
        at: timestamp.toISOString(),
        status: 'New',
        note: 'Repair reported',
      },
    ],
  };

  jobs.unshift(newJob);
  saveJobs();
  renderJobs();
  form.reset();
  priorityInput.value = 'Normal';
  triggerConfetti();
  descriptionInput.focus();
});

jobsList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const jobId = button.dataset.jobId;
  const action = button.dataset.action;
  const job = getJobById(jobId);

  if (!job) return;

  const card = button.closest('.job-card');
  const noteInput = card.querySelector(action === 'progress' ? '.progress-note' : '.completion-note');
  const note = (noteInput?.value ?? '').trim();

  if (action === 'progress') {
    if (!note) {
      showJobMessage(jobId, 'Progress note is required before moving this job to In Progress.', 'error');
      noteInput?.focus();
      return;
    }

    job.status = 'In Progress';
    job.isNew = false;
    job.notes.progress = note;
    job.history.push({
      at: new Date().toISOString(),
      status: 'In Progress',
      note,
    });
    saveJobs();
    renderJobs();
    showJobMessage(jobId, `Job ${job.id} moved to In Progress.`, 'success');
    return;
  }

  if (action === 'complete') {
    if (!note) {
      showJobMessage(jobId, 'Completion note is required before marking a repair as complete.', 'error');
      noteInput?.focus();
      return;
    }

    job.status = 'Completed';
    job.isNew = false;
    job.notes.completion = note;
    job.history.push({
      at: new Date().toISOString(),
      status: 'Completed',
      note,
    });
    saveJobs();
    renderJobs();
    showJobMessage(jobId, `Job ${job.id} marked Completed.`, 'success');
  }
});

document.querySelector('.hero-button')?.addEventListener('click', () => {
  const section = document.getElementById('jobs-heading');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

const clearSuccessOnInput = () => {
  clearFormSuccessMessage();
};

descriptionInput.addEventListener('input', clearSuccessOnInput);
reporterInput.addEventListener('input', clearSuccessOnInput);
statusFilter.addEventListener('change', renderJobs);
priorityFilter.addEventListener('change', renderJobs);
sortJobs.addEventListener('change', renderJobs);

renderJobs();

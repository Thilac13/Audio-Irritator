// Variables
const body = document.body;

const darkToggle = document.getElementById('darkToggle');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');

const timerTabBtn = document.querySelector('button.tab-button:nth-child(1)');  // timer tab button
const settingsTabBtn = document.querySelector('button.tab-button:nth-child(3)'); // settings tab button

const timerView = document.getElementById('timer-view');
const settingsView = document.getElementById('settings-view');

const closeSettingsBtn = document.getElementById('close-settings');

let isPlaying = false;

// Update play/pause icon based on play state and dark mode
function updatePlayPauseIcon() {
  const isDark = body.classList.contains('dark');

  if (isPlaying) {
    playIcon.src = isDark ? 'assets/icons/pause-dark.svg' : 'assets/icons/pause.svg';
    playIcon.alt = 'Pause Icon';
  } else {
    playIcon.src = isDark ? 'assets/icons/play-dark.svg' : 'assets/icons/play.svg';
    playIcon.alt = 'Play Icon';
  }
}

// Dark mode toggle handler
darkToggle.addEventListener('click', () => {
  body.classList.toggle('dark');
  updatePlayPauseIcon();
});

// Play/pause button handler
playPauseBtn.addEventListener('click', () => {
  isPlaying = !isPlaying;
  updatePlayPauseIcon();

  // TODO: Add timer start/pause logic here
});

// Timer tab button click: show timer, hide settings
timerTabBtn.addEventListener('click', () => {
  timerView.classList.add('active');
  timerView.classList.remove('hidden');
  settingsView.classList.remove('active');
  settingsView.classList.add('hidden');
});

// Settings tab button click: show settings, hide timer
settingsTabBtn.addEventListener('click', () => {
  settingsView.classList.add('active');
  settingsView.classList.remove('hidden');
  timerView.classList.remove('active');
  timerView.classList.add('hidden');
});

// Close settings button hides settings, shows timer
closeSettingsBtn.addEventListener('click', () => {
  settingsView.classList.remove('active');
  settingsView.classList.add('hidden');
  timerView.classList.add('active');
  timerView.classList.remove('hidden');
});

// Placeholder: add event listeners for stepper buttons and volume slider here
// Example: log the button pressed
document.querySelectorAll('.step-up').forEach(btn => {
  btn.addEventListener('click', () => {
    console.log('Step up clicked');
    // TODO: implement increment logic
  });
});

document.querySelectorAll('.step-down').forEach(btn => {
  btn.addEventListener('click', () => {
    console.log('Step down clicked');
    // TODO: implement decrement logic
  });
});

const volumeSlider = document.getElementById('volume-slider');
volumeSlider.addEventListener('input', (e) => {
  console.log('Volume set to', e.target.value);
  // TODO: implement volume control logic
});

// Initialize icon on page load
updatePlayPauseIcon();

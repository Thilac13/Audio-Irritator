// Variables
const body = document.body;

const darkToggle = document.getElementById('darkToggle');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');

const timerTabBtn = document.querySelector('button.tab-button:nth-child(1)');
const settingsTabBtn = document.querySelector('button.tab-button:nth-child(3)');


const timerView = document.getElementById('timer-view');
const settingsView = document.getElementById('settings-view');
const closeSettingsBtn = document.getElementById('close-settings');

const pickerOverlay = document.getElementById('time-picker-overlay');
const pickerTitle = document.getElementById('picker-title');
const pickerList = document.getElementById('picker-list');
const pickerDoneBtn = document.getElementById('picker-done');

const volumeSlider = document.getElementById('volume-slider');
const volumeLabel = document.getElementById('volume-label');

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}


let isPlaying = false;
let countdownInterval = null;
let remainingSeconds = 0;
let currentField = null;

// Default Settings
let maxInterval = 10000;  // ms
let maxDuration = 500;    // ms
let minPitch = 600;       // Hz
let maxPitch = 1800;      // Hz
let volume = 0.5;

let audioCtx = null;

function ensureAudioContext() {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}



// Update play/pause icon
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

// Dark mode toggle
darkToggle.addEventListener('click', () => {
  vibrate(30) 
  body.classList.toggle('dark');
  updatePlayPauseIcon();
});

//transition of tab view 

function switchView(showView, hideView) {
  hideView.classList.remove('active');
  // Wait for CSS transition duration before hiding fully
  setTimeout(() => {
    hideView.classList.add('hidden');
  }, 300); // match CSS transition duration (300ms)

  showView.classList.remove('hidden');
  // small delay to trigger transition properly
  setTimeout(() => {
    showView.classList.add('active');
  }, 10);
}

timerTabBtn.addEventListener('click', () => {
  vibrate(30)
  switchView(timerView, settingsView);
});

settingsTabBtn.addEventListener('click', () => {
  vibrate(30)
  switchView(settingsView, timerView);
});


// Close settings
closeSettingsBtn.addEventListener('click', () => {
  vibrate(30)
  switchView(timerView, settingsView);
});


// Volume Live Update
volumeSlider.addEventListener('input', (e) => {
  volume = parseInt(e.target.value) / 100;
  volumeLabel.textContent = `${e.target.value}%`;
});


// Stepper buttons (placeholder)
document.querySelectorAll('.step-up').forEach(btn => {
  btn.addEventListener('click', () => {
    vibrate(30)
    console.log('Step up clicked');
  });
});
document.querySelectorAll('.step-down').forEach(btn => {
  btn.addEventListener('click', () => {
    vibrate(30)
    console.log('Step down clicked');
  });
});

// Picker logic
function openTimePicker(fieldId, label, max = 59) {
  currentField = document.getElementById(fieldId);
  pickerTitle.textContent = `Select ${label}`;
  pickerList.innerHTML = '';
  for (let i = 0; i <= max; i++) {
    const item = document.createElement('div');
    item.textContent = i.toString().padStart(2, '0');
    item.addEventListener('click', () => {
      currentField.textContent = item.textContent;
      closeTimePicker();
    });
    pickerList.appendChild(item);
  }
  pickerOverlay.classList.remove('hidden');
}
function closeTimePicker() {
  pickerOverlay.classList.add('hidden');
}
document.getElementById('hours-input').addEventListener('click', () => {
  openTimePicker('hours-input', 'Hours', 23);
});
document.getElementById('minutes-input').addEventListener('click', () => {
  openTimePicker('minutes-input', 'Minutes', 59);
});
document.getElementById('seconds-input').addEventListener('click', () => {
  openTimePicker('seconds-input', 'Seconds', 59);
});
pickerDoneBtn.addEventListener('click', closeTimePicker);

// Auto-snap to nearest item (72px tall)
document.querySelector('.picker-scroll-wrapper').addEventListener('scroll', function () {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    const container = this;
    const scrollTop = container.scrollTop;
    const itemHeight = 72; // Adjusted
    const nearestIndex = Math.round(scrollTop / itemHeight);
    const targetScrollTop = nearestIndex * itemHeight;

    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  }, 100);
});

function snapToNearestItem() {
  const itemHeight = 72;
  const scrollTop = pickerList.scrollTop;
  const index = Math.round(scrollTop / itemHeight);
  const targetScroll = index * itemHeight;

  pickerList.scrollTo({
    top: targetScroll,
    behavior: 'smooth'
  });
}

let scrollTimeout;
pickerList.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(snapToNearestItem, 100);
});


// Beep sound
function playBeep() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1000, ctx.currentTime); // 1000 Hz beep
  gain.gain.setValueAtTime(0.8, ctx.currentTime);     // Low volume

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.3); // Short beep
}

function playRandomBeep(duration = 500) {
  try {
    ensureAudioContext();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    const pitch = Math.random() * (maxPitch - minPitch) + minPitch;
    const liveVolume = parseInt(volumeSlider.value) / 100;

    osc.type = 'square';
    osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    gain.gain.setValueAtTime(liveVolume, audioCtx.currentTime);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration / 1000);
  } catch (e) {
    console.warn("Beep error", e);
  }
}





let soundLoopActive = false;

function startSoundLoop() {
  soundLoopActive = true;

  const loop = () => {
    if (!isPlaying || !soundLoopActive || remainingSeconds <= 0) return;

    const duration = Math.random() * (maxDuration * 500) + (maxDuration * 500); // in ms
    playRandomBeep(duration); // pass duration to beep

    const interval = Math.random() * (maxInterval * 0.5) + (maxInterval * 0.5); // in ms
    const nextCycleDelay = interval + duration;

    setTimeout(loop, nextCycleDelay);
  };

  loop();
}


function stopSoundLoop() {
  soundLoopActive = false;
}


// Time utils
function getTimeInSeconds() {
  const h = parseInt(document.getElementById('hours-input').textContent) || 0;
  const m = parseInt(document.getElementById('minutes-input').textContent) || 0;
  const s = parseInt(document.getElementById('seconds-input').textContent) || 0;
  return h * 3600 + m * 60 + s;
}

function updateDisplay(secondsLeft) {
  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = secondsLeft % 60;
  document.getElementById('hours-input').textContent = h.toString().padStart(2, '0');
  document.getElementById('minutes-input').textContent = m.toString().padStart(2, '0');
  document.getElementById('seconds-input').textContent = s.toString().padStart(2, '0');
}

// Countdown
function startCountdown() {
  remainingSeconds = getTimeInSeconds();
  if (remainingSeconds <= 0) return;

  updateSoundSettingsFromUI();
  startSoundLoop();

  countdownInterval = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateDisplay(remainingSeconds);
    } else {
      clearInterval(countdownInterval);
      stopSoundLoop();
      isPlaying = false;
      updatePlayPauseIcon();
      console.log("Timer done");
    }
  }, 1000);
}

function pauseCountdown() {
  clearInterval(countdownInterval);
  stopSoundLoop();
}


// Play / Pause Toggle
playPauseBtn.addEventListener('click', () => {
  vibrate(30)
  isPlaying = !isPlaying;
  updatePlayPauseIcon();
  if (isPlaying) {
    startCountdown();
  } else {
    pauseCountdown();
  }
});


// Initial icon setup
updatePlayPauseIcon();

function updateSoundSettingsFromUI() {
  maxInterval = parseInt(document.getElementById('max-interval-value').textContent) * 1000; // to ms
  maxDuration = parseInt(document.getElementById('max-duration-value').textContent);
  maxPitch = parseInt(document.getElementById('max-pitch-value').textContent);
  minPitch = parseInt(document.getElementById('min-pitch-value').textContent);
}

console.log({ volume, maxInterval, maxDuration, minPitch, maxPitch });

// Stepper Controls
function setupStepper(id, min, max) {
  const container = document.getElementById(id);
  const down = container.querySelector('.step-down');
  const up = container.querySelector('.step-up');
  const value = container.querySelector('.step-value');

  down.addEventListener('click', () => {
    vibrate(30)
    let v = parseInt(value.textContent);
    if (v > min) v--;
    value.textContent = v;
  });

  up.addEventListener('click', () => {
    vibrate(30)
    let v = parseInt(value.textContent);
    if (v < max) v++;
    value.textContent = v;
  });
}

setupStepper('max-interval-group', 5, 120);   // in seconds
setupStepper('max-duration-group', 5, 20);    // in seconds
setupStepper('max-pitch-group', 800, 1800);   // Hz
setupStepper('min-pitch-group', 100, 800);    // Hz

const resetBtn = document.getElementById('reset-button');

resetBtn.addEventListener('click', () => {
  // Stop everything
  isPlaying = false;
  updatePlayPauseIcon();
  pauseCountdown();
  stopSoundLoop();

  // Reset time
  document.getElementById('hours-input').textContent = '00';
  document.getElementById('minutes-input').textContent = '00';
  document.getElementById('seconds-input').textContent = '00';

  // Animate bounce
['hours-input', 'minutes-input', 'seconds-input'].forEach(id => {
  const el = document.getElementById(id);
  el.classList.add('animate-reset');
  setTimeout(() => el.classList.remove('animate-reset'), 400);
});

  // Reset settings to default
  volumeSlider.value = 70;
  volumeLabel.textContent = '70%';
  volume = 0.7;

  document.querySelector('#max-interval-group .step-value').textContent = '15';
  document.querySelector('#max-duration-group .step-value').textContent = '5';

  document.querySelector('#max-pitch-group .step-value').textContent = '1500'; // Recommended
  document.querySelector('#min-pitch-group .step-value').textContent = '400';  // Recommended

  console.log("Timer and settings reset to default.");
});

//vibration 

function vibrate(pattern = 50) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

let stepperInterval = null;
let stepperDelay = 500; // initial delay
let stepperSpeed = 100; // repeated action interval

function startStepper(button, direction) {
  const valueSpan = button.parentElement.querySelector('.step-value');
  if (!valueSpan) return;

  const updateValue = () => {
    let value = parseInt(valueSpan.textContent, 10);
    if (direction === 'up') value++;
    else value = Math.max(0, value - 1); // prevent negative
    valueSpan.textContent = value;
  };

  // Run once immediately
  updateValue();

  // Then run repeatedly
  stepperInterval = setTimeout(function repeat() {
    updateValue();
    stepperInterval = setTimeout(repeat, stepperSpeed);
  }, stepperDelay);
}

function stopStepper() {
  clearTimeout(stepperInterval);
  stepperInterval = null;
}

// Attach to all step-up and step-down buttons
document.querySelectorAll('.step-up').forEach(button => {
  button.addEventListener('mousedown', () => startStepper(button, 'up'));
  button.addEventListener('touchstart', () => startStepper(button, 'up'));

  button.addEventListener('mouseup', stopStepper);
  button.addEventListener('mouseleave', stopStepper);
  button.addEventListener('touchend', stopStepper);
});

document.querySelectorAll('.step-down').forEach(button => {
  button.addEventListener('mousedown', () => startStepper(button, 'down'));
  button.addEventListener('touchstart', () => startStepper(button, 'down'));

  button.addEventListener('mouseup', stopStepper);
  button.addEventListener('mouseleave', stopStepper);
  button.addEventListener('touchend', stopStepper);
});

function setFaviconForTheme() {
  const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
  link.rel = 'icon';
  link.href = `assets/icons/favicon-32-${theme}.png`;
  document.head.appendChild(link);
}

setFaviconForTheme();

// Optional: respond to theme change
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setFaviconForTheme);

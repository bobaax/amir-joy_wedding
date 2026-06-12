/* ===========================
   WEDDING INVITATION – main.js
   =========================== */

// ===========================
// SCROLL REVEAL
// ===========================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


// ===========================
// COUNTDOWN TIMER
// Wedding date: September 27 (current year or next year)
// ===========================
function getWeddingDate() {
  const now = new Date();
  let year = now.getFullYear();
  let wedding = new Date(2026, 6, 15, 20, 0, 0); // Sep = month 8 (0-indexed)
  if (wedding <= now) wedding = new Date(year + 1, 8, 27, 20, 0, 0);
  return wedding;
}

function updateCountdown() {
  const wedding = getWeddingDate();
  const now = new Date();
  const diff = wedding - now;

  if (diff <= 0) {
    document.getElementById('days').textContent = '0';
    document.getElementById('hours').textContent = '0';
    document.getElementById('minutes').textContent = '0';
    document.getElementById('seconds').textContent = '0';
    return;
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('days').textContent    = days;
  document.getElementById('hours').textContent   = hours;
  document.getElementById('minutes').textContent = minutes;
  document.getElementById('seconds').textContent = seconds;
}

updateCountdown();
setInterval(updateCountdown, 1000);


// ===========================
// ADD TO CALENDAR
// ===========================
function addToCalendar(e) {
  e.preventDefault();
  const title   = 'Lucía & Juan – Wedding Ceremony';
  const details = 'Join us for the ceremony at Iglesia de San Francisco and celebration at Del Carril Eventos.';
  const location = 'Iglesia de San Francisco, 123 Church Street, City, Country';
  const wedding = getWeddingDate();

  // Format: YYYYMMDDTHHMMSSZ
  const pad = n => String(n).padStart(2, '0');
  function icsDate(d) {
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  }

  const start = icsDate(wedding);
  const end   = icsDate(new Date(wedding.getTime() + 4 * 60 * 60 * 1000));

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'wedding-lucia-juan.ics';
  a.click();
  URL.revokeObjectURL(url);
}


// ===========================
// AUDIO PLAYER
// ===========================
const audio    = document.getElementById('weddingAudio');
const audioBtn = document.getElementById('audioBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const audioTime = document.getElementById('audioTime');
const audioProgress = document.getElementById('audioProgress');
const audioVol = document.getElementById('audioVol');

let muted = false;

audioBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play().catch(() => {});
    playIcon.style.display  = 'none';
    pauseIcon.style.display = 'block';
  } else {
    audio.pause();
    playIcon.style.display  = 'block';
    pauseIcon.style.display = 'none';
  }
});

audioVol.addEventListener('click', () => {
  muted = !muted;
  audio.muted = muted;
  audioVol.style.opacity = muted ? '0.4' : '1';
});

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  audioProgress.style.width = pct + '%';
  audioTime.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
});

// Auto-play on first user interaction
let autoPlayAttempted = false;
document.addEventListener('click', () => {
  if (!autoPlayAttempted && audio.paused) {
    autoPlayAttempted = true;
    audio.play().then(() => {
      playIcon.style.display  = 'none';
      pauseIcon.style.display = 'block';
    }).catch(() => {});
  }
}, { once: true });


// ===========================
// GIFTS – BANK DETAILS TOGGLE
// ===========================
function toggleBankDetails() {
  const el = document.getElementById('bankDetails');
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}


// ===========================
// PHOTO UPLOAD (local session only)
// ===========================
const uploadedPhotos = [];

function handlePhotoUpload(input) {
  const files = Array.from(input.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedPhotos.push(e.target.result);
      renderUploadedPhotos();
    };
    reader.readAsDataURL(file);
  });
  input.value = '';
}

function renderUploadedPhotos() {
  const grid = document.getElementById('uploadedGrid');
  grid.innerHTML = uploadedPhotos.map(src =>
    `<img src="${src}" alt="Uploaded photo" />`
  ).join('');
}

function viewPhotos() {
  const grid = document.getElementById('uploadedGrid');
  if (uploadedPhotos.length === 0) {
    alert('No photos uploaded yet. Upload some first!');
    return;
  }
  grid.scrollIntoView({ behavior: 'smooth' });
}


// ===========================
// RSVP SUBMIT
// ===========================
function submitRSVP() {
  const attendance = document.querySelector('input[name="attendance"]:checked');
  const name    = document.getElementById('rsvpName').value.trim();
  const song    = document.getElementById('rsvpSong').value.trim();
  const message = document.getElementById('rsvpMessage').value.trim();

  if (!attendance) {
    alert('Please select whether you will attend or not.');
    return;
  }
  if (!name) {
    alert('Please enter your full name.');
    return;
  }

  // In a real app, send to a backend / Google Sheets / Firebase
  console.log('RSVP submitted:', { attendance: attendance.value, name, song, message });

  document.querySelector('.rsvp-form').style.display   = 'none';
  document.querySelector('.rsvp-radios').style.display = 'none';
  document.querySelector('.rsvp-intro').style.display  = 'none';
  document.getElementById('rsvpConfirmation').style.display = 'block';
}


// ===========================
// GALLERY IMAGE FALLBACK
// (Replace placeholder images with gradient when missing)
// ===========================
document.querySelectorAll('.gallery-item img, .hero-img').forEach(img => {
  img.addEventListener('error', function () {
    this.style.display = 'none';
    this.parentElement.style.background = 'linear-gradient(135deg, #8fa387 0%, #c9d4c6 100%)';
  });
});

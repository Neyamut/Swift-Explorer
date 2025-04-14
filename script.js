let hoverSpeakEnabled = false;
let magnifierEnabled = false;
let canvas, ctx;
const zoom = 2;
let snapshot;
let snapshotReady = false;

document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('magnifierCanvas');
  ctx = canvas.getContext('2d');


  const contrastState = localStorage.getItem('contrastEnabled');
  if (contrastState === 'true') {
    document.body.classList.add('high-contrast');
  }
});

function speak(text) {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  const message = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(message);
}

function toggleContrast() {
  const isHighContrast = document.body.classList.toggle('high-contrast');
  localStorage.setItem('contrastEnabled', isHighContrast);
}

function toggleHoverSpeak() {
  hoverSpeakEnabled = !hoverSpeakEnabled;
  const announce = hoverSpeakEnabled
    ? 'Hover speak enabled. Hover over highlighted text to hear it.'
    : 'Hover speak disabled.';
  speak(announce);
  document.body.classList.toggle('hover-speak-enabled', hoverSpeakEnabled);
}

function startVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = function (event) {
    document.getElementById('searchInput').value = event.results[0][0].transcript;
  };
  recognition.start();
}

function captureSnapshot() {
  html2canvas(document.documentElement, { scale: window.devicePixelRatio }).then(canvasSnapshot => {
    snapshot = new Image();
    snapshot.src = canvasSnapshot.toDataURL();
    snapshot.onload = () => {
      snapshotReady = true;
      console.log('Snapshot ready.');
    };
  });
}

function toggleMagnifier() {
  magnifierEnabled = !magnifierEnabled;
  if (magnifierEnabled) {
    captureSnapshot();
    canvas.style.display = 'block';
    document.addEventListener('mousemove', drawMagnifier);
    window.addEventListener('scroll', captureSnapshot);
    window.addEventListener('resize', captureSnapshot);
  } else {
    canvas.style.display = 'none';
    document.removeEventListener('mousemove', drawMagnifier);
    window.removeEventListener('scroll', captureSnapshot);
    window.removeEventListener('resize', captureSnapshot);
  }
}

function drawMagnifier(e) {
  if (!snapshot || !snapshotReady) return;
  const lensSize = 150;
  const zoomFactor = 2;
  const x = e.clientX + window.scrollX;
  const y = e.clientY + window.scrollY;

  canvas.style.left = `${e.clientX - lensSize / 2}px`;
  canvas.style.top = `${e.clientY - lensSize / 2}px`;

  ctx.clearRect(0, 0, lensSize, lensSize);
  ctx.beginPath();
  ctx.arc(lensSize / 2, lensSize / 2, lensSize / 2, 0, Math.PI * 2);
  ctx.clip();

  ctx.drawImage(
    snapshot,
    x - lensSize / (2 * zoomFactor),
    y - lensSize / (2 * zoomFactor),
    lensSize / zoomFactor,
    lensSize / zoomFactor,
    0,
    0,
    lensSize,
    lensSize
  );
}

document.addEventListener('mouseover', function (e) {
  if (hoverSpeakEnabled && e.target) {
    let text = e.target.innerText || e.target.placeholder || e.target.getAttribute('aria-label');
    if (!text && e.target.tagName === 'INPUT') {
      const label = document.querySelector(`label[for='${e.target.id}']`);
      if (label) text = label.innerText;
    }
    if (text) {
      speak(text);
      e.target.classList.add('hover-speaking');
      setTimeout(() => e.target.classList.remove('hover-speaking'), 1000);
    }
  }
});

function triggerSearch() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  if (!query) {
    alert('Please enter a search term.');
    return;
  }

  const contentElements = document.querySelectorAll('h1, h2, h3, p, a, li');
  let found = false;


  contentElements.forEach(el => {
    el.style.backgroundColor = '';
  });


  contentElements.forEach(el => {
    if (el.textContent.toLowerCase().includes(query)) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.backgroundColor = '#950606'; 
      found = true;
    }
  });

  if (!found) {
    if (confirm(`No local results found for "${query}". Search on Google instead?`)) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('magnifierCanvas');
  ctx = canvas.getContext('2d');


  const contrastState = localStorage.getItem('contrastEnabled');
  if (contrastState === 'true') {
    document.body.classList.add('high-contrast');
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerSearch();
      }
    });
  }
});

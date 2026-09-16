/**
 * ============================================================================
 * LUNAR EXPLORER — MISSION CONTROL TERMINAL (v2.0 L.U.N.A Edition)
 * Zero Dependencies, 100% Offline Plain JavaScript
 * Modules:
 *  1. Sound Synthesizer Engine (Web Audio API)
 *  2. Starfield & Cosmic Background Engine (~180 stars + 3 shooting stars)
 *  3. Interactive Solar/Lunar Orbital Canvas Simulator
 *  4. Live Telemetry Sensors & Seismogram Feed
 *  5. 3D Card Tilt Engine (Perspective & Glare)
 *  6. Mission Archive & Telemetry Dossier Modal
 *  7. Interactive Vertical Timeline & Agency Filtering
 *  8. Gamified Quiz Engine (6 Questions, Border Indicators, Shake, Starburst)
 *  9. L.U.N.A Assistant (Offline NLP Knowledge Base & Voice Speech Synth)
 * 10. Mission Clock & Real-Time Ticker Manager
 * ============================================================================
 */

/* ==========================================================================
   1. SOUND SYNTHESIZER ENGINE (Web Audio API - 100% Offline)
   ========================================================================== */
class MissionAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 880, duration = 0.08, type = 'sine', gainVal = 0.05) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio fallback silent
    }
  }

  playSuccessChime() {
    if (this.muted) return;
    this.playBeep(587.33, 0.12, 'triangle', 0.08); // D5
    setTimeout(() => this.playBeep(880, 0.25, 'triangle', 0.08), 120); // A5
  }

  playErrorBuzz() {
    if (this.muted) return;
    this.playBeep(180, 0.22, 'sawtooth', 0.07);
  }

  playTransmissionChirp() {
    if (this.muted) return;
    this.playBeep(1200, 0.04, 'sine', 0.04);
    setTimeout(() => this.playBeep(1500, 0.05, 'sine', 0.04), 45);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

const audioEngine = new MissionAudioEngine();

/* ==========================================================================
   2. STARFIELD GENERATOR (~180 Stars + Twinkle)
   ========================================================================== */
function initStarfield() {
  const container = document.getElementById('starfield');
  if (!container) return;

  const starCount = 180;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';

    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() < 0.8 ? (Math.random() * 1.5 + 0.8) : (Math.random() * 2.5 + 1.8);
    const duration = (Math.random() * 4 + 2.5).toFixed(2);
    const delay = (Math.random() * 5).toFixed(2);
    const opacity = (Math.random() * 0.6 + 0.2).toFixed(2);

    star.style.left = `${x}%`;
    star.style.top = `${y}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.opacity = opacity;

    // Colorful cosmic tints for starfield
    const randColor = Math.random();
    if (randColor > 0.88) {
      star.style.backgroundColor = '#ffd54f'; // Gold star
    } else if (randColor > 0.76) {
      star.style.backgroundColor = '#5bb8ff'; // Blue star
    } else if (randColor > 0.68) {
      star.style.backgroundColor = '#d8aaff'; // Lilac star
    }

    star.style.animation = `twinkle ${duration}s ease-in-out infinite`;
    star.style.animationDelay = `${delay}s`;

    fragment.appendChild(star);
  }

  container.appendChild(fragment);
}

/* ==========================================================================
   3. INTERACTIVE SOLAR / LUNAR ORBITAL CANVAS SIMULATOR
   ========================================================================== */
class OrbitSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.angle = 0;
    this.speed = 0.008;
    this.mode = 'tidal'; // 'tidal', 'tli' (figure 8), 'southpole'
    this.isHovered = false;
    this.animationFrameId = null;

    this.initCanvasSize();
    window.addEventListener('resize', () => this.initCanvasSize());
    this.setupControls();
    this.startLoop();
  }

  initCanvasSize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  setupControls() {
    const modeSelect = document.getElementById('orbit-mode-select');
    if (modeSelect) {
      modeSelect.addEventListener('change', (e) => {
        this.mode = e.target.value;
        audioEngine.playBeep(700, 0.05);
      });
    }

    const speedBtn = document.getElementById('orbit-speed-toggle');
    if (speedBtn) {
      speedBtn.addEventListener('click', () => {
        if (this.speed === 0.008) {
          this.speed = 0.024;
          speedBtn.textContent = 'SPEED: 3X';
        } else if (this.speed === 0.024) {
          this.speed = 0.002;
          speedBtn.textContent = 'SPEED: 0.5X';
        } else {
          this.speed = 0.008;
          speedBtn.textContent = 'SPEED: 1X';
        }
        audioEngine.playBeep(950, 0.05);
      });
    }
  }

  draw() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Coordinate Reticle & HUD Radar rings
    ctx.save();
    ctx.strokeStyle = 'rgba(91, 184, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, w * 0.42, 0, Math.PI * 2);
    ctx.arc(cx, cy, w * 0.28, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.strokeStyle = 'rgba(91, 184, 255, 0.12)';
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.moveTo(cx, 20); ctx.lineTo(cx, h - 20);
    ctx.moveTo(20, cy); ctx.lineTo(w - 20, cy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 1. Central Earth
    const earthRadius = 32;
    const earthGlow = ctx.createRadialGradient(cx, cy, earthRadius * 0.6, cx, cy, earthRadius * 2);
    earthGlow.addColorStop(0, 'rgba(91, 184, 255, 0.9)');
    earthGlow.addColorStop(0.5, 'rgba(40, 110, 200, 0.4)');
    earthGlow.addColorStop(1, 'rgba(91, 184, 255, 0)');
    ctx.fillStyle = earthGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, earthRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Earth Body
    const earthGrad = ctx.createLinearGradient(cx - earthRadius, cy - earthRadius, cx + earthRadius, cy + earthRadius);
    earthGrad.addColorStop(0, '#75c8ff');
    earthGrad.addColorStop(0.5, '#1e5fad');
    earthGrad.addColorStop(1, '#091c3b');
    ctx.fillStyle = earthGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, earthRadius, 0, Math.PI * 2);
    ctx.fill();

    // Earth Continents (Stylized geometric)
    ctx.fillStyle = '#4eff9a';
    ctx.beginPath();
    ctx.arc(cx - 8, cy - 6, 8, 0, Math.PI * 2);
    ctx.arc(cx + 6, cy + 4, 10, 0, Math.PI * 2);
    ctx.arc(cx - 4, cy + 12, 5, 0, Math.PI * 2);
    ctx.fill();

    // Earth Label
    ctx.font = '9px "Space Mono", monospace';
    ctx.fillStyle = 'rgba(91, 184, 255, 0.85)';
    ctx.textAlign = 'center';
    ctx.fillText('TERRA [EARTH]', cx, cy + earthRadius + 14);

    // 2. Orbital Path
    const orbitRadius = w * 0.36;
    ctx.strokeStyle = 'rgba(255, 213, 79, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, orbitRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Mode Trajectory Lines
    if (this.mode === 'tli') {
      // Trans-Lunar Injection figure-8 transfer orbit
      ctx.strokeStyle = 'rgba(255, 213, 79, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let t = 0; t <= Math.PI * 2; t += 0.05) {
        const tx = cx + Math.sin(t) * (orbitRadius * 0.95);
        const ty = cy + Math.sin(2 * t) * (orbitRadius * 0.48);
        if (t === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.stroke();

      ctx.fillStyle = 'var(--gold)';
      ctx.font = '9px "Space Mono", monospace';
      ctx.fillText('ARTEMIS TLI FREE-RETURN LOOP', cx, 36);
    } else if (this.mode === 'southpole') {
      // Polar orbital insertion ellipse
      ctx.strokeStyle = 'rgba(78, 255, 154, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, orbitRadius * 0.35, orbitRadius * 0.95, Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'var(--teal)';
      ctx.font = '9px "Space Mono", monospace';
      ctx.fillText('POLAR NRHO // SHACKLETON INSERTION', cx, 36);
    }

    // 4. The Moon Position
    const moonX = cx + Math.cos(this.angle) * orbitRadius;
    const moonY = cy + Math.sin(this.angle) * orbitRadius;
    const moonRadius = 14;

    // Moon Glow
    const moonGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 2.2);
    moonGlow.addColorStop(0, 'rgba(255, 213, 79, 0.4)');
    moonGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Moon Body
    const moonGrad = ctx.createLinearGradient(moonX - moonRadius, moonY - moonRadius, moonX + moonRadius, moonY + moonRadius);
    moonGrad.addColorStop(0, '#f2f4f8');
    moonGrad.addColorStop(0.6, '#96a0b3');
    moonGrad.addColorStop(1, '#2c3545');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    // Craters on near side (facing Earth - Tidal Locking demonstration)
    ctx.fillStyle = 'rgba(40, 50, 70, 0.55)';
    ctx.beginPath();
    // In tidal locking, near-side vector points exactly toward center
    const toEarthAngle = Math.atan2(cy - moonY, cx - moonX);
    const craterDist = moonRadius * 0.4;
    const c1x = moonX + Math.cos(toEarthAngle) * craterDist;
    const c1y = moonY + Math.sin(toEarthAngle) * craterDist;
    ctx.arc(c1x, c1y, 3, 0, Math.PI * 2);
    ctx.arc(c1x + 3, c1y - 3, 2, 0, Math.PI * 2);
    ctx.arc(c1x - 2, c1y + 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Tidal lock vector arrow (pointing towards Earth)
    ctx.strokeStyle = 'rgba(78, 255, 154, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(moonX, moonY);
    ctx.lineTo(moonX + Math.cos(toEarthAngle) * (moonRadius + 10), moonY + Math.sin(toEarthAngle) * (moonRadius + 10));
    ctx.stroke();

    // Moon Label & Status
    ctx.font = '9px "Space Mono", monospace';
    ctx.fillStyle = '#ffd54f';
    ctx.textAlign = 'center';
    ctx.fillText('LUNA [TIDALLY LOCKED]', moonX, moonY - moonRadius - 8);

    // Update angle
    this.angle += this.speed;
    if (this.angle > Math.PI * 2) this.angle -= Math.PI * 2;
  }

  startLoop() {
    const loop = () => {
      this.draw();
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }
}

/* ==========================================================================
   4. LIVE TELEMETRY SENSORS & REAL-TIME SEISMOGRAM
   ========================================================================== */
function initSeismogramMonitor() {
  const canvas = document.getElementById('seismic-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let dpr = window.devicePixelRatio || 1;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  const points = [];
  const maxPoints = 80;
  for (let i = 0; i < maxPoints; i++) {
    points.push(0);
  }

  let step = 0;

  function drawSeismogram() {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const midY = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Subtle Grid lines
    ctx.strokeStyle = 'rgba(78, 255, 154, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY); ctx.lineTo(w, midY);
    ctx.stroke();

    // Generate slight noise + occasional seismic spike
    step++;
    let noise = (Math.random() - 0.5) * 4;
    if (step % 90 < 10) {
      // simulated micro-moonquake
      noise += Math.sin(step * 0.8) * 18;
    }
    points.push(noise);
    if (points.length > maxPoints) {
      points.shift();
    }

    // Render wave
    ctx.strokeStyle = '#4eff9a';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(78, 255, 154, 0.5)';
    ctx.shadowBlur = 8;
    ctx.beginPath();

    const dx = w / (maxPoints - 1);
    for (let i = 0; i < points.length; i++) {
      const x = i * dx;
      const y = midY + points[i];
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    requestAnimationFrame(drawSeismogram);
  }

  drawSeismogram();
}

/* ==========================================================================
   5. 3D CARD TILT ENGINE (Live rotateX / rotateY & Glare on Mousemove)
   ========================================================================== */
function init3DCardTilt() {
  const cards = document.querySelectorAll('.archive-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate tilt angles (capped for smooth museum-grade polish)
      const rotateX = ((y - centerY) / centerY) * -12; // Invert for natural tilt
      const rotateY = ((x - centerX) / centerX) * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      // Set CSS variables for realistic specular glare highlight
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

/* ==========================================================================
   6. MISSION ARCHIVE DATA & MODAL DOSSIER SYSTEM
   ========================================================================== */
const missionDossiers = {
  artemis: {
    title: 'NASA ARTEMIS PROGRAM (I, II, III)',
    designation: 'NASA-ESA-JAXA-CSA LUNAR RECONNAISSANCE & CREW LANDING',
    image: 'artemis.jpg',
    agency: 'NASA / International',
    launchVehicle: 'Space Launch System (SLS) Block 1 & 1B',
    crewed: 'Yes (Orion Spacecraft + Starship HLS)',
    target: 'Lunar South Pole & Shackleton Crater Ridge',
    highlights: [
      'Artemis I verified Orion thermal shield during Mach 32 reentry and 2.25 million km orbital trajectory.',
      'Artemis II sends 4 astronauts (Reid Wiseman, Victor Glover, Christina Koch, Jeremy Hansen) on lunar flyby.',
      'Artemis III executes first human landing at the Lunar South Pole utilizing SpaceX Starship Human Landing System (HLS).',
      'Permanently established Artemis Base Camp and Lunar Gateway in Near-Rectilinear Halo Orbit (NRHO).'
    ],
    scientificValue: 'Direct extraction of water ice volatiles in permanently shadowed regions (PSR) to manufacture rocket propellant (LOX/LH2) and oxygen for future crewed Mars missions.'
  },
  apollo11: {
    title: 'APOLLO 11: TRANQUILITY BASE',
    designation: 'NASA LUNAR LANDING MISSION (FIRST CREWED TOUCHDOWN)',
    image: 'apollo11.jpg',
    agency: 'NASA',
    launchVehicle: 'Saturn V (SA-506)',
    crewed: 'Neil Armstrong, Buzz Aldrin, Michael Collins',
    target: 'Mare Tranquillitatis (0.67408° N, 23.47297° E)',
    highlights: [
      'Touchdown achieved on July 20, 1969 with 25 seconds of descent fuel remaining in Lunar Module Eagle.',
      'Deployed Early Apollo Scientific Experiments Package (EASEP) including laser ranging retroreflector still active today.',
      'Collected 21.55 kg (47.5 lb) of lunar surface regolith and breccia rocks.',
      'Directly disproved the "deep quicksand dust" hypothesis and confirmed basaltic volcanic mare origins.'
    ],
    scientificValue: 'First ground-truth calibration for crater counting chronology across the entire solar system.'
  },
  chandrayaan3: {
    title: 'CHANDRAYAAN-3: VIKRAM & PRAGYAN',
    designation: 'ISRO LUNAR SOUTH POLE EXPLORATION MISSION',
    image: 'chandrayaan3.jpg',
    agency: 'ISRO (India)',
    launchVehicle: 'LVM3 M4',
    crewed: 'Robotic (Lander & Rover)',
    target: 'Shiv Shakti Point (69.37° S, 32.35° E)',
    highlights: [
      'Historic first successful soft landing within the high-latitude lunar South Pole territory on August 23, 2023.',
      'Pragyan rover traveled 101.3 meters across southern polar terrain with Laser-Induced Breakdown Spectroscope (LIBS).',
      'ChaSTE probe recorded groundbreaking soil temperature profile: 50°C at surface dropping to -10°C just 8 cm down.',
      'Unambiguously confirmed presence of elemental Sulfur (S) on lunar polar surface regolith.'
    ],
    scientificValue: 'Pioneered robotic navigation and thermal insulation mapping in the ultra-cold southern polar plains.'
  },
  change6: {
    title: "CHANG'E 6: FAR SIDE SAMPLE RETURN",
    designation: "CNSA HISTORIC SOUTH POLE-AITKEN SAMPLE RETURN",
    image: 'change6.jpg',
    agency: 'CNSA (China)',
    launchVehicle: 'Long March 5',
    crewed: 'Robotic Autonomous Ascender & Returner',
    target: 'South Pole-Aitken Basin (Apollo Crater, 41.6° S, 153.9° W)',
    highlights: [
      'Returned 1,935.3 grams of pristine lunar soil from the mysterious lunar Far Side on June 25, 2024.',
      'Relayed communications seamlessly through Queqiao-2 halo orbit satellite at Earth-Moon L2.',
      'Subsurface core drill penetrated 2 meters below the regolith to capture undisturbed geologic strata.',
      'Revealed significant volcanic and crustal thickness asymmetry between lunar Near and Far sides.'
    ],
    scientificValue: 'Solves the 60-year-old enigma of why the Moon\'s far side lacks large volcanic basaltic maria.'
  },
  gateway: {
    title: 'LUNAR GATEWAY ORBITING OUTPOST',
    designation: 'INTERNATIONAL PERMANENT CISLUNAR SPACE STATION',
    image: 'artemis.jpg',
    agency: 'NASA / ESA / JAXA / CSA',
    launchVehicle: 'Falcon Heavy / Commercial',
    crewed: 'Human-Tended (Up to 4 crew for 30-90 days)',
    target: 'Near-Rectilinear Halo Orbit (NRHO)',
    highlights: [
      'Power and Propulsion Element (PPE) utilizes 50 kW advanced solar electric xenon ion propulsion.',
      'HALO (Habitation and Logistics Outpost) provides pressurized laboratory and docking hub.',
      'ESA I-Hab & ESPRIT modules deliver communications relay, refueling, and scientific airlocks.',
      'Serves as permanent staging point for Starship HLS, Blue Origin Blue Moon, and Mars transports.'
    ],
    scientificValue: 'Continuous observation of deep space space radiation and solar wind outside Earth\'s protective magnetosphere.'
  },
  lro_viper: {
    title: 'LRO & VIPER VOLATILE SCOUTING',
    designation: 'LUNAR RECONNAISSANCE ORBITER & WATER PROSPECTOR',
    image: 'chandrayaan3.jpg',
    agency: 'NASA / Commercial CLPS',
    launchVehicle: 'Atlas V / Commercial CLPS',
    crewed: 'Robotic Volatiles Rover & Polar Mapping Orbiter',
    target: 'Permanently Shadowed Craters (Nobile & Faustini)',
    highlights: [
      'LRO has operated continuously for 15+ years delivering 0.5-meter resolution global topographical maps.',
      'Diviner Lunar Radiometer recorded the coldest temperatures measured in the Solar System (-248°C / 25 K).',
      'TRIDENT 1-meter drill engineered to extract cryogenic ice cores without sublimating water in vacuum.',
      'NSS (Neutron Spectrometer System) detects hydrogen signatures up to 1 meter beneath the regolith.'
    ],
    scientificValue: 'Provides definitive 3D distribution maps of accessible H₂O ice deposits for commercial ISRU.'
  }
};

function initMissionModals() {
  const modalOverlay = document.getElementById('mission-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modalOverlay || !closeBtn) return;

  function closeModal() {
    modalOverlay.classList.remove('open');
    audioEngine.playBeep(440, 0.05);
  }

  closeBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
  });

  document.querySelectorAll('[data-dossier]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      const key = trigger.getAttribute('data-dossier');
      const data = missionDossiers[key];
      if (!data) return;

      audioEngine.playTransmissionChirp();

      document.getElementById('modal-img').src = data.image;
      document.getElementById('modal-img').alt = data.title;
      document.getElementById('modal-title').textContent = data.title;
      document.getElementById('modal-designation').textContent = data.designation;
      document.getElementById('modal-agency').textContent = data.agency;
      document.getElementById('modal-vehicle').textContent = data.launchVehicle;
      document.getElementById('modal-crew').textContent = data.crewed;
      document.getElementById('modal-target').textContent = data.target;

      const bulletsList = document.getElementById('modal-highlights');
      bulletsList.innerHTML = '';
      data.highlights.forEach((h) => {
        const li = document.createElement('li');
        li.textContent = h;
        bulletsList.appendChild(li);
      });

      document.getElementById('modal-science').textContent = data.scientificValue;
      modalOverlay.classList.add('open');
    });
  });
}

/* ==========================================================================
   7. INTERACTIVE TIMELINE & AGENCY FILTERING
   ========================================================================== */
function initTimelineFiltering() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.timeline-item');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const agency = btn.getAttribute('data-filter');
      audioEngine.playBeep(650, 0.06);

      items.forEach((item) => {
        if (agency === 'all' || item.getAttribute('data-agency') === agency) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   8. GAMIFIED MISSION QUIZ (6 Questions, Border Indicator, Shake, Starburst)
   ========================================================================== */
const quizQuestions = [
  {
    question: "Why is the Lunar South Pole currently humanity's most coveted destination for permanent lunar bases?",
    options: [
      "It has abundant liquid freshwater lakes beneath the crust.",
      "Permanently Shadowed Regions (PSRs) shelter vast deposits of water ice and volatile resources.",
      "The Moon's magnetic field is strongest at the South Pole.",
      "It stays at a constant tropical temperature of 22°C year-round."
    ],
    correctIndex: 1,
    explanation: "Deep polar crater floors never receive sunlight (some below 40 Kelvin / -233°C). Millions of tons of ancient water ice are trapped in these 'cold traps', vital for drinking, oxygen, and hydrogen rocket fuel."
  },
  {
    question: "What unique physical phenomenon causes humans on Earth to only ever see one side (the near side) of the Moon?",
    options: [
      "Solar radiation pressure constantly turns the Moon towards Earth.",
      "The Far Side is perpetually shielded by a dark asteroid cloud.",
      "Tidal Locking: The Moon's rotational period exactly matches its orbital period (27.3 days).",
      "Earth's magnetic pole prevents the Moon from rotating."
    ],
    correctIndex: 2,
    explanation: "Gravitational tidal friction over billions of years synchronized the Moon's axial rotation with its orbit around Earth, keeping the same hemisphere locked facing us."
  },
  {
    question: "Which historic mission achieved humanity's very first soft landing on the unexplored Far Side of the Moon?",
    options: [
      "Apollo 17 (NASA, 1972)",
      "Chang'e 4 with Yutu-2 rover (CNSA, 2019)",
      "Luna 9 (Soviet Union, 1966)",
      "Chandrayaan-2 (ISRO, 2019)"
    ],
    correctIndex: 1,
    explanation: "On January 3, 2019, China's Chang'e 4 touched down in the Von Kármán crater on the lunar Far Side, using the Queqiao relay satellite at Earth-Moon L2 to communicate through the Moon."
  },
  {
    question: "How do Apollo and modern seismometers classify 'Deep Moonquakes' compared to terrestrial earthquakes?",
    options: [
      "They are caused by active molten core plate tectonics.",
      "They are triggered by gravitational tidal stresses from Earth, ringing for over an hour due to dry crust.",
      "They are solely caused by volcanic eruptions in Oceanus Procellarum.",
      "Moonquakes do not exist; the lunar crust is completely inert."
    ],
    correctIndex: 1,
    explanation: "Unlike Earth's water-dampened tectonic plates, the Moon is extremely dry and rigid. When tidal forces flex the lunar interior, moonquakes can ring like a tuning fork for over 60 minutes!"
  },
  {
    question: "What distinct smell did Apollo astronauts repeatedly report upon re-entering the Lunar Module with regolith on their suits?",
    options: [
      "Sweet ozone like an electric motor",
      "Spent gunpowder or firecrackers",
      "Pungent ammonia and sulfur",
      "Completely odorless mineral glass"
    ],
    correctIndex: 1,
    explanation: "Neil Armstrong, Buzz Aldrin, and Gene Cernan all noted that freshly agitated lunar regolith reacting with the pressurized oxygen-moisture atmosphere smelled strikingly like spent gunpowder."
  },
  {
    question: "Which spacecraft will carry astronauts Reid Wiseman, Victor Glover, Christina Koch, and Jeremy Hansen on Artemis II?",
    options: [
      "SpaceX Dragon 2",
      "NASA Orion Spacecraft launched aboard SLS Block 1",
      "Boeing Starliner Calypso",
      "Soyuz MS-28"
    ],
    correctIndex: 1,
    explanation: "Artemis II will launch 4 astronauts on a 10-day lunar flyby trajectory inside NASA's Orion capsule, marking humanity's first crewed deep space journey beyond low Earth orbit since 1972."
  }
];

class MissionQuizEngine {
  constructor() {
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;

    this.progressBar = document.getElementById('quiz-progress-fill');
    this.questionText = document.getElementById('quiz-question-text');
    this.optionsContainer = document.getElementById('quiz-options');
    this.feedbackBox = document.getElementById('quiz-feedback');
    this.feedbackTitle = document.getElementById('feedback-title');
    this.feedbackBody = document.getElementById('feedback-body');
    this.nextBtn = document.getElementById('quiz-next-btn');
    this.quizBox = document.getElementById('quiz-active-box');
    this.resultsCard = document.getElementById('quiz-results-card');
    this.counterEl = document.getElementById('quiz-question-counter');

    this.init();
  }

  init() {
    if (!this.questionText || !this.optionsContainer) return;
    this.renderQuestion();
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.handleNext());
    }
    const restartBtn = document.getElementById('quiz-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restart());
    }
  }

  renderQuestion() {
    this.answered = false;
    const q = quizQuestions[this.currentIndex];

    // Progress
    const progressPercent = ((this.currentIndex + 1) / quizQuestions.length) * 100;
    if (this.progressBar) {
      this.progressBar.style.width = `${progressPercent}%`;
    }
    if (this.counterEl) {
      this.counterEl.textContent = `QUESTION 0${this.currentIndex + 1} // 0${quizQuestions.length}`;
    }

    this.questionText.textContent = q.question;
    this.optionsContainer.innerHTML = '';
    this.feedbackBox.classList.remove('active');
    this.nextBtn.style.display = 'none';

    q.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.innerHTML = `<span><strong>${String.fromCharCode(65 + index)}.</strong> ${optText}</span><span class="opt-indicator"></span>`;
      btn.addEventListener('click', () => this.selectOption(index, btn));
      this.optionsContainer.appendChild(btn);
    });
  }

  selectOption(selectedIndex, btnElement) {
    if (this.answered) return;
    this.answered = true;

    const q = quizQuestions[this.currentIndex];
    const isCorrect = selectedIndex === q.correctIndex;
    const allButtons = this.optionsContainer.querySelectorAll('.quiz-option-btn');

    // Disable all options
    allButtons.forEach((b) => b.setAttribute('disabled', 'true'));

    if (isCorrect) {
      this.score++;
      btnElement.classList.add('correct');
      audioEngine.playSuccessChime();
      this.feedbackTitle.innerHTML = '<span class="text-teal">✓ TELEMETRY CONFIRMED — CORRECT</span>';
    } else {
      btnElement.classList.add('wrong');
      // Shake animation on incorrect selection
      btnElement.classList.add('shake');
      audioEngine.playErrorBuzz();

      // Highlight the correct answer with teal indicator
      allButtons[q.correctIndex].classList.add('correct');
      this.feedbackTitle.innerHTML = '<span class="text-coral">⚠ TELEMETRY ANOMALY — INCORRECT</span>';
    }

    this.feedbackBody.textContent = q.explanation;
    this.feedbackBox.classList.add('active');

    this.nextBtn.style.display = 'inline-flex';
    this.nextBtn.textContent = (this.currentIndex === quizQuestions.length - 1) ? 'VIEW FINAL RATING' : 'NEXT TELEMETRY QUESTION →';
  }

  handleNext() {
    audioEngine.playBeep(750, 0.05);
    if (this.currentIndex < quizQuestions.length - 1) {
      this.currentIndex++;
      this.renderQuestion();
    } else {
      this.showResults();
    }
  }

  showResults() {
    this.quizBox.style.display = 'none';
    this.resultsCard.style.display = 'block';

    const scoreDisplay = document.getElementById('results-score');
    const badgeDisplay = document.getElementById('results-badge');
    const descDisplay = document.getElementById('results-desc');

    scoreDisplay.textContent = `${this.score} / ${quizQuestions.length}`;

    if (this.score === 6) {
      badgeDisplay.textContent = 'RANK: CHIEF FLIGHT DIRECTOR [PERFECT SCORE]';
      badgeDisplay.style.color = 'var(--teal)';
      badgeDisplay.style.borderColor = 'var(--teal)';
      descDisplay.textContent = 'Outstanding navigation mastery! You have achieved flight clearance across all Apollo, Artemis, and robotic deep-space mission domains.';
      // Trigger Starburst Confetti for 6/6
      triggerStarburstConfetti();
      audioEngine.playSuccessChime();
    } else if (this.score >= 4) {
      badgeDisplay.textContent = 'RANK: LUNAR MISSION SPECIALIST';
      badgeDisplay.style.color = 'var(--gold)';
      badgeDisplay.style.borderColor = 'var(--gold)';
      descDisplay.textContent = 'Strong technical acumen! You possess deep familiarity with lunar geology, polar ice mechanics, and exploration milestones.';
    } else {
      badgeDisplay.textContent = 'RANK: FLIGHT CADET (TRAINING)';
      badgeDisplay.style.color = 'var(--blue)';
      badgeDisplay.style.borderColor = 'var(--blue)';
      descDisplay.textContent = 'Commendable initial flight simulation. Consult L.U.N.A and review the 3D mission archives to achieve senior commander status.';
    }
  }

  restart() {
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
    this.resultsCard.style.display = 'none';
    this.quizBox.style.display = 'block';
    this.renderQuestion();
    audioEngine.playBeep(900, 0.06);
  }
}

/* ==========================================================================
   STARBURST CONFETTI EFFECT (100% Canvas & Zero Dependencies)
   ========================================================================== */
function triggerStarburstConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#ffd54f', '#4eff9a', '#5bb8ff', '#ff6b45', '#d8aaff', '#ffffff'];

  // Spawn starburst particles from center
  const originX = canvas.width / 2;
  const originY = canvas.height / 2;

  for (let i = 0; i < 150; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 12 + 4;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.015 + 0.01,
      gravity: 0.18
    });
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach((p) => {
      if (p.alpha > 0) {
        active = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    if (active) {
      requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animateConfetti();
}

/* ==========================================================================
   9. THE L.U.N.A ASSISTANT (Lunar Universal Navigation Assistant)
   Offline Knowledge Base & Speech Synthesis Voice Engine
   ========================================================================== */
const moonKnowledge = {
  regolith: {
    keywords: ['regolith', 'soil', 'dust', 'ground', 'smell', 'dirt'],
    title: 'Lunar Regolith & Surface Dust',
    response: 'Lunar regolith is not like terrestrial soil; having never weathered with air or liquid water, its grains are razor-sharp micro-shards of basalt and glass caused by billions of years of meteorite pulverization. Apollo crews noted it clings tenaciously via electrostatic charges and smells distinctly of spent gunpowder when brought into the pressurized lunar module.'
  },
  southpole: {
    keywords: ['south pole', 'shackleton', 'pole', 'ice', 'water', 'crater', 'shadow'],
    title: 'South Pole & Permanently Shadowed Craters',
    response: 'The Lunar South Pole features craters where rims receive perpetual sunlight (Peaks of Eternal Light) while their deep floors are Permanently Shadowed Regions (PSRs). Temperatures inside drop to 40 Kelvin (-233°C), preserving billions of tons of frozen water ice deposits critical for rocket fuel synthesis (hydrogen/oxygen).'
  },
  apollo: {
    keywords: ['apollo', 'armstrong', 'aldrin', '1969', 'saturn v', 'eagle'],
    title: 'Project Apollo Milestones',
    response: 'NASA\'s Apollo program landed 12 humans on the Moon between 1969 and 1972. Apollo 11 touched down in Mare Tranquillitatis on July 20, 1969. Over 6 missions, astronauts gathered 382 kg of rocks, drove 90 km in lunar rovers, and established that the Moon formed ~4.5 billion years ago via a collision between proto-Earth and Theia.'
  },
  artemis: {
    keywords: ['artemis', 'sls', 'orion', 'starship', 'base camp', 'return', 'future'],
    title: 'Artemis Exploration Architecture',
    response: 'Artemis is humanity\'s return to the Moon with international partners (ESA, JAXA, CSA). Artemis II will fly 4 astronauts in a circumlunar trajectory; Artemis III will land the first woman and person of color on the South Pole using SpaceX\'s Starship HLS, establishing a permanent base camp and the lunar Gateway space station.'
  },
  chandrayaan: {
    keywords: ['chandrayaan', 'isro', 'india', 'vikram', 'pragyan', 'sulfur'],
    title: 'ISRO Chandrayaan-3 Victory',
    response: 'On August 23, 2023, India\'s Chandrayaan-3 landed Vikram at 69.37° S near Manzinus C crater. The Pragyan rover operated for one full lunar daylight cycle (14 days), discovering elemental sulfur and recording surface soil temperature gradients of 60°C difference within just 8 centimeters depth.'
  },
  change: {
    keywords: ['change', 'china', 'cnsa', 'far side', 'yutu', 'sample'],
    title: 'CNSA Lunar Exploration Program',
    response: 'China achieved the first Far Side landing in history (Chang\'e 4, 2019) and completed the first sample return from the far side (Chang\'e 6, June 2024, gathering 1,935g from South Pole-Aitken Basin). The Far Side crust is significantly thicker and lacks the vast basaltic maria found on the Earth-facing hemisphere.'
  },
  moonquake: {
    keywords: ['quake', 'seismic', 'tremor', 'ring', 'shake'],
    title: 'Lunar Seismology & Moonquakes',
    response: 'The Moon is seismically active, experiencing four types of quakes: deep (caused by tidal pull from Earth), thermal (expansion after the 2-week freeze), meteoroid impact shocks, and shallow tectonic quakes up to magnitude 5.5. Because the Moon lacks liquid water to absorb vibrations, it rings acoustically for up to an hour!'
  },
  tidallylocked: {
    keywords: ['tidal', 'locked', 'rotation', 'face', 'dark side'],
    title: 'Tidal Synchronization',
    response: 'The Moon rotates on its axis at the exact same rate it orbits Earth: 27.32 days. This means the same face is always turned toward us. The "dark side" of the Moon is a misnomer—it receives just as much sunlight as the near side, transitioning through day and night every month.'
  },
  distance: {
    keywords: ['distance', 'far', 'km', 'miles', 'orbit', 'speed'],
    title: 'Lunar Orbital Dynamics',
    response: 'The Moon orbits at an average distance of 384,400 km (238,855 miles), moving at 1.022 km/s. Its orbit is elliptical (perigee 363,300 km to apogee 405,500 km). All other 7 planets in our solar system could fit side-by-side between Earth and the Moon with room to spare!'
  },
  temperature: {
    keywords: ['temp', 'temperature', 'cold', 'hot', 'heat', 'freeze'],
    title: 'Extreme Thermal Range',
    response: 'With virtually no atmosphere to trap heat or insulate the surface, daytime at the lunar equator reaches scorching temperatures of +120°C (248°F), while night plunges to -130°C (-202°F). Deep polar craters plunge even lower to -248°C (25 Kelvin), among the coldest places in the entire solar universe.'
  }
};

class LunaTerminalAssistant {
  constructor() {
    this.isOpen = false;
    this.voiceEnabled = true;
    this.synth = window.speechSynthesis || null;

    this.toggleBtn = document.getElementById('luna-toggle-btn');
    this.windowEl = document.getElementById('luna-terminal');
    this.closeBtn = document.getElementById('luna-close-btn');
    this.chatStream = document.getElementById('terminal-stream');
    this.inputField = document.getElementById('luna-chat-input');
    this.sendBtn = document.getElementById('luna-send-btn');
    this.voiceToggleBtn = document.getElementById('luna-voice-toggle');
    this.badge = document.getElementById('luna-badge');

    this.init();
  }

  init() {
    if (!this.toggleBtn || !this.windowEl) return;

    this.toggleBtn.addEventListener('click', () => this.toggleWindow());
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.toggleWindow(false));
    }

    if (this.sendBtn && this.inputField) {
      this.sendBtn.addEventListener('click', () => this.handleSend());
      this.inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleSend();
      });
    }

    if (this.voiceToggleBtn) {
      this.voiceToggleBtn.addEventListener('click', () => {
        this.voiceEnabled = !this.voiceEnabled;
        this.voiceToggleBtn.classList.toggle('active', this.voiceEnabled);
        this.voiceToggleBtn.title = this.voiceEnabled ? 'Voice Synthesis: ACTIVE' : 'Voice Synthesis: MUTED';
        audioEngine.playBeep(this.voiceEnabled ? 900 : 400, 0.08);
      });
    }

    // Quick chip buttons
    document.querySelectorAll('.quick-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        if (query && this.inputField) {
          this.inputField.value = query;
          this.handleSend();
        }
      });
    });

    // Also link Hero L.U.N.A CTA button
    const heroLunaBtn = document.getElementById('hero-luna-btn');
    if (heroLunaBtn) {
      heroLunaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleWindow(true);
      });
    }
  }

  toggleWindow(forceState) {
    this.isOpen = forceState !== undefined ? forceState : !this.isOpen;
    if (this.isOpen) {
      this.windowEl.classList.remove('closed');
      audioEngine.playTransmissionChirp();
      if (this.badge) this.badge.style.display = 'none';
      setTimeout(() => this.inputField.focus(), 200);
    } else {
      this.windowEl.classList.add('closed');
      audioEngine.playBeep(400, 0.05);
    }
  }

  handleSend() {
    const rawText = this.inputField.value.trim();
    if (!rawText) return;

    audioEngine.playBeep(880, 0.04);
    this.addBubble(rawText, 'user');
    this.inputField.value = '';

    // Process response after brief simulated transmission delay
    setTimeout(() => {
      const reply = this.generateResponse(rawText);
      this.addBubble(reply, 'assistant');
      audioEngine.playTransmissionChirp();
      if (this.voiceEnabled) {
        this.speak(reply);
      }
    }, 450);
  }

  addBubble(text, sender) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;

    const senderLabel = sender === 'assistant' ? 'L.U.N.A v2.0 // MISSION AI' : 'FLIGHT COMMANDER';
    bubble.innerHTML = `<div class="bubble-sender">${senderLabel}</div><div class="bubble-text">${text}</div>`;

    this.chatStream.appendChild(bubble);
    this.chatStream.scrollTop = this.chatStream.scrollHeight;
  }

  generateResponse(query) {
    const qLower = query.toLowerCase();

    // Slash commands
    if (qLower === '/help') {
      return 'L.U.N.A Terminal Commands: /status (check systems), /quiz (jump to flight exam), /random (lunar secret fact), /time (UTC mission elapsed). You can also ask in natural language about regolith, Artemis, Apollo, Chandrayaan, South Pole ice, or moonquakes!';
    }
    if (qLower === '/status') {
      return 'MISSION CONTROL TELEMETRY: All orbital relays operational. Downlink frequency 8.4 GHz locked. Shackleton thermal sensors synced. Core AI status: NOMINAL.';
    }
    if (qLower === '/quiz') {
      const quizSection = document.getElementById('quiz');
      if (quizSection) quizSection.scrollIntoView({ behavior: 'smooth' });
      return 'Redirecting telemetry console to Section 05: Flight Certification Exam!';
    }
    if (qLower === '/random') {
      const facts = [
        'Because there is no atmosphere or wind on the Moon, the footprints left by Apollo astronauts will remain preserved for at least 10 to 100 million years until micrometeorites erode them.',
        'The Moon is not a perfect sphere; it is slightly lemon-shaped with the bulged end pointing toward Earth due to early tidal stretching.',
        'Reflector arrays placed by Apollo 11, 14, 15, and Lunokhod 1 allow scientists on Earth to bounce lasers and measure the Moon\'s exact distance down to millimeters.',
        'The Moon is drifting away from Earth at an average rate of 3.8 cm (1.5 inches) per year.'
      ];
      return facts[Math.floor(Math.random() * facts.length)];
    }

    // Knowledge base matching
    let bestMatch = null;
    let maxHits = 0;

    for (const [key, data] of Object.entries(moonKnowledge)) {
      let hits = 0;
      data.keywords.forEach((word) => {
        if (qLower.includes(word)) hits++;
      });
      if (hits > maxHits) {
        maxHits = hits;
        bestMatch = data;
      }
    }

    if (bestMatch && maxHits > 0) {
      return `[${bestMatch.title.toUpperCase()}]: ${bestMatch.response}`;
    }

    return `Telemetry acknowledged. I am analyzing data regarding "${query}". Lunar regolith exhibits zero moisture content with vacuum insulation. You can query me on the South Pole ice deposits, Apollo 11 landing parameters, the Artemis program, Chandrayaan-3 findings, or Moonquake physics!`;
  }

  speak(text) {
    if (!this.synth) return;
    try {
      this.synth.cancel(); // cancel previous utterance
      // Strip brackets and markdown for clean pronunciation
      const cleanText = text.replace(/\[.*?\]:/g, '').replace(/[\*\_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05; // crisp sci-fi tempo
      utterance.pitch = 1.0;

      // Select female or modern robotic voice if available
      const voices = this.synth.getVoices();
      const preferred = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Zira')));
      if (preferred) utterance.voice = preferred;

      this.synth.speak(utterance);
    } catch (e) {
      // Audio speech fallback
    }
  }
}

/* ==========================================================================
   10. MISSION CLOCK & TICKER MANAGEMENT
   ========================================================================== */
function initMissionClock() {
  const clockEl = document.getElementById('mission-clock');
  if (!clockEl) return;

  // Apollo 11 epoch: July 20, 1969, 20:17:40 UTC
  const apolloLandingEpoch = new Date('1969-07-20T20:17:40Z').getTime();

  function updateClock() {
    const now = Date.now();
    const elapsedMs = now - apolloLandingEpoch;

    const totalSec = Math.floor(elapsedMs / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    const pad = (n) => String(n).padStart(2, '0');
    clockEl.textContent = `T+ ${days}D : ${pad(hours)}H : ${pad(mins)}M : ${pad(secs)}S`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/* Audio Toggle Handler for Top Nav */
function initAudioToggle() {
  const btn = document.getElementById('nav-audio-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isMuted = audioEngine.toggleMute();
    btn.innerHTML = isMuted 
      ? '<span>AUDIO: MUTED</span>' 
      : '<span>AUDIO: LIVE</span>';
    btn.style.color = isMuted ? 'var(--text-muted)' : 'var(--teal)';
    btn.style.borderColor = isMuted ? 'var(--border-subtle)' : 'var(--teal)';
  });
}

/* ==========================================================================
   INITIALIZATION TRIGGER
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  new OrbitSimulator('orbit-canvas');
  initSeismogramMonitor();
  init3DCardTilt();
  initMissionModals();
  initTimelineFiltering();
  new MissionQuizEngine();
  new LunaTerminalAssistant();
  initMissionClock();
  initAudioToggle();

  // First interaction initializes Web Audio context
  document.addEventListener('click', () => audioEngine.init(), { once: true });
});

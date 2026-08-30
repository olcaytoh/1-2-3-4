import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const FRAMES_DIR = '/tmp/sad_frames';
if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
}

const TOTAL_FRAMES = 96; // 4 seconds at 24 fps
const WIDTH = 720;
const HEIGHT = 1280;

console.log('Generating frames for sad lion video...');

for (let i = 0; i < TOTAL_FRAMES; i++) {
  const t = i / TOTAL_FRAMES; // 0 to 1
  const cycle = (i % 48) / 48; // 2 breathing/sniffing cycles

  // Animations
  const breathY = Math.sin(cycle * Math.PI * 2) * 8; // gentle body bobbing
  const earRotate = Math.sin(cycle * Math.PI * 2) * 3; // ear droop wobble
  
  // Tears animation: 2 tears dropping from eyes
  const tearProgress = (i % 32) / 32; // tear falls every 32 frames
  const tearOpacity = tearProgress < 0.1 ? tearProgress * 10 : (tearProgress > 0.8 ? (1 - tearProgress) * 5 : 1);
  const tearYLeft = 600 + tearProgress * 160;
  const tearYRight = 600 + (tearProgress * 160);

  // Second set of tears staggered
  const tear2Progress = ((i + 16) % 32) / 32;
  const tear2Opacity = tear2Progress < 0.1 ? tear2Progress * 10 : (tear2Progress > 0.8 ? (1 - tear2Progress) * 5 : 1);
  const tear2YLeft = 605 + tear2Progress * 150;
  const tear2YRight = 605 + tear2Progress * 150;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
    <defs>
      <!-- Background Gradient -->
      <radialGradient id="bgGrad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#f5f0eb"/>
        <stop offset="60%" stop-color="#e8dfd5"/>
        <stop offset="100%" stop-color="#d4c7b8"/>
      </radialGradient>

      <!-- Floor Shadow -->
      <radialGradient id="floorShadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(80,50,30,0.35)"/>
        <stop offset="60%" stop-color="rgba(80,50,30,0.15)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
      </radialGradient>

      <!-- Lion Body Gradient -->
      <linearGradient id="bodyGrad" x1="30%" y1="0%" x2="70%" y2="100%">
        <stop offset="0%" stop-color="#fde047"/>
        <stop offset="50%" stop-color="#eab308"/>
        <stop offset="100%" stop-color="#ca8a04"/>
      </linearGradient>

      <!-- Belly Gradient -->
      <linearGradient id="bellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#fef08a"/>
        <stop offset="100%" stop-color="#fde047"/>
      </linearGradient>

      <!-- Red Mane Gradient 3D -->
      <radialGradient id="maneGrad" cx="40%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ef4444"/>
        <stop offset="50%" stop-color="#dc2626"/>
        <stop offset="85%" stop-color="#991b1b"/>
        <stop offset="100%" stop-color="#7f1d1d"/>
      </radialGradient>

      <!-- Dark Inner Ear -->
      <linearGradient id="earGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f87171"/>
        <stop offset="100%" stop-color="#dc2626"/>
      </linearGradient>

      <!-- Eye Gloss -->
      <radialGradient id="eyeGrad" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stop-color="#451a03"/>
        <stop offset="70%" stop-color="#1c1917"/>
        <stop offset="100%" stop-color="#0c0a09"/>
      </radialGradient>

      <!-- Tear Droplet Gradient -->
      <linearGradient id="tearGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.95)"/>
        <stop offset="50%" stop-color="rgba(56,189,248,0.85)"/>
        <stop offset="100%" stop-color="rgba(3,105,161,0.9)"/>
      </linearGradient>

      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.25"/>
      </filter>

      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#38bdf8" flood-opacity="0.6"/>
      </filter>
    </defs>

    <!-- BACKGROUND -->
    <rect width="100%" height="100%" fill="url(#bgGrad)"/>

    <!-- TITLE OVERLAY -->
    <g transform="translate(360, 150)" filter="url(#softShadow)">
      <rect x="-240" y="-45" width="480" height="90" rx="30" fill="#dc2626" stroke="#ffffff" stroke-width="6"/>
      <text x="0" y="-8" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="#fef08a" text-anchor="middle" letter-spacing="2">CANLAR BİTTİ!</text>
      <text x="0" y="24" font-family="Arial, sans-serif" font-weight="800" font-size="20" fill="#ffffff" text-anchor="middle">TEKRAR DENE 💪</text>
    </g>

    <!-- BROKEN HEARTS -->
    <g transform="translate(360, 240)">
      <text x="-60" y="0" font-size="40" text-anchor="middle">💔</text>
      <text x="0" y="0" font-size="40" text-anchor="middle">💔</text>
      <text x="60" y="0" font-size="40" text-anchor="middle">💔</text>
    </g>

    <!-- FLOOR SHADOW -->
    <ellipse cx="360" cy="1020" rx="200" ry="35" fill="url(#floorShadow)"/>

    <!-- LION CHARACTER GROUP WITH BREATHING -->
    <g transform="translate(360, ${620 + breathY})">

      <!-- TAIL -->
      <path d="M 110 240 Q 180 220 170 150 Q 165 120 180 100" fill="none" stroke="#eab308" stroke-width="20" stroke-linecap="round"/>
      <circle cx="180" cy="95" r="22" fill="url(#maneGrad)"/>

      <!-- FEET / LEGS -->
      <ellipse cx="-80" cy="330" rx="45" ry="25" fill="#ca8a04" filter="url(#softShadow)"/>
      <ellipse cx="-80" cy="325" rx="40" ry="22" fill="#fde047"/>
      
      <ellipse cx="80" cy="330" rx="45" ry="25" fill="#ca8a04" filter="url(#softShadow)"/>
      <ellipse cx="80" cy="325" rx="40" ry="22" fill="#fde047"/>

      <!-- MAIN BODY -->
      <ellipse cx="0" cy="180" rx="120" ry="150" fill="url(#bodyGrad)" filter="url(#softShadow)"/>
      
      <!-- BELLY -->
      <ellipse cx="0" cy="195" rx="75" ry="105" fill="url(#bellyGrad)"/>

      <!-- PAWS / ARMS drooping downwards -->
      <g transform="translate(-110, 160) rotate(15)">
        <rect x="-25" y="0" width="50" height="110" rx="25" fill="url(#bodyGrad)" filter="url(#softShadow)"/>
        <circle cx="0" cy="95" r="24" fill="#fde047"/>
      </g>
      <g transform="translate(110, 160) rotate(-15)">
        <rect x="-25" y="0" width="50" height="110" rx="25" fill="url(#bodyGrad)" filter="url(#softShadow)"/>
        <circle cx="0" cy="95" r="24" fill="#fde047"/>
      </g>

      <!-- SCARF (Gryffindor style Red & Yellow) -->
      <g transform="translate(0, 50)" filter="url(#softShadow)">
        <path d="M -90 -10 Q 0 25 90 -10 Q 70 35 0 45 Q -70 35 -90 -10 Z" fill="#dc2626"/>
        <!-- Scarf Stripes -->
        <path d="M -60 5 L -50 25 M -20 15 L -10 35 M 20 15 L 30 35 M 60 5 L 70 25" stroke="#facc15" stroke-width="12" stroke-linecap="round"/>
        <!-- Scarf Tail hanging down -->
        <rect x="-25" y="20" width="40" height="90" rx="8" fill="#dc2626" transform="rotate(8)"/>
        <rect x="-23" y="35" width="36" height="14" fill="#facc15" transform="rotate(8)"/>
        <rect x="-23" y="65" width="36" height="14" fill="#facc15" transform="rotate(8)"/>
      </g>

      <!-- BACK MANE LOBES (FLUFFY RED 3D MANE) -->
      <g filter="url(#softShadow)">
        <circle cx="0" cy="-170" r="85" fill="url(#maneGrad)"/>
        <circle cx="-110" cy="-130" r="75" fill="url(#maneGrad)"/>
        <circle cx="110" cy="-130" r="75" fill="url(#maneGrad)"/>
        <circle cx="-150" cy="-40" r="70" fill="url(#maneGrad)"/>
        <circle cx="150" cy="-40" r="70" fill="url(#maneGrad)"/>
        <circle cx="-130" cy="50" r="65" fill="url(#maneGrad)"/>
        <circle cx="130" cy="50" r="65" fill="url(#maneGrad)"/>
        <circle cx="-60" cy="110" r="60" fill="url(#maneGrad)"/>
        <circle cx="60" cy="110" r="60" fill="url(#maneGrad)"/>
        <circle cx="0" cy="120" r="55" fill="url(#maneGrad)"/>
      </g>

      <!-- DROOPING EARS -->
      <g transform="translate(-115, -135) rotate(${15 + earRotate})">
        <ellipse cx="0" cy="0" rx="35" ry="45" fill="url(#bodyGrad)"/>
        <ellipse cx="0" cy="2" rx="22" ry="30" fill="url(#earGrad)"/>
      </g>
      <g transform="translate(115, -135) rotate(${-15 - earRotate})">
        <ellipse cx="0" cy="0" rx="35" ry="45" fill="url(#bodyGrad)"/>
        <ellipse cx="0" cy="2" rx="22" ry="30" fill="url(#earGrad)"/>
      </g>

      <!-- HEAD BASE -->
      <ellipse cx="0" cy="-40" rx="115" ry="100" fill="url(#bodyGrad)" filter="url(#softShadow)"/>

      <!-- CHEEKS (BLUSHING SAD RED) -->
      <ellipse cx="-65" cy="0" rx="28" ry="18" fill="#f87171" opacity="0.5"/>
      <ellipse cx="65" cy="0" rx="28" ry="18" fill="#f87171" opacity="0.5"/>

      <!-- SNCC/MUZZLE -->
      <ellipse cx="0" cy="10" rx="48" ry="36" fill="#fef08a"/>

      <!-- SAD NOSE (HEART/TRIANGLE SHAPE) -->
      <path d="M -16 0 C -16 -12, 0 -14, 0 -2 C 0 -14, 16 -12, 16 0 C 16 12, 0 18, 0 18 C 0 18, -16 12, -16 0 Z" fill="#7f1d1d"/>

      <!-- SAD MOUTH (FROWNING CURVE) -->
      <path d="M -22 28 Q 0 14 22 28" fill="none" stroke="#451a03" stroke-width="5" stroke-linecap="round"/>

      <!-- SAD EYEBROWS (SLANTED INWARDS UPWARDS) -->
      <path d="M -75 -85 Q -45 -105 -20 -85" fill="none" stroke="#7f1d1d" stroke-width="9" stroke-linecap="round"/>
      <path d="M 75 -85 Q 45 -105 20 -85" fill="none" stroke="#7f1d1d" stroke-width="9" stroke-linecap="round"/>

      <!-- BIG GLOSSY SAD EYES -->
      <!-- Left Eye -->
      <g transform="translate(-48, -45)">
        <ellipse cx="0" cy="0" rx="26" ry="34" fill="url(#eyeGrad)"/>
        <!-- White highlight pupil -->
        <circle cx="-8" cy="-10" r="10" fill="#ffffff"/>
        <circle cx="8" cy="10" r="5" fill="#ffffff"/>
        <!-- Tear welling up at bottom of eye -->
        <ellipse cx="0" cy="22" rx="20" ry="8" fill="#7dd3fc" opacity="0.85"/>
      </g>

      <!-- Right Eye -->
      <g transform="translate(48, -45)">
        <ellipse cx="0" cy="0" rx="26" ry="34" fill="url(#eyeGrad)"/>
        <!-- White highlight pupil -->
        <circle cx="-8" cy="-10" r="10" fill="#ffffff"/>
        <circle cx="8" cy="10" r="5" fill="#ffffff"/>
        <!-- Tear welling up at bottom of eye -->
        <ellipse cx="0" cy="22" rx="20" ry="8" fill="#7dd3fc" opacity="0.85"/>
      </g>

      <!-- FALLING TEARS 1 -->
      <g opacity="${tearOpacity}">
        <!-- Left Tear droplet -->
        <path d="M -48 ${tearYLeft - 620} Q -54 ${tearYLeft - 605} -48 ${tearYLeft - 595} Q -42 ${tearYLeft - 605} -48 ${tearYLeft - 620} Z" fill="url(#tearGrad)" filter="url(#glow)"/>
        <!-- Right Tear droplet -->
        <path d="M 48 ${tearYRight - 620} Q 42 ${tearYRight - 605} 48 ${tearYRight - 595} Q 54 ${tearYRight - 605} 48 ${tearYRight - 620} Z" fill="url(#tearGrad)" filter="url(#glow)"/>
      </g>

      <!-- FALLING TEARS 2 (STAGGERED) -->
      <g opacity="${tear2Opacity}">
        <path d="M -52 ${tear2YLeft - 620} Q -58 ${tear2YLeft - 605} -52 ${tear2YLeft - 595} Q -46 ${tear2YLeft - 605} -52 ${tear2YLeft - 620} Z" fill="url(#tearGrad)" filter="url(#glow)"/>
        <path d="M 52 ${tear2YRight - 620} Q 46 ${tear2YRight - 605} 52 ${tear2YRight - 595} Q 58 ${tear2YRight - 605} 52 ${tear2YRight - 620} Z" fill="url(#tearGrad)" filter="url(#glow)"/>
      </g>

      <!-- TOP FOREHEAD TUFT OF MANE -->
      <path d="M -30 -125 Q 0 -175 30 -125 Q 0 -140 -30 -125 Z" fill="url(#maneGrad)"/>

    </g>
  </svg>`;

  const fileName = path.join(FRAMES_DIR, `frame_${String(i).padStart(4, '0')}.svg`);
  fs.writeFileSync(fileName, svg);
}

console.log('All 96 SVG frames generated. Encoding to /public/aslan-sad.mp4...');

const cmd = `ffmpeg -y -framerate 24 -i ${FRAMES_DIR}/frame_%04d.svg -c:v libx264 -pix_fmt yuv420p -vf "scale=720:1280" /app/applet/public/aslan-sad.mp4`;
execSync(cmd, { stdio: 'inherit' });

console.log('SUCCESS: /public/aslan-sad.mp4 created!');

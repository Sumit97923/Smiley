let localStream, peerConnection, isConnected = false, isSearching = false;
let mediaRecorder, audioChunks = [], isRecordingVoice = false;
let typingTimeout;
let remoteStream = null;
let isFullscreenActive = false;
let fullscreenType = null;
let isMuted = false;

let selectedReplyMsgId = null;
let selectedEditMsgId = null;

// 🎨 Real-time Filter & Face Mask Active Variables
let activeFilter = 'none';
let activeMask = 'none';

const badWords = ["abuse1", "abuse2", "gali1", "gali2", "chutiya", "bhenchod", "gand"];

function containsLink(text) {
    const urlPattern = /(https?:\/\/[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/ig;
    return urlPattern.test(text);
}

function filterBadWords(text) {
    let cleanText = text;
    badWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        cleanText = cleanText.replace(regex, "****");
    });
    return cleanText;
}

// ================================================================
// MUTE FEATURE
// ================================================================
function toggleMute() {
    isMuted = !isMuted;
    const muteBtn = document.getElementById('mute-btn');
    
    if (localStream) {
        const audioTracks = localStream.getAudioTracks();
        audioTracks.forEach(track => {
            track.enabled = !isMuted;
        });
    }
    
    if (isMuted) {
        muteBtn.innerHTML = '🔇';
        muteBtn.classList.add('muted');
        statusBanner.innerText = '🔇 You are muted';
    } else {
        muteBtn.innerHTML = '🔊';
        muteBtn.classList.remove('muted');
        statusBanner.innerText = '🔊 You are unmuted';
    }
}

// ================================================================
// FANTASY FEATURES - Girls Attraction
// ================================================================

function sendFantasyPickup() {
    const pickups = [
        '💫 Are you a magician? Because whenever I look at you, everyone else disappears!',
        '🌙 If you were a star, you\'d be the brightest one in my sky!',
        '✨ I must be a snowflake, because I\'ve fallen for you!',
        '💖 Are you made of copper and tellurium? Because you\'re Cu-Te!',
        '🌸 Your smile is like sunshine on a cloudy day!',
        '🌺 If beauty were a crime, you\'d be serving a life sentence!',
        '💕 Are you a camera? Because every time I see you, I smile!',
        '🌟 Do you have a map? I keep getting lost in your eyes!',
        '🌈 You\'re like a rainbow - you make everything brighter!',
        '💫 If you were a flower, you\'d be a beautiful rose!'
    ];
    const random = pickups[Math.floor(Math.random() * pickups.length)];
    if (isConnected) {
        chatInput.value = random;
        sendMsg();
    } else {
        alert('💫 Find a partner first to share magic!');
    }
}

function sendMagicQuestion() {
    const magicQuestions = [
        '🔮 If you could have any magical power, what would it be and why?',
        '✨ What\'s the most magical moment you\'ve ever experienced?',
        '🌙 If you could visit any fantasy world, where would you go?',
        '💫 What\'s your spirit animal and why?',
        '🌟 If you could make one wish come true right now, what would it be?',
        '🌈 What\'s the most beautiful place you\'ve ever seen?',
        '💕 What\'s your favorite childhood memory?',
        '🌸 If you could be any mythical creature, what would you be?',
        '🔮 What\'s the best advice you\'ve ever received?',
        '✨ What\'s something you\'ve always wanted to do but haven\'t yet?'
    ];
    const random = magicQuestions[Math.floor(Math.random() * magicQuestions.length)];
    if (isConnected) {
        chatInput.value = random;
        sendMsg();
    } else {
        alert('🔮 Find a partner first for magic!');
    }
}

function sendIcebreaker(question) {
    if (isConnected) {
        chatInput.value = question;
        sendMsg();
    } else {
        alert('💕 Please find a partner first to start chatting!');
    }
}

function sendCompliment() {
    const compliments = [
        '🌸 You have a beautiful smile!',
        '💕 Your energy is amazing!',
        '✨ You\'re so kind and sweet!',
        '🌺 You light up the room!',
        '💖 You\'re absolutely stunning!',
        '🌈 Your vibe is contagious!',
        '🌹 You\'re one of a kind!',
        '💫 You\'re a star!',
        '🌸 You\'re so lovely!',
        '💕 You make the world better!'
    ];
    const random = compliments[Math.floor(Math.random() * compliments.length)];
    if (isConnected) {
        chatInput.value = random;
        sendMsg();
    } else {
        alert('💕 Please find a partner first!');
    }
}

function sendFunQuestion() {
    const questions = [
        '💕 What\'s your favorite thing about yourself?',
        '🌸 What makes you happy today?',
        '✨ If you could have any superpower, what would it be?',
        '🌺 What\'s your dream vacation destination?',
        '💖 What\'s your favorite memory?',
        '🌈 What\'s your guilty pleasure?',
        '🌹 What\'s the best advice you\'ve ever received?',
        '💫 What\'s something you\'re proud of?',
        '🌸 What\'s your favorite season and why?',
        '💕 What\'s your idea of a perfect day?'
    ];
    const random = questions[Math.floor(Math.random() * questions.length)];
    if (isConnected) {
        chatInput.value = random;
        sendMsg();
    } else {
        alert('💕 Please find a partner first!');
    }
}

function sendCuteCompliment() {
    const cute = [
        '🌸 You\'re like a ray of sunshine!',
        '💕 Your smile is infectious!',
        '✨ You\'re so beautiful inside and out!',
        '🌺 You\'re absolutely adorable!',
        '💖 You have the kindest heart!',
        '🌈 You\'re a beautiful soul!',
        '🌹 You\'re so special!',
        '💫 You\'re amazing just as you are!'
    ];
    const random = cute[Math.floor(Math.random() * cute.length)];
    if (isConnected) {
        chatInput.value = random;
        sendMsg();
    } else {
        alert('💕 Please find a partner first!');
    }
}

// ================================================================
// FULLSCREEN VIDEO FEATURE
// ================================================================
function toggleFullscreen(type) {
    if (isFullscreenActive) {
        closeFullscreen();
        return;
    }
    isFullscreenActive = true;
    fullscreenType = type;
    
    const overlay = document.getElementById('fullscreen-overlay');
    const video = document.getElementById('fullscreen-video');
    const sourceVideo = document.getElementById(type === 'local' ? 'local-video' : 'remote-video');
    
    if (sourceVideo.srcObject) {
        video.srcObject = sourceVideo.srcObject;
        video.muted = type === 'local' ? true : false;
        video.play();
        overlay.classList.add('active');
        overlay.style.display = 'flex';
        
        const sourceCanvas = document.getElementById(type === 'local' ? 'mask-canvas' : 'remote-mask-canvas');
        const targetCanvas = document.getElementById('fullscreen-mask-canvas');
        
        targetCanvas.width = overlay.clientWidth || window.innerWidth;
        targetCanvas.height = overlay.clientHeight || window.innerHeight;
        
        const ctx = targetCanvas.getContext('2d');
        ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
        
        if (sourceCanvas) {
            const sourceCtx = sourceCanvas.getContext('2d');
            const imageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
            
            const scaleX = targetCanvas.width / sourceCanvas.width;
            const scaleY = targetCanvas.height / sourceCanvas.height;
            const scale = Math.min(scaleX, scaleY);
            
            const scaledWidth = sourceCanvas.width * scale;
            const scaledHeight = sourceCanvas.height * scale;
            const offsetX = (targetCanvas.width - scaledWidth) / 2;
            const offsetY = (targetCanvas.height - scaledHeight) / 2;
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = sourceCanvas.width;
            tempCanvas.height = sourceCanvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(imageData, 0, 0);
            
            ctx.drawImage(tempCanvas, offsetX, offsetY, scaledWidth, scaledHeight);
        }
    }
}

function closeFullscreen() {
    isFullscreenActive = false;
    fullscreenType = null;
    const overlay = document.getElementById('fullscreen-overlay');
    const video = document.getElementById('fullscreen-video');
    overlay.classList.remove('active');
    overlay.style.display = 'none';
    video.pause();
    video.srcObject = null;
    
    const canvas = document.getElementById('fullscreen-mask-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateFullscreenMask() {
    if (!isFullscreenActive || !fullscreenType) return;
    
    const sourceCanvas = document.getElementById(fullscreenType === 'local' ? 'mask-canvas' : 'remote-mask-canvas');
    const targetCanvas = document.getElementById('fullscreen-mask-canvas');
    
    if (sourceCanvas && targetCanvas) {
        const ctx = targetCanvas.getContext('2d');
        ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
        
        const sourceCtx = sourceCanvas.getContext('2d');
        const imageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
        
        const scaleX = targetCanvas.width / sourceCanvas.width;
        const scaleY = targetCanvas.height / sourceCanvas.height;
        const scale = Math.min(scaleX, scaleY);
        
        const scaledWidth = sourceCanvas.width * scale;
        const scaledHeight = sourceCanvas.height * scale;
        const offsetX = (targetCanvas.width - scaledWidth) / 2;
        const offsetY = (targetCanvas.height - scaledHeight) / 2;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = sourceCanvas.width;
        tempCanvas.height = sourceCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);
        
        ctx.drawImage(tempCanvas, offsetX, offsetY, scaledWidth, scaledHeight);
    }
}

// ================================================================
// PERMISSION HANDLER
// ================================================================
async function requestCameraPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: true
        });
        stream.getTracks().forEach(t => t.stop());
        return true;
    } catch (err) {
        console.warn("Basic permission failed:", err);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });
            stream.getTracks().forEach(t => t.stop());
            const audioStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });
            audioStream.getTracks().forEach(t => t.stop());
            return true;
        } catch (err2) {
            console.warn("Separate permission failed:", err2);
            return false;
        }
    }
}

async function getMediaStream(constraints) {
    try {
        return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
        console.warn("getUserMedia failed:", err);
        if (constraints.video && constraints.video.deviceId) {
            delete constraints.video.deviceId;
        }
        if (constraints.audio && constraints.audio.deviceId) {
            delete constraints.audio.deviceId;
        }
        try {
            return await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err2) {
            console.warn("Retry without deviceId failed:", err2);
            throw err2;
        }
    }
}

/* ------------------------------------------------------------------ *
 * 🔒 CONSENT / PRIVACY GATE
 * ------------------------------------------------------------------ */
const consentGate = document.getElementById('consent-gate');
const consentAge = document.getElementById('consent-age');
const consentBlurDefault = document.getElementById('consent-blur-default');
const consentContinue = document.getElementById('consent-continue');
const consentWarning = document.getElementById('consent-warning');

function beginSession() {
    consentGate.style.display = 'none';
    activeFilter = 'none';
    startMedia();
}

consentContinue.addEventListener('click', async () => {
    if (!consentAge.checked) {
        consentWarning.classList.remove('hidden');
        return;
    }
    consentWarning.classList.add('hidden');
    try {
        localStorage.setItem('smiley_consent_v1', '1');
        localStorage.setItem('smiley_blur_default', consentBlurDefault.checked ? '1' : '0');
    } catch (e) { }
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
        alert("Please allow Camera and Microphone access in your browser settings.");
    }
    beginSession();
});

consentAge.addEventListener('change', () => {
    if (consentAge.checked) consentWarning.classList.add('hidden');
});

(function autoSkipGateIfReturning() {
    try {
        if (localStorage.getItem('smiley_consent_v1') === '1') {
            const blurPref = localStorage.getItem('smiley_blur_default');
            consentBlurDefault.checked = blurPref === '1';
            activeFilter = 'none';
            beginSession();
        }
    } catch (e) { }
})();

/* ------------------------------------------------------------------ *
 * 🔌 Socket.IO connection
 * ------------------------------------------------------------------ */
let socket;
try {
    socket = io();
} catch (e) {
    console.error("Socket.IO failed to connect", e);
    socket = { on: () => {}, emit: () => {} };
    const banner = document.getElementById('status-banner');
    if (banner) banner.innerText = "⚠️ Can't reach chat server — start server.js and reload.";
}

/* ------------------------------------------------------------------ *
 * 🎨 Filters & Masks
 * ------------------------------------------------------------------ */
function setActiveBadge(selector, value) {
    document.querySelectorAll(selector).forEach(btn => {
        const key = btn.dataset.filter !== undefined ? btn.dataset.filter : btn.dataset.mask;
        btn.classList.toggle('is-active', key === value);
    });
}

function applyFilter(filterName, isRemote = false) {
    const videoId = isRemote ? 'remote-video' : 'local-video';
    const videoEl = document.getElementById(videoId);
    if (!videoEl) return;
    videoEl.className = "w-full h-full object-cover transition-all duration-300";
    if (filterName === 'blur') {
        videoEl.classList.add('video-blur');
    }
    if (!isRemote) {
        activeFilter = filterName;
        setActiveBadge('.filter-badge[data-filter]', filterName);
        if (isConnected) {
            socket.emit('effect-sync', { type: 'filter', name: filterName });
        }
    }
}

/* ================================================================
 * 🎭 MASK DEFINITIONS - Complete with ALL masks
 * ================================================================ */
const MASK_DEFS = {
    // 💎 DIAMOND
    diamond: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            const gradient = ctx.createLinearGradient(0, -1, 0, 1);
            gradient.addColorStop(0, '#8b5cf6');
            gradient.addColorStop(0.5, '#7c3aed');
            gradient.addColorStop(1, '#6d28d9');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#4c1d95';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.moveTo(0, -0.9);
            ctx.lineTo(0.7, 0);
            ctx.lineTo(0, 0.9);
            ctx.lineTo(-0.7, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = 'rgba(196, 181, 253, 0.3)';
            ctx.beginPath();
            ctx.moveTo(0, -0.7);
            ctx.lineTo(0.5, 0);
            ctx.lineTo(0, 0.7);
            ctx.lineTo(-0.5, 0);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowColor = '#8b5cf6';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(-0.2, -0.3, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.2, 0.3, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#4c1d95';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.moveTo(-0.3, -0.05);
            ctx.lineTo(-0.15, -0.15);
            ctx.lineTo(0, -0.05);
            ctx.lineTo(-0.15, 0.05);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.3, -0.05);
            ctx.lineTo(0.15, -0.15);
            ctx.lineTo(0, -0.05);
            ctx.lineTo(0.15, 0.05);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#4c1d95';
            ctx.beginPath();
            ctx.arc(-0.15, -0.05, 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.15, -0.05, 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#4c1d95';
            ctx.lineWidth = 0.015;
            ctx.beginPath();
            ctx.moveTo(-0.15, 0.25);
            ctx.quadraticCurveTo(0, 0.35, 0.15, 0.25);
            ctx.stroke();
        }
    },
    // ⚪ ROUND
    round: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
            gradient.addColorStop(0, '#fbbf24');
            gradient.addColorStop(0.7, '#f59e0b');
            gradient.addColorStop(1, '#d97706');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#b45309';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.7, 0.85, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = 'rgba(252, 211, 77, 0.3)';
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.55, 0.65, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#b45309';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(-0.22, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0.22, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.arc(-0.22, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.22, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.ellipse(0, 0.3, 0.06, 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(251, 146, 60, 0.3)';
            ctx.beginPath();
            ctx.ellipse(-0.35, 0.18, 0.08, 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.35, 0.18, 0.08, 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    // ❤️ HEART
    heart: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            const gradient = ctx.createRadialGradient(0, -0.2, 0, 0, 0, 1);
            gradient.addColorStop(0, '#fb7185');
            gradient.addColorStop(0.6, '#f43f5e');
            gradient.addColorStop(1, '#e11d48');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#be123c';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.moveTo(0, 0.6);
            ctx.bezierCurveTo(-0.7, 0.3, -0.8, -0.3, -0.45, -0.6);
            ctx.bezierCurveTo(-0.15, -0.8, 0, -0.5, 0, -0.5);
            ctx.bezierCurveTo(0, -0.5, 0.15, -0.8, 0.45, -0.6);
            ctx.bezierCurveTo(0.8, -0.3, 0.7, 0.3, 0, 0.6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = 'rgba(252, 165, 165, 0.2)';
            ctx.beginPath();
            ctx.moveTo(0, 0.4);
            ctx.bezierCurveTo(-0.45, 0.2, -0.5, -0.2, -0.25, -0.4);
            ctx.bezierCurveTo(-0.08, -0.5, 0, -0.3, 0, -0.3);
            ctx.bezierCurveTo(0, -0.3, 0.08, -0.5, 0.25, -0.4);
            ctx.bezierCurveTo(0.5, -0.2, 0.45, 0.2, 0, 0.4);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#be123c';
            ctx.lineWidth = 0.015;
            ctx.beginPath();
            ctx.moveTo(-0.18, -0.02);
            ctx.quadraticCurveTo(-0.28, -0.12, -0.14, -0.12);
            ctx.quadraticCurveTo(0, -0.12, -0.08, -0.02);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.18, -0.02);
            ctx.quadraticCurveTo(0.28, -0.12, 0.14, -0.12);
            ctx.quadraticCurveTo(0, -0.12, 0.08, -0.02);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#be123c';
            ctx.beginPath();
            ctx.arc(-0.14, -0.06, 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.14, -0.06, 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#be123c';
            ctx.beginPath();
            ctx.moveTo(-0.06, 0.25);
            ctx.quadraticCurveTo(0, 0.32, 0.06, 0.25);
            ctx.quadraticCurveTo(0, 0.18, -0.06, 0.25);
            ctx.closePath();
            ctx.fill();
        }
    },
    // 🥚 OVAL
    oval: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            const gradient = ctx.createLinearGradient(0, -1, 0, 1);
            gradient.addColorStop(0, '#93c5fd');
            gradient.addColorStop(0.5, '#60a5fa');
            gradient.addColorStop(1, '#3b82f6');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.6, 0.9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = 'rgba(147, 197, 253, 0.3)';
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.4, 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(-0.2, 0, 0.1, 0.14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0.2, 0, 0.1, 0.14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#2563eb';
            ctx.beginPath();
            ctx.arc(-0.2, 0.02, 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.2, 0.02, 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 0.015;
            ctx.beginPath();
            ctx.moveTo(-0.3, -0.12);
            ctx.quadraticCurveTo(-0.2, -0.18, -0.1, -0.12);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.1, -0.12);
            ctx.quadraticCurveTo(0.2, -0.18, 0.3, -0.12);
            ctx.stroke();
            ctx.fillStyle = '#2563eb';
            ctx.beginPath();
            ctx.ellipse(0, 0.3, 0.06, 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    // 👸 PRINCESS
    princess: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
            gradient.addColorStop(0, '#fce7f3');
            gradient.addColorStop(0.6, '#fbcfe8');
            gradient.addColorStop(1, '#f9a8d4');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#db2777';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.65, 0.9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fbbf24';
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.moveTo(-0.5, -0.6);
            ctx.lineTo(-0.4, -0.85);
            ctx.lineTo(-0.25, -0.7);
            ctx.lineTo(-0.1, -0.9);
            ctx.lineTo(0.05, -0.7);
            ctx.lineTo(0.2, -0.9);
            ctx.lineTo(0.35, -0.7);
            ctx.lineTo(0.5, -0.85);
            ctx.lineTo(0.6, -0.6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(-0.1, -0.85, 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.arc(0.2, -0.85, 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.arc(-0.35, -0.8, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.45, -0.8, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#db2777';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(-0.2, 0, 0.12, 0.16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0.2, 0, 0.12, 0.16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#db2777';
            ctx.beginPath();
            ctx.arc(-0.2, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.2, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-0.16, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.24, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(251, 146, 60, 0.3)';
            ctx.beginPath();
            ctx.ellipse(-0.32, 0.18, 0.08, 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.32, 0.18, 0.08, 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#db2777';
            ctx.beginPath();
            ctx.arc(0, 0.3, 0.05, 0, Math.PI);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(0, 0.28, 0.025, 0, Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#db2777';
            ctx.lineWidth = 0.01;
            for (let i = -3; i <= 3; i++) {
                const x = -0.2 + i * 0.04;
                ctx.beginPath();
                ctx.moveTo(x, -0.16);
                ctx.lineTo(x + 0.02, -0.2);
                ctx.stroke();
            }
            for (let i = -3; i <= 3; i++) {
                const x = 0.2 + i * 0.04;
                ctx.beginPath();
                ctx.moveTo(x, -0.16);
                ctx.lineTo(x + 0.02, -0.2);
                ctx.stroke();
            }
        }
    },
    // 🦄 UNICORN
    unicorn: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
            gradient.addColorStop(0, '#fce7f3');
            gradient.addColorStop(0.6, '#f5d0fe');
            gradient.addColorStop(1, '#e9d5ff');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#7c3aed';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.65, 0.85, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            const hornGradient = ctx.createLinearGradient(-0.1, -0.9, 0.1, -0.5);
            hornGradient.addColorStop(0, '#fbbf24');
            hornGradient.addColorStop(0.5, '#f59e0b');
            hornGradient.addColorStop(1, '#fcd34d');
            ctx.fillStyle = hornGradient;
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 0.015;
            ctx.beginPath();
            ctx.moveTo(-0.05, -0.5);
            ctx.lineTo(0, -1.0);
            ctx.lineTo(0.05, -0.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 0.01;
            for (let i = 0; i < 5; i++) {
                const y = -0.6 - i * 0.08;
                ctx.beginPath();
                ctx.arc(0, y, 0.03 + i * 0.005, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, -0.95, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#7c3aed';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(-0.2, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0.2, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#7c3aed';
            ctx.beginPath();
            ctx.arc(-0.2, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.2, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-0.16, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.24, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(236, 72, 153, 0.2)';
            ctx.beginPath();
            ctx.ellipse(-0.32, 0.18, 0.08, 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.32, 0.18, 0.08, 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#7c3aed';
            ctx.beginPath();
            ctx.arc(0, 0.3, 0.05, 0, Math.PI);
            ctx.fill();
            const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'];
            colors.forEach((color, i) => {
                ctx.fillStyle = color;
                const angle = (i / colors.length) * Math.PI * 2;
                ctx.beginPath();
                ctx.arc(Math.sin(angle) * 0.45, -0.4 + Math.cos(angle) * 0.1, 0.12, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    },
    // 🐰 BUNNY CUTE
    bunny_cute: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fef3c7';
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.65, 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fef3c7';
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.moveTo(-0.32, -0.3);
            ctx.quadraticCurveTo(-0.45, -0.9, -0.18, -0.9);
            ctx.quadraticCurveTo(-0.13, -0.6, -0.22, -0.3);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.32, -0.3);
            ctx.quadraticCurveTo(0.45, -0.9, 0.18, -0.9);
            ctx.quadraticCurveTo(0.13, -0.6, 0.22, -0.3);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fbcfe8';
            ctx.strokeStyle = '#f9a8d4';
            ctx.lineWidth = 0.01;
            ctx.beginPath();
            ctx.moveTo(-0.27, -0.35);
            ctx.quadraticCurveTo(-0.35, -0.75, -0.22, -0.75);
            ctx.quadraticCurveTo(-0.18, -0.55, -0.22, -0.35);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.27, -0.35);
            ctx.quadraticCurveTo(0.35, -0.75, 0.22, -0.75);
            ctx.quadraticCurveTo(0.18, -0.55, 0.22, -0.35);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(-0.18, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0.18, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.arc(-0.18, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.18, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-0.14, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.22, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f472b6';
            ctx.beginPath();
            ctx.arc(0, 0.12, 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 0.01;
            ctx.beginPath();
            ctx.moveTo(-0.08, 0.12);
            ctx.lineTo(-0.25, 0.08);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-0.08, 0.15);
            ctx.lineTo(-0.25, 0.15);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.08, 0.12);
            ctx.lineTo(0.25, 0.08);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.08, 0.15);
            ctx.lineTo(0.25, 0.15);
            ctx.stroke();
            ctx.fillStyle = '#f472b6';
            ctx.beginPath();
            ctx.arc(0, 0.22, 0.04, 0, Math.PI);
            ctx.fill();
            ctx.fillStyle = 'rgba(251, 146, 60, 0.2)';
            ctx.beginPath();
            ctx.ellipse(-0.3, 0.15, 0.07, 0.04, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.3, 0.15, 0.07, 0.04, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    // 🐱 CUTE CAT
    cat_cute: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
            gradient.addColorStop(0, '#fef3c7');
            gradient.addColorStop(0.7, '#fde68a');
            gradient.addColorStop(1, '#f59e0b');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.65, 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#f59e0b';
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.moveTo(-0.45, -0.2);
            ctx.lineTo(-0.65, -0.6);
            ctx.lineTo(-0.25, -0.4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.45, -0.2);
            ctx.lineTo(0.65, -0.6);
            ctx.lineTo(0.25, -0.4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fbcfe8';
            ctx.strokeStyle = '#f9a8d4';
            ctx.lineWidth = 0.01;
            ctx.beginPath();
            ctx.moveTo(-0.5, -0.25);
            ctx.lineTo(-0.6, -0.5);
            ctx.lineTo(-0.35, -0.4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.5, -0.25);
            ctx.lineTo(0.6, -0.5);
            ctx.lineTo(0.35, -0.4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(-0.18, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0.18, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.ellipse(-0.18, 0.02, 0.03, 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.18, 0.02, 0.03, 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-0.15, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.21, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f472b6';
            ctx.beginPath();
            ctx.moveTo(0, 0.12);
            ctx.lineTo(-0.04, 0.18);
            ctx.lineTo(0.04, 0.18);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 0.01;
            ctx.beginPath();
            ctx.moveTo(-0.08, 0.14);
            ctx.lineTo(-0.25, 0.1);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-0.08, 0.16);
            ctx.lineTo(-0.25, 0.16);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.08, 0.14);
            ctx.lineTo(0.25, 0.1);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.08, 0.16);
            ctx.lineTo(0.25, 0.16);
            ctx.stroke();
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 0.01;
            ctx.beginPath();
            ctx.moveTo(-0.05, 0.2);
            ctx.quadraticCurveTo(0, 0.25, 0.05, 0.2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(251, 146, 60, 0.2)';
            ctx.beginPath();
            ctx.ellipse(-0.3, 0.15, 0.07, 0.04, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.3, 0.15, 0.07, 0.04, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    // 🦊 FOX
    fox: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
            gradient.addColorStop(0, '#fb923c');
            gradient.addColorStop(0.7, '#f97316');
            gradient.addColorStop(1, '#ea580c');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#9a3412';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.moveTo(-0.45, -0.4);
            ctx.quadraticCurveTo(-0.65, 0, -0.45, 0.5);
            ctx.quadraticCurveTo(0, 0.8, 0.45, 0.5);
            ctx.quadraticCurveTo(0.65, 0, 0.45, -0.4);
            ctx.quadraticCurveTo(0.18, -0.6, 0, -0.6);
            ctx.quadraticCurveTo(-0.18, -0.6, -0.45, -0.4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fef3c7';
            ctx.strokeStyle = '#9a3412';
            ctx.lineWidth = 0.015;
            ctx.beginPath();
            ctx.moveTo(-0.35, 0.15);
            ctx.quadraticCurveTo(0, 0.5, 0.35, 0.15);
            ctx.quadraticCurveTo(0.18, 0.3, 0, 0.35);
            ctx.quadraticCurveTo(-0.18, 0.3, -0.35, 0.15);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ea580c';
            ctx.strokeStyle = '#9a3412';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.moveTo(-0.4, -0.35);
            ctx.lineTo(-0.6, -0.8);
            ctx.lineTo(-0.22, -0.45);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.4, -0.35);
            ctx.lineTo(0.6, -0.8);
            ctx.lineTo(0.22, -0.45);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fbcfe8';
            ctx.beginPath();
            ctx.moveTo(-0.45, -0.4);
            ctx.lineTo(-0.55, -0.7);
            ctx.lineTo(-0.3, -0.45);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(0.45, -0.4);
            ctx.lineTo(0.55, -0.7);
            ctx.lineTo(0.3, -0.45);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#9a3412';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(-0.2, -0.02, 0.1, 0.13, -0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0.2, -0.02, 0.1, 0.13, 0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#9a3412';
            ctx.beginPath();
            ctx.arc(-0.2, -0.02, 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.2, -0.02, 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.arc(0, 0.15, 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#9a3412';
            ctx.lineWidth = 0.01;
            ctx.beginPath();
            ctx.moveTo(-0.05, 0.2);
            ctx.quadraticCurveTo(0, 0.25, 0.05, 0.2);
            ctx.stroke();
        }
    },
    // 🐼 PANDA
    panda: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#f5f5f0';
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.7, 0.85, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.ellipse(-0.25, -0.02, 0.2, 0.22, -0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.25, -0.02, 0.2, 0.22, 0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f5f5f0';
            ctx.beginPath();
            ctx.ellipse(-0.22, 0, 0.08, 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.22, 0, 0.08, 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.ellipse(-0.22, 0, 0.03, 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.22, 0, 0.03, 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.arc(0, 0.3, 0.07, 0, Math.PI);
            ctx.fill();
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 0.015;
            ctx.beginPath();
            ctx.moveTo(-0.12, 0.25);
            ctx.lineTo(-0.25, 0.35);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.12, 0.25);
            ctx.lineTo(0.25, 0.35);
            ctx.stroke();
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.arc(-0.55, -0.3, 0.13, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.55, -0.3, 0.13, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f5f5f0';
            ctx.beginPath();
            ctx.arc(-0.55, -0.3, 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.55, -0.3, 0.04, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    // 🐨 KOALA
    koala: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
            gradient.addColorStop(0, '#9ca3af');
            gradient.addColorStop(0.7, '#6b7280');
            gradient.addColorStop(1, '#4b5563');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.7, 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#9ca3af';
            ctx.strokeStyle = '#6b7280';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.arc(-0.5, -0.3, 0.22, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0.5, -0.3, 0.22, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#d1d5db';
            ctx.beginPath();
            ctx.arc(-0.5, -0.3, 0.13, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.5, -0.3, 0.13, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(-0.2, 0, 0.14, 0.16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0.2, 0, 0.14, 0.16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.arc(-0.2, 0.02, 0.06, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.2, 0.02, 0.06, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-0.16, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.24, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.ellipse(0, 0.18, 0.07, 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 0.01;
            ctx.beginPath();
            ctx.arc(0, 0.25, 0.05, 0.1, Math.PI - 0.1);
            ctx.stroke();
            ctx.fillStyle = 'rgba(251, 146, 60, 0.15)';
            ctx.beginPath();
            ctx.ellipse(-0.32, 0.15, 0.07, 0.04, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.32, 0.15, 0.07, 0.04, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    // 🧜‍♀️ MERMAID
    mermaid: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
            gradient.addColorStop(0, '#a5f3fc');
            gradient.addColorStop(0.6, '#67e8f9');
            gradient.addColorStop(1, '#06b6d4');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#0891b2';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.7, 0.85, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 0.01;
            for (let i = -5; i <= 5; i++) {
                for (let j = -3; j <= 3; j++) {
                    ctx.beginPath();
                    ctx.arc(i * 0.12, 0.2 + j * 0.12, 0.05, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            ctx.fillStyle = '#fcd34d';
            ctx.strokeStyle = '#d97706';
            ctx.lineWidth = 0.015;
            ctx.beginPath();
            ctx.arc(-0.2, 0.55, 0.12, 0, Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0.2, 0.55, 0.12, 0, Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#0891b2';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(-0.2, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0.2, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#0891b2';
            ctx.beginPath();
            ctx.arc(-0.2, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.2, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-0.16, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.24, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(251, 146, 60, 0.2)';
            ctx.beginPath();
            ctx.ellipse(-0.32, 0.18, 0.08, 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.32, 0.18, 0.08, 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fb7185';
            ctx.beginPath();
            ctx.arc(0, 0.3, 0.05, 0, Math.PI);
            ctx.fill();
        }
    },
    // 🧚 FAIRY
    fairy: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
            gradient.addColorStop(0, '#fdf4ff');
            gradient.addColorStop(0.6, '#f3e8ff');
            gradient.addColorStop(1, '#e9d5ff');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.65, 0.85, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.strokeStyle = '#d8b4fe';
            ctx.lineWidth = 0.01;
            ctx.beginPath();
            ctx.moveTo(-0.6, -0.1);
            ctx.quadraticCurveTo(-0.9, -0.3, -0.7, -0.6);
            ctx.quadraticCurveTo(-0.5, -0.4, -0.5, -0.1);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.6, -0.1);
            ctx.quadraticCurveTo(0.9, -0.3, 0.7, -0.6);
            ctx.quadraticCurveTo(0.5, -0.4, 0.5, -0.1);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 10;
            const sparkles = [[-0.3, -0.3], [0.3, -0.3], [0, -0.5], [-0.4, 0.3], [0.4, 0.3]];
            sparkles.forEach(pos => {
                ctx.beginPath();
                ctx.arc(pos[0], pos[1], 0.03, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(-0.2, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0.2, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#8b5cf6';
            ctx.beginPath();
            ctx.arc(-0.2, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.2, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-0.16, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.24, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(251, 146, 60, 0.2)';
            ctx.beginPath();
            ctx.ellipse(-0.32, 0.18, 0.08, 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.32, 0.18, 0.08, 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#d946ef';
            ctx.beginPath();
            ctx.arc(0, 0.3, 0.05, 0, Math.PI);
            ctx.fill();
        }
    },
    // 👼 ANGEL
    angel: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
            gradient.addColorStop(0, '#fefce8');
            gradient.addColorStop(0.6, '#fef9c3');
            gradient.addColorStop(1, '#fde68a');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.65, 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 0.025;
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.ellipse(0, -0.55, 0.3, 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 0.01;
            ctx.beginPath();
            ctx.moveTo(-0.5, 0);
            ctx.quadraticCurveTo(-0.8, -0.2, -0.6, -0.5);
            ctx.quadraticCurveTo(-0.4, -0.3, -0.4, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.5, 0);
            ctx.quadraticCurveTo(0.8, -0.2, 0.6, -0.5);
            ctx.quadraticCurveTo(0.4, -0.3, 0.4, 0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(-0.2, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0.2, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ca8a04';
            ctx.beginPath();
            ctx.arc(-0.2, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.2, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-0.16, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.24, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(251, 146, 60, 0.15)';
            ctx.beginPath();
            ctx.ellipse(-0.32, 0.18, 0.08, 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.32, 0.18, 0.08, 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f472b6';
            ctx.beginPath();
            ctx.arc(0, 0.3, 0.05, 0, Math.PI);
            ctx.fill();
        }
    },
    // 🦋 BUTTERFLY
    butterfly: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
            gradient.addColorStop(0, '#fae8ff');
            gradient.addColorStop(0.6, '#f3e8ff');
            gradient.addColorStop(1, '#e9d5ff');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#7c3aed';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.65, 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            const wingColors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6'];
            wingColors.forEach((color, i) => {
                ctx.fillStyle = color;
                ctx.globalAlpha = 0.3;
                const angle = (i / wingColors.length) * Math.PI * 2;
                const x = Math.sin(angle) * 0.35;
                const y = -0.2 + Math.cos(angle) * 0.2;
                ctx.beginPath();
                ctx.ellipse(x, y, 0.15, 0.2, angle * 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.strokeStyle = '#7c3aed';
                ctx.lineWidth = 0.005;
                ctx.stroke();
            });
            ctx.strokeStyle = '#7c3aed';
            ctx.lineWidth = 0.015;
            ctx.beginPath();
            ctx.moveTo(-0.1, -0.35);
            ctx.quadraticCurveTo(-0.25, -0.5, -0.15, -0.55);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.1, -0.35);
            ctx.quadraticCurveTo(0.25, -0.5, 0.15, -0.55);
            ctx.stroke();
            ctx.fillStyle = '#7c3aed';
            ctx.beginPath();
            ctx.arc(-0.15, -0.55, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.15, -0.55, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#7c3aed';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(-0.2, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0.2, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#7c3aed';
            ctx.beginPath();
            ctx.arc(-0.2, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.2, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-0.16, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.24, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(251, 146, 60, 0.15)';
            ctx.beginPath();
            ctx.ellipse(-0.32, 0.18, 0.08, 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.32, 0.18, 0.08, 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#d946ef';
            ctx.beginPath();
            ctx.arc(0, 0.3, 0.05, 0, Math.PI);
            ctx.fill();
        }
    },
    // ✨ STARRY
    starry: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
            gradient.addColorStop(0, '#1e1b4b');
            gradient.addColorStop(0.7, '#312e81');
            gradient.addColorStop(1, '#4c1d95');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.7, 0.85, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 8;
            const stars = [
                [-0.3, -0.3], [0.3, -0.3], [0, -0.5],
                [-0.4, 0.1], [0.4, 0.1], [-0.2, 0.4],
                [0.2, 0.4], [0, 0.5], [-0.5, -0.1],
                [0.5, -0.1], [-0.3, 0.3], [0.3, 0.3]
            ];
            stars.forEach(pos => {
                ctx.beginPath();
                const size = 0.03 + Math.random() * 0.025;
                for (let i = 0; i < 5; i++) {
                    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                    const x = pos[0] + Math.cos(angle) * size;
                    const y = pos[1] + Math.sin(angle) * size;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                    const angle2 = ((i + 0.5) / 5) * Math.PI * 2 - Math.PI / 2;
                    const x2 = pos[0] + Math.cos(angle2) * size * 0.5;
                    const y2 = pos[1] + Math.sin(angle2) * size * 0.5;
                    ctx.lineTo(x2, y2);
                }
                ctx.closePath();
                ctx.fill();
            });
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fef3c7';
            ctx.shadowColor = '#fef3c7';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(0.4, -0.4, 0.08, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(-0.2, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0.2, 0, 0.12, 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#8b5cf6';
            ctx.beginPath();
            ctx.arc(-0.2, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.2, 0.02, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-0.16, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0.24, -0.03, 0.03, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#d946ef';
            ctx.beginPath();
            ctx.arc(0, 0.3, 0.05, 0, Math.PI);
            ctx.fill();
        }
    },
    // SPIDERMAN
    spiderman: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#cc0000';
            ctx.strokeStyle = '#1a1a2e';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.8, 1.0, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#1a1a2e';
            ctx.lineWidth = 0.03;
            ctx.beginPath();
            ctx.ellipse(-0.3, 0, 0.28, 0.42, -0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0.3, 0, 0.28, 0.42, 0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#1a1a2e';
            ctx.strokeStyle = '#1a1a2e';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(-0.3, 0.02, 0.1, 0.16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.3, 0.02, 0.1, 0.16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#1a1a2e';
            ctx.lineWidth = 0.015;
            for (let i = -6; i <= 6; i++) {
                const x = i * 0.1;
                ctx.beginPath();
                ctx.moveTo(x, -0.5);
                ctx.lineTo(x * 0.3, 0.7);
                ctx.stroke();
            }
            for (let i = -3; i <= 3; i++) {
                const y = i * 0.13 + 0.1;
                ctx.beginPath();
                ctx.moveTo(-0.65, y);
                ctx.lineTo(0.65, y * 0.7);
                ctx.stroke();
            }
            ctx.fillStyle = '#1a1a2e';
            ctx.beginPath();
            ctx.arc(0, 0.75, 0.07, 0, Math.PI * 2);
            ctx.fill();
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(0, 0.75);
                ctx.lineTo(Math.cos(angle) * 0.18, 0.75 + Math.sin(angle) * 0.18);
                ctx.stroke();
            }
            ctx.strokeStyle = '#1a1a2e';
            ctx.lineWidth = 0.025;
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.75, 0.95, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
    },
    // GHOST
    ghost: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowColor = 'rgba(100, 200, 255, 0.3)';
            ctx.shadowBlur = 20;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.strokeStyle = 'rgba(200, 230, 255, 0.5)';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.7, 0.9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.beginPath();
            ctx.moveTo(-0.7, 0.7);
            for (let i = 0; i <= 10; i++) {
                const x = -0.7 + (i / 10) * 1.4;
                const y = 0.7 + Math.sin(i * 0.8) * 0.1;
                ctx.lineTo(x, y);
            }
            ctx.lineTo(0.7, 0.1);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#1a1a2e';
            ctx.beginPath();
            ctx.ellipse(-0.22, -0.05, 0.18, 0.22, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.22, -0.05, 0.18, 0.22, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
            ctx.beginPath();
            ctx.ellipse(-0.22, -0.05, 0.07, 0.09, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.22, -0.05, 0.07, 0.09, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1a1a2e';
            ctx.beginPath();
            ctx.ellipse(0, 0.3, 0.08, 0.13, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    // VENOM
    venom: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
            gradient.addColorStop(0, '#1a1a1a');
            gradient.addColorStop(0.7, '#0d0d0d');
            gradient.addColorStop(1, '#000000');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#2a2a2a';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.moveTo(-0.6, -0.5);
            ctx.quadraticCurveTo(-0.8, 0, -0.6, 0.6);
            ctx.quadraticCurveTo(-0.25, 0.85, 0, 0.75);
            ctx.quadraticCurveTo(0.25, 0.85, 0.6, 0.6);
            ctx.quadraticCurveTo(0.8, 0, 0.6, -0.5);
            ctx.quadraticCurveTo(0.25, -0.65, 0, -0.65);
            ctx.quadraticCurveTo(-0.25, -0.65, -0.6, -0.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#1a1a2e';
            ctx.lineWidth = 0.025;
            ctx.beginPath();
            ctx.ellipse(-0.26, -0.08, 0.22, 0.32, -0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0.26, -0.08, 0.22, 0.32, 0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#1a1a2e';
            ctx.beginPath();
            ctx.ellipse(-0.26, -0.04, 0.035, 0.13, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.26, -0.04, 0.035, 0.13, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
            ctx.shadowBlur = 5;
            for (let i = -4; i <= 4; i++) {
                const x = i * 0.1;
                ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#e0e0e0';
                ctx.beginPath();
                ctx.moveTo(x - 0.035, 0.32);
                ctx.lineTo(x, 0.45 + Math.abs(i) * 0.018);
                ctx.lineTo(x + 0.035, 0.32);
                ctx.closePath();
                ctx.fill();
            }
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(50, 50, 50, 0.5)';
            ctx.lineWidth = 0.01;
            for (let i = -5; i <= 5; i++) {
                const x = i * 0.12;
                ctx.beginPath();
                ctx.moveTo(x, -0.45);
                ctx.quadraticCurveTo(x + 0.08, 0, x, 0.55);
                ctx.stroke();
            }
        }
    },
    // CAT FULL
    cat_full: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#2d1b0e';
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(0, 0.15, 0.7, 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#2d1b0e';
            ctx.beginPath();
            ctx.moveTo(-0.6, -0.3);
            ctx.lineTo(-0.4, -0.75);
            ctx.lineTo(-0.25, -0.4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.6, -0.3);
            ctx.lineTo(0.4, -0.75);
            ctx.lineTo(0.25, -0.4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#f4a4b8';
            ctx.beginPath();
            ctx.moveTo(-0.5, -0.35);
            ctx.lineTo(-0.4, -0.6);
            ctx.lineTo(-0.35, -0.4);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(0.5, -0.35);
            ctx.lineTo(0.4, -0.6);
            ctx.lineTo(0.35, -0.4);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#f4d03f';
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 0.025;
            ctx.beginPath();
            ctx.ellipse(-0.22, 0, 0.18, 0.22, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0.22, 0, 0.18, 0.22, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.ellipse(-0.22, 0, 0.025, 0.18, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.22, 0, 0.025, 0.18, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f4a4b8';
            ctx.beginPath();
            ctx.moveTo(0, 0.15);
            ctx.lineTo(-0.05, 0.22);
            ctx.lineTo(0.05, 0.22);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 0.01;
            [-1, 1].forEach(side => {
                for (let i = -2; i <= 2; i++) {
                    ctx.beginPath();
                    ctx.moveTo(side * 0.12, 0.2 + i * 0.05);
                    ctx.lineTo(side * 0.5, 0.1 + i * 0.07);
                    ctx.stroke();
                }
            });
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 0.015;
            ctx.beginPath();
            ctx.moveTo(0, 0.22);
            ctx.quadraticCurveTo(-0.07, 0.3, -0.1, 0.26);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, 0.22);
            ctx.quadraticCurveTo(0.07, 0.3, 0.1, 0.26);
            ctx.stroke();
        }
    },
    // IRONMAN
    ironman: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
            gradient.addColorStop(0, '#c41e3a');
            gradient.addColorStop(0.6, '#8b0000');
            gradient.addColorStop(1, '#4a0000');
            ctx.fillStyle = gradient;
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 0.025;
            ctx.beginPath();
            ctx.moveTo(-0.6, -0.3);
            ctx.quadraticCurveTo(-0.7, 0.1, -0.6, 0.5);
            ctx.quadraticCurveTo(-0.35, 0.65, 0, 0.65);
            ctx.quadraticCurveTo(0.35, 0.65, 0.6, 0.5);
            ctx.quadraticCurveTo(0.7, 0.1, 0.6, -0.3);
            ctx.quadraticCurveTo(0.4, -0.55, 0, -0.55);
            ctx.quadraticCurveTo(-0.4, -0.55, -0.6, -0.3);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffd700';
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 0.015;
            ctx.beginPath();
            ctx.moveTo(-0.5, 0.1);
            ctx.quadraticCurveTo(-0.4, 0.28, -0.25, 0.28);
            ctx.quadraticCurveTo(0, 0.32, 0.25, 0.28);
            ctx.quadraticCurveTo(0.4, 0.28, 0.5, 0.1);
            ctx.quadraticCurveTo(0.35, 0.18, 0, 0.18);
            ctx.quadraticCurveTo(-0.35, 0.18, -0.5, 0.1);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(0, 0.5, 0.07, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 0.015;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(0, 0.5);
                ctx.lineTo(Math.cos(angle) * 0.05, 0.5 + Math.sin(angle) * 0.05);
                ctx.stroke();
            }
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.ellipse(-0.22, 0, 0.13, 0.035, 0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.22, 0, 0.13, 0.035, -0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.moveTo(-0.25, -0.35);
            ctx.quadraticCurveTo(0, -0.45, 0.25, -0.35);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(-0.4, 0.28);
            ctx.quadraticCurveTo(-0.25, 0.45, 0, 0.45);
            ctx.quadraticCurveTo(0.25, 0.45, 0.4, 0.28);
            ctx.stroke();
        }
    },
    // WEREWOLF
    werewolf: {
        anchor: 'eyes',
        draw(ctx) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#4a3728';
            ctx.strokeStyle = '#2d1b0e';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.ellipse(0, 0.1, 0.7, 0.85, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#3d2b1f';
            ctx.beginPath();
            ctx.ellipse(0, 0.32, 0.3, 0.25, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.ellipse(0, 0.32, 0.07, 0.05, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f4d03f';
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 0.025;
            ctx.beginPath();
            ctx.ellipse(-0.22, -0.05, 0.13, 0.16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(0.22, -0.05, 0.13, 0.16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.ellipse(-0.22, -0.05, 0.035, 0.12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(0.22, -0.05, 0.035, 0.12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f5f5f0';
            for (let i = -4; i <= 4; i++) {
                const x = i * 0.06;
                ctx.beginPath();
                ctx.moveTo(x - 0.025, 0.45);
                ctx.lineTo(x, 0.55 + Math.abs(i) * 0.013);
                ctx.lineTo(x + 0.025, 0.45);
                ctx.closePath();
                ctx.fill();
            }
            ctx.strokeStyle = 'rgba(70, 50, 30, 0.5)';
            ctx.lineWidth = 0.01;
            for (let i = -8; i <= 8; i++) {
                const x = i * 0.08;
                const y = -0.3 + Math.sin(i * 0.5) * 0.08;
                ctx.beginPath();
                ctx.moveTo(x, y - 0.25);
                ctx.quadraticCurveTo(x + 0.04, y, x, y + 0.25);
                ctx.stroke();
            }
            ctx.fillStyle = '#4a3728';
            ctx.strokeStyle = '#2d1b0e';
            ctx.lineWidth = 0.02;
            ctx.beginPath();
            ctx.moveTo(-0.5, -0.3);
            ctx.lineTo(-0.7, -0.65);
            ctx.lineTo(-0.35, -0.45);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0.5, -0.3);
            ctx.lineTo(0.7, -0.65);
            ctx.lineTo(0.35, -0.45);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }
};

function roundedRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function landmarkPx(lm, idx, w, h) {
    const p = lm[idx];
    return { x: p.x * w, y: p.y * h };
}

function computeFaceTransform(landmarks, vw, vh) {
    const eyeL = landmarkPx(landmarks, 33, vw, vh);
    const eyeR = landmarkPx(landmarks, 263, vw, vh);
    const forehead = landmarkPx(landmarks, 10, vw, vh);
    const nose = landmarkPx(landmarks, 1, vw, vh);
    const dx = eyeR.x - eyeL.x, dy = eyeR.y - eyeL.y;
    return {
        cx: (eyeL.x + eyeR.x) / 2, cy: (eyeL.y + eyeR.y) / 2,
        angle: Math.atan2(dy, dx),
        eyeDist: Math.hypot(dx, dy),
        fx: forehead.x, fy: forehead.y,
        nx: nose.x, ny: nose.y,
        vw, vh
    };
}

function renderMaskOnCanvas(canvas, videoEl, maskName, transform) {
    if (!canvas) return;
    const w = (videoEl && videoEl.videoWidth) || canvas.clientWidth || 640;
    const h = (videoEl && videoEl.videoHeight) || canvas.clientHeight || 480;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const def = MASK_DEFS[maskName];
    if (!def || !transform) return;
    ctx.save();
    if (def.anchor === 'eyes') {
        ctx.translate(transform.cx, transform.cy);
        ctx.rotate(transform.angle);
        const scale = transform.eyeDist * 1.1;
        ctx.scale(scale, scale);
    } else if (def.anchor === 'forehead') {
        ctx.translate(transform.fx, transform.fy);
        ctx.rotate(transform.angle);
        ctx.scale(transform.eyeDist * 1.3, transform.eyeDist * 1.3);
    } else if (def.anchor === 'nose') {
        ctx.translate(transform.nx, transform.ny + transform.eyeDist * 0.32);
        ctx.rotate(transform.angle);
        ctx.scale(transform.eyeDist, transform.eyeDist);
    }
    def.draw(ctx);
    ctx.restore();
    if (isFullscreenActive) {
        updateFullscreenMask();
    }
}

function applyMask(maskName, isRemote = false) {
    if (!isRemote) {
        const newMask = (activeMask === maskName) ? 'none' : maskName;
        activeMask = newMask;
        setActiveBadge('.filter-badge[data-mask]', newMask);
        if (isConnected) {
            socket.emit('effect-sync', { type: 'mask', name: newMask });
        }
        renderMaskOnCanvas(localMaskCanvas, document.getElementById('local-video'), newMask, localFaceTransform);
    } else {
        remoteActiveMask = maskName;
        renderMaskOnCanvas(remoteMaskCanvas, document.getElementById('remote-video'), maskName, remoteFaceTransform);
    }
}

let remoteActiveMask = 'none';
const localMaskCanvas = document.getElementById('mask-canvas');
const remoteMaskCanvas = document.getElementById('remote-mask-canvas');
const fullscreenMaskCanvas = document.getElementById('fullscreen-mask-canvas');
let localFaceTransform = null;
let remoteFaceTransform = null;
let faceMesh = null;
let faceMeshReady = false;
let lastTransformEmit = 0;

async function initFaceTracking() {
    if (typeof FaceMesh === 'undefined') {
        console.warn("FaceMesh library didn't load — masks will be unavailable");
        return;
    }
    try {
        faceMesh = new FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });
        faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: false, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        faceMesh.onResults((results) => {
            const localVideo = document.getElementById('local-video');
            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0 && localVideo.videoWidth) {
                localFaceTransform = computeFaceTransform(results.multiFaceLandmarks[0], localVideo.videoWidth, localVideo.videoHeight);
            } else {
                localFaceTransform = null;
            }
            renderMaskOnCanvas(localMaskCanvas, localVideo, activeMask, localFaceTransform);
            const now = performance.now();
            if (isConnected && activeMask !== 'none' && localFaceTransform && now - lastTransformEmit > 80) {
                lastTransformEmit = now;
                socket.emit('effect-sync', { type: 'mask-transform', transform: localFaceTransform });
            }
        });
        faceMeshReady = true;
        trackFrame();
    } catch (e) {
        console.warn("Face tracking init failed:", e);
    }
}

async function trackFrame() {
    const localVideo = document.getElementById('local-video');
    if (faceMeshReady && faceMesh && localVideo && localVideo.readyState >= 2) {
        try { await faceMesh.send({ image: localVideo }); } catch (e) { }
    }
    requestAnimationFrame(trackFrame);
}

socket.on('effect-sync', (data) => {
    if (data.type === 'filter') {
        applyFilter(data.name, true);
    } else if (data.type === 'mask') {
        applyMask(data.name, true);
    } else if (data.type === 'mask-transform') {
        remoteFaceTransform = data.transform;
        renderMaskOnCanvas(remoteMaskCanvas, document.getElementById('remote-video'), remoteActiveMask, remoteFaceTransform);
    }
});

const configuration = {
  iceServers: [
      { urls: "stun:stun.relay.metered.ca:80" },
      {
        urls: "turn:global.relay.metered.ca:80",
        username: "c82e54e33431753c971307b9",
        credential: "WNGRoCt9akSdjdCk",
      },
      {
        urls: "turn:global.relay.metered.ca:80?transport=tcp",
        username: "c82e54e33431753c971307b9",
        credential: "WNGRoCt9akSdjdCk",
      },
      {
        urls: "turn:global.relay.metered.ca:443",
        username: "c82e54e33431753c971307b9",
        credential: "WNGRoCt9akSdjdCk",
      },
      {
        urls: "turns:global.relay.metered.ca:443?transport=tcp",
        username: "c82e54e33431753c971307b9",
        credential: "WNGRoCt9akSdjdCk",
      },
  ],
};

const actionBtn = document.getElementById("action-btn");
const statusBanner = document.getElementById("status-banner");
const messagesContainer = document.getElementById("messages-container");
const typingIndicator = document.getElementById("typing-indicator");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const replyPreviewBox = document.getElementById("reply-preview-box");
const replyPreviewText = document.getElementById("reply-preview-text");
const reportBtn = document.getElementById("report-btn");

async function startMedia() {
    const advancedAudioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
    };
    try {
        if (!localStream) {
            const constraints = {
                video: { 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 }, 
                    frameRate: { ideal: 30, max: 30 }, 
                    facingMode: "user"
                },
                audio: advancedAudioConstraints
            };
            localStream = await getMediaStream(constraints);
            document.getElementById('local-video').srcObject = localStream;
            applyFilter(activeFilter);
            if (!faceMesh) initFaceTracking();
            localStream.getVideoTracks().forEach(track => track.enabled = true);
        }
        if (peerConnection) {
            localStream.getTracks().forEach(t => {
                const s = peerConnection.getSenders().find(snd => snd.track && snd.track.kind === t.kind);
                if (s) s.replaceTrack(t);
            });
        }
    } catch (err) {
        console.warn("Media access failed:", err);
        if (navigator.userAgent.indexOf('Edg') !== -1) {
            alert("Microsoft Edge: Please allow Camera and Microphone access.\n\nClick the lock icon in the address bar → Permissions → Allow Camera & Microphone → Reload.");
        } else {
            alert("Please allow Camera and Microphone access in your browser settings, then refresh the page.");
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            const layoutViewport = document.body;
            layoutViewport.style.height = `${window.visualViewport.height}px`;
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        });
    }
});

function toggleSearch() {
    if (!isSearching && !isConnected) {
        isSearching = true;
        actionBtn.innerText = "🛑 Stop";
        actionBtn.className = "px-3 sm:px-4 py-3 bg-red-600 text-white font-bold rounded-xl text-xs sm:text-sm";
        statusBanner.innerText = "Scanning active channels...";
        socket.emit('find-partner', { mode: 'video' });
        reportBtn.classList.add("hidden");
    } else { resetConnection(); socket.emit('skip'); }
}

socket.on('matched', (data) => {
    isConnected = true; isSearching = false;
    actionBtn.innerText = "❌ Skip";
    actionBtn.className = "px-3 sm:px-4 py-3 bg-amber-600 text-white font-bold rounded-xl text-xs sm:text-sm";
    statusBanner.innerText = "🎯 Partner linked! Communications active.";
    messagesContainer.innerHTML = `<div class="text-xs text-center text-slate-600">Secure link established.</div>`;
    reportBtn.classList.remove("hidden");
    createPeerConnection(data.isInitiator);
    setTimeout(() => {
        if (isConnected) {
            socket.emit('effect-sync', { type: 'filter', name: activeFilter });
            socket.emit('effect-sync', { type: 'mask', name: activeMask });
        }
    }, 1500);
});

function setVideoBitrate(sdp) {
    return sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:2500\r\n');
}

function createPeerConnection(isInitiator) {
    if (peerConnection) peerConnection.close();
    peerConnection = new RTCPeerConnection({
        ...configuration,
        video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            frameRate: { ideal: 30, max: 30 }
        }
    });
    remoteStream = new MediaStream();
    document.getElementById('remote-video').srcObject = remoteStream;
    if (localStream) {
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    }
    peerConnection.ontrack = (event) => {
        const remoteVideo = document.getElementById('remote-video');
        event.streams[0].getTracks().forEach(track => {
            if (!remoteStream.getTracks().find(t => t.id === track.id)) {
                remoteStream.addTrack(track);
            }
        });
        remoteVideo.play().catch(e => console.log("Autoplay handled."));
    };
    peerConnection.onicecandidate = (e) => {
        if (e.candidate) socket.emit('signal', { candidate: e.candidate });
    };
    if (isInitiator) {
        peerConnection.onnegotiationneeded = async () => {
            try {
                let offer = await peerConnection.createOffer();
                offer.sdp = setVideoBitrate(offer.sdp);
                await peerConnection.setLocalDescription(offer);
                socket.emit('signal', { offer: offer });
            } catch (err) { console.error(err); }
        };
    }
}

socket.on('signal', async (d) => {
    if (!peerConnection) return;
    try {
        if (d.offer) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(d.offer));
            let a = await peerConnection.createAnswer();
            a.sdp = setVideoBitrate(a.sdp);
            await peerConnection.setLocalDescription(a);
            socket.emit('signal', { answer: a });
        } else if (d.answer) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(d.answer));
        } else if (d.candidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(d.candidate));
        }
    } catch (err) { console.log("Signal tracking error:", err); }
});

// ================================================================
// CHAT FUNCTIONS
// ================================================================

function sendMsg() {
    if (chatInput.value.trim() && isConnected) {
        let val = chatInput.value.trim();
        if (containsLink(val)) {
            alert("Links share karna allowed nahi hai!");
            return;
        }
        val = filterBadWords(val);
        if (selectedEditMsgId) {
            socket.emit('edit-message', { msgId: selectedEditMsgId, newText: val });
            updateLocalMsgUI(selectedEditMsgId, val);
            cancelEdit();
        } else {
            const uniqueMsgId = 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            const messagePayload = {
                msgId: uniqueMsgId,
                text: val,
                replyToId: selectedReplyMsgId,
                replyToText: selectedReplyMsgId ? document.getElementById(`text-${selectedReplyMsgId}`).innerText : null
            };
            appendMsg(messagePayload, 'me');
            socket.emit('text-message', messagePayload);
            cancelReply();
        }
        chatInput.value = '';
        socket.emit('typing-state', false);
    }
}

function handleImageUpload(e) {
    if (!isConnected) return;
    const file = e.target.files[0];
    if (file) {
        if (file.size > 1024 * 1024) {
            alert("Kripya 1MB se choti size ki photo share karein.");
            return;
        }
        const reader = new FileReader();
        reader.onload = function (event) {
            const base64Image = event.target.result;
            socket.emit('send-image', base64Image);
            appendImageElement(base64Image, 'me');
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }
}

socket.on('receive-image', (base64Image) => {
    appendImageElement(base64Image, 'stranger');
});

function appendImageElement(src, sender) {
    let box = document.createElement('div');
    box.className = `max-w-[70%] p-1 bg-slate-900 border rounded-xl shadow-md ${sender === 'me' ? 'bg-indigo-600 border-indigo-500 self-end' : 'bg-slate-800 border-slate-700 self-start'}`;
    let img = document.createElement('img');
    img.src = src;
    img.alt = "Shared image attachment";
    img.className = "rounded-lg max-h-60 object-contain";
    box.appendChild(img);
    messagesContainer.appendChild(box);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function reportStranger() {
    if (confirm("Kya aap is stranger ko report karke permanent block karna chahte hain?")) {
        socket.emit('report-stranger');
        resetConnection();
        let d = document.createElement('div');
        d.className = "self-center bg-red-950/40 text-xs px-3 py-1 rounded text-red-400 italic";
        d.innerText = "Aapne stranger ko block kar diya hai.";
        messagesContainer.appendChild(d);
    }
}

socket.on('text-message', (messagePayload) => {
    appendMsg(messagePayload, 'stranger');
});

socket.on('edit-message', (data) => {
    updateLocalMsgUI(data.msgId, data.newText);
});

socket.on('delete-message', (data) => {
    const textElement = document.getElementById(`text-${data.msgId}`);
    if (textElement) {
        textElement.innerText = "🗑️ This message was deleted";
        textElement.classList.add("italic", "text-slate-500");
        const actionsBlock = document.getElementById(`actions-${data.msgId}`);
        if (actionsBlock) actionsBlock.remove();
    }
});

function initiateReply(msgId, originalText) {
    selectedReplyMsgId = msgId;
    selectedEditMsgId = null;
    sendBtn.innerText = "Send";
    replyPreviewText.innerText = originalText.length > 35 ? originalText.substring(0, 35) + "..." : originalText;
    replyPreviewBox.classList.remove("hidden");
    chatInput.focus();
}

function cancelReply() {
    selectedReplyMsgId = null;
    replyPreviewBox.classList.add("hidden");
}

function initiateEdit(msgId, currentText) {
    selectedEditMsgId = msgId;
    selectedReplyMsgId = null;
    replyPreviewBox.classList.add("hidden");
    chatInput.value = currentText;
    sendBtn.innerText = "✍️ Edit";
    chatInput.focus();
}

function cancelEdit() {
    selectedEditMsgId = null;
    sendBtn.innerText = "Send";
    chatInput.value = '';
}

function requestDelete(msgId) {
    if (confirm("Delete this message?")) {
        socket.emit('delete-message', { msgId: msgId });
        const textElement = document.getElementById(`text-${msgId}`);
        if (textElement) {
            textElement.innerText = "🗑️ You deleted this message";
            textElement.classList.add("italic", "text-slate-400");
            const actionsBlock = document.getElementById(`actions-${msgId}`);
            if (actionsBlock) actionsBlock.remove();
        }
    }
}

function updateLocalMsgUI(msgId, newText) {
    const textElement = document.getElementById(`text-${msgId}`);
    if (textElement) {
        textElement.innerText = newText + " (edited)";
    }
}

function handleTyping() {
    if (!isConnected) return;
    socket.emit('typing-state', true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('typing-state', false);
    }, 1800);
}

socket.on('typing-state', (isTyping) => {
    if (isTyping) { typingIndicator.classList.remove("hidden"); }
    else { typingIndicator.classList.add("hidden"); }
});

function insertEmoji(emoji) {
    chatInput.value += emoji;
    chatInput.focus();
    handleTyping();
}

async function toggleVoiceNote() {
    if (!isConnected) return;
    const voiceBtn = document.getElementById("voice-btn");
    if (!isRecordingVoice) {
        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(audioStream);
            audioChunks = [];
            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const r = new FileReader(); r.readAsDataURL(audioBlob);
                r.onloadend = () => {
                    socket.emit('voice-note', r.result);
                    appendVoiceElement(r.result, 'me');
                }
            };
            mediaRecorder.start(); isRecordingVoice = true;
            voiceBtn.innerText = "🛑"; voiceBtn.className = "px-2.5 py-2.5 bg-red-600 text-white rounded-xl text-base animate-pulse";
        } catch (err) { alert("Mic connection needed!"); }
    } else {
        mediaRecorder.stop(); isRecordingVoice = false;
        voiceBtn.innerText = "🎙️"; voiceBtn.className = "px-2.5 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-base border border-slate-700";
    }
}

socket.on('voice-note', (base64Audio) => appendVoiceElement(base64Audio, 'stranger'));

function appendVoiceElement(data, sender) {
    let box = document.createElement('div');
    box.className = `max-w-[75%] p-3 rounded-xl flex flex-col gap-1.5 ${sender === 'me' ? 'bg-indigo-600 self-end' : 'bg-slate-800 self-start'}`;
    let audio = document.createElement('audio'); audio.src = data; audio.controls = true;
    audio.className = "w-48 h-8 filter invert contrast-125 rounded-md";
    box.appendChild(audio); messagesContainer.appendChild(box);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

socket.on('partner-disconnected', () => {
    let d = document.createElement('div');
    d.className = "self-center bg-red-950/40 text-xs px-3 py-1 rounded text-red-400 italic";
    d.innerText = "Stranger left the room.";
    messagesContainer.appendChild(d);
    resetConnection();
});

function resetConnection() {
    if (peerConnection) peerConnection.close();
    document.getElementById('remote-video').srcObject = null;
    remoteStream = null;
    isConnected = false; isSearching = false;
    typingIndicator.classList.add("hidden");
    reportBtn.classList.add("hidden");
    cancelReply();
    cancelEdit();
    activeFilter = 'none';
    activeMask = 'none';
    applyFilter(activeFilter);
    applyMaskReset();
    actionBtn.innerText = "💕 Find Partner";
    actionBtn.className = "px-3 sm:px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md";
    statusBanner.innerText = "Connection reset.";
}

function applyMaskReset() {
    remoteFaceTransform = null;
    remoteActiveMask = 'none';
    [localMaskCanvas, remoteMaskCanvas, fullscreenMaskCanvas].forEach(c => {
        if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height);
    });
    setActiveBadge('.filter-badge[data-mask]', 'none');
    const remoteVideo = document.getElementById('remote-video');
    if (remoteVideo) remoteVideo.className = "w-full h-full object-cover transition-all duration-300";
}

function appendMsg(payload, sender) {
    const msgId = payload.msgId;
    const msgText = payload.text;
    let mainWrapper = document.createElement('div');
    mainWrapper.id = `bubble-${msgId}`;
    mainWrapper.className = `max-w-[75%] flex flex-col gap-1 group ${sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`;
    if (payload.replyToId && payload.replyToText) {
        let quoteBox = document.createElement('div');
        quoteBox.className = "text-[11px] opacity-70 bg-black/30 px-2 py-1 rounded-lg border-l-2 border-pink-400 max-w-full truncate mb-[-4px]";
        quoteBox.innerText = `💕 ${payload.replyToText}`;
        mainWrapper.appendChild(quoteBox);
    }
    let bubble = document.createElement('div');
    bubble.className = `px-4 py-2 rounded-xl text-xs sm:text-sm relative break-words w-full ${sender === 'me' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' : 'bg-slate-800 text-white'}`;
    let textSpan = document.createElement('span');
    textSpan.id = `text-${msgId}`;
    textSpan.innerText = msgText;
    bubble.appendChild(textSpan);
    let actionsDiv = document.createElement('div');
    actionsDiv.id = `actions-${msgId}`;
    actionsDiv.className = "text-[10px] text-slate-400 mt-1 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer select-none justify-end";
    actionsDiv.innerHTML += `<span onclick="initiateReply('${msgId}', '${msgText.replace(/'/g, "\\'")}')" class="hover:text-pink-400">💕 Reply</span>`;
    if (sender === 'me') {
        actionsDiv.innerHTML += `<span onclick="initiateEdit('${msgId}', '${msgText.replace(/'/g, "\\'")}')" class="hover:text-yellow-400">✏️ Edit</span>`;
        actionsDiv.innerHTML += `<span onclick="requestDelete('${msgId}')" class="hover:text-red-400">🗑️ Delete</span>`;
    }
    mainWrapper.appendChild(bubble);
    mainWrapper.appendChild(actionsDiv);
    messagesContainer.appendChild(mainWrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleKey(e) { if (e.key === "Enter") sendMsg(); }

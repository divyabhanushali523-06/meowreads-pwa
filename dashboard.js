// Function to switch sections on User Dashboard
function showSection(sectionId) {
    document.querySelectorAll('.dash-section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(`section-${sectionId}`);
    if (target) target.classList.add('active');

    // Update active tab state on bottom nav
    document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => btn.classList.remove('active'));
    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
    }
}

// Function to switch sections on Writer Dashboard
function showWriterSection(sectionId) {
    document.querySelectorAll('.dash-section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(`wsection-${sectionId}`);
    if (target) target.classList.add('active');

    // Update active tab state on writer bottom nav
    document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => btn.classList.remove('active'));
    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add('active');
    }
}

// Ambient Audio Track Toggle Simulation
function toggleAudio(trackName) {
    alert(`🎧 Playing ${trackName} ambient track!`);
}

// Change Profile Avatar
function changePfp(src) {
    const pfp = document.getElementById('currentPfp');
    if (pfp) pfp.src = src;
}

// Open Book Details Page
function openBookDetails(title, author, buyPrice, rentPrice, cover) {
    sessionStorage.setItem('selectedBook', JSON.stringify({ title, author, buyPrice, rentPrice, cover }));
    window.location.href = 'book_details.html';
}

// Logout session reset
function logout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// Dynamic Visual Background Switcher
function changeBgScene(sceneKey) {
    const stage = document.getElementById('ambienceStage');
    const stageTitle = document.getElementById('stageTitle');
    const mascot = stage ? stage.querySelector('.stage-cat-mascot') : null;

    if (!stage) return;

    // Reset scene classes
    stage.className = 'ambience-stage';

    switch (sceneKey) {
        case 'cafe':
            stage.classList.add('scene-cafe');
            if (stageTitle) stageTitle.innerText = "Sitting at Cozy Cafe";
            if (mascot) mascot.innerText = "🐱☕";
            break;
        case 'rain':
            stage.classList.add('scene-rain');
            if (stageTitle) stageTitle.innerText = "Beside Window in Rain";
            if (mascot) mascot.innerText = "🐱🌧️";
            break;
        case 'library':
            stage.classList.add('scene-library');
            if (stageTitle) stageTitle.innerText = "Studying in Grand Library";
            if (mascot) mascot.innerText = "🐱📚";
            break;
        case 'car':
            stage.classList.add('scene-car');
            if (stageTitle) stageTitle.innerText = "Night Car Ride";
            if (mascot) mascot.innerText = "🐱🚗";
            break;
        case 'terrace':
            stage.classList.add('scene-terrace');
            if (stageTitle) stageTitle.innerText = "Relaxing on Building Terrace";
            if (mascot) mascot.innerText = "🐱🌌";
            break;
    }
}

// Working Audio Player Toggle
// Global Audio State & Playback Handler
// Bulletproof Cross-Origin Audio Player Switcher
function toggleAudio(trackId) {
    const audioElement = document.getElementById(`audio-${trackId}`);
    const buttonElement = document.getElementById(`btn-${trackId}`);

    if (!audioElement) return;

    if (audioElement.paused) {
        // Reset track position if ended or stuck
        if (audioElement.ended) audioElement.currentTime = 0;

        audioElement.volume = 0.8;
        
        // Attempt immediate playback
        const playPromise = audioElement.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                if (buttonElement) {
                    buttonElement.innerText = "Pause ⏸";
                    buttonElement.classList.add('primary-btn');
                }
            }).catch(err => {
                console.warn("Autoplay block detected, retrying on user click:", err);
                // Graceful fallback to reload and play
                audioElement.load();
                audioElement.play().then(() => {
                    if (buttonElement) {
                        buttonElement.innerText = "Pause ⏸";
                        buttonElement.classList.add('primary-btn');
                    }
                });
            });
        }
    } else {
        audioElement.pause();
        if (buttonElement) {
            buttonElement.innerText = "Play ▶";
            buttonElement.classList.remove('primary-btn');
        }
    }
}

// Profile Save Handler
function saveProfile() {
    const username = document.getElementById('profUsername').value;
    alert(`Profile updated successfully for ${username}!`);
}

// Function to apply chosen theme across the website
function applyTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('meowReadsTheme', themeName);
    
    // Sync dropdown if element exists
    const selector = document.getElementById('themeSelect');
    if (selector) selector.value = themeName;
}

// Automatically load saved theme when page loads
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('meowReadsTheme') || 'cozy-pink';
    applyTheme(savedTheme);
});

// Web Audio API Fireplace Crackle Sound Engine
let fireAudioCtx = null;
let fireNoiseNode = null;
let fireIsPlaying = false;

function toggleFireSound() {
    const buttonElement = document.getElementById('btn-fire');

    if (!fireIsPlaying) {
        // Initialize Audio Context on user click
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        fireAudioCtx = new AudioContext();

        // Create Pink/Brown noise buffer for realistic hearth rumble & crackle
        const bufferSize = fireAudioCtx.sampleRate * 2; // 2 seconds buffer
        const noiseBuffer = fireAudioCtx.createBuffer(1, bufferSize, fireAudioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // Brown noise filtering
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            
            // Random crackle pops
            if (Math.random() < 0.001) {
                output[i] += (Math.random() - 0.5) * 3.0; 
            }
        }

        fireNoiseNode = fireAudioCtx.createBufferSource();
        fireNoiseNode.buffer = noiseBuffer;
        fireNoiseNode.loop = true;

        // Low-pass filter for cozy warmth
        const filter = fireAudioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        // Gain control
        const gainNode = fireAudioCtx.createGain();
        gainNode.gain.value = 0.3;

        fireNoiseNode.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(fireAudioCtx.destination);

        fireNoiseNode.start(0);
        fireIsPlaying = true;

        if (buttonElement) {
            buttonElement.innerText = "Pause ⏸";
            buttonElement.classList.add('primary-btn');
        }
    } else {
        if (fireAudioCtx) {
            fireAudioCtx.close();
        }
        fireIsPlaying = false;

        if (buttonElement) {
            buttonElement.innerText = "Play ▶";
            buttonElement.classList.remove('primary-btn');
        }
    }
}

function renderDashboardCart() {
    const cartItemsList = document.getElementById('cartItemsList');
    if (!cartItemsList) return;

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Update top header badge count
    const badge = document.getElementById('dashCartBadge');
    if (badge) {
        badge.innerText = cart.length > 0 ? `(${cart.length})` : '';
    }

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p style="color:#777; padding: 12px;">Your cart is empty.</p>';
        return;
    }

    let totalPrice = 0;
    let html = '';

    cart.forEach((item, index) => {
        totalPrice += Number(item.price || 0);
        html += `
            <div class="list-item-card" style="display: flex; align-items: center; justify-content: space-between; padding: 12px; margin-bottom: 10px; background: #fff; border-radius: 12px; border: 1px solid #f0cfd8;">
                <div class="item-details">
                    <h5 style="margin: 0; font-size: 15px;">${item.title}</h5>
                    <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">Type: ${item.type || 'Buy'} • ₹${item.price}</p>
                </div>
                <button class="btn outlined-btn btn-sm" onclick="removeFromDashboardCart(${index})" style="width: auto; padding: 6px 14px; border-color: #e06d88; color: #e06d88;">Remove</button>
            </div>
        `;
    });

    html += `
        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #f0cfd8; display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 16px;">Total Amount: ₹${totalPrice}</strong>
            <button class="btn primary-btn" style="width: auto; padding: 10px 24px;" onclick="checkoutDashboardCart()">Checkout All 💳</button>
        </div>
    `;

    cartItemsList.innerHTML = html;
}

function removeFromDashboardCart(index) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderDashboardCart();
}

function checkoutDashboardCart() {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) return;

    let library = JSON.parse(localStorage.getItem('myLibrary') || '[]');
    cart.forEach(item => {
        library.push({ title: item.title, type: item.type || 'Purchased', date: new Date().toLocaleDateString() });
    });

    localStorage.setItem('myLibrary', JSON.stringify(library));
    localStorage.setItem('cart', JSON.stringify([]));
    
    alert('Checkout successful! Items added to My Library 📚');
    renderDashboardCart();
}

function showSection(sectionId) {
    document.querySelectorAll('.dash-section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(`section-${sectionId}`);
    if (target) {
        target.classList.add('active');
    }
    if (sectionId === 'cart') {
        renderDashboardCart();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderDashboardCart();
    // Handle URL hash navigation like user_dashboard.html#section-cart
    if (window.location.hash) {
        const hashSec = window.location.hash.replace('#section-', '').replace('#', '');
        showSection(hashSec);
    }
});
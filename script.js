// Global variables
let gameState = 'initial';
let uploadedPhoto = null;
let countdownInterval;
let matrixInterval;
let pacmanTimeout;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Start countdown timer
    startCountdownTimer();
    
    // Initialize event listeners
    setupEventListeners();
    
    // Create matrix rain for later use
    createMatrixRain();
    
    // Preload sounds
    preloadSounds();
}

function setupEventListeners() {
    // Claim ticket button
    const claimBtn = document.getElementById('claimTicketBtn');
    if (claimBtn) {
        claimBtn.addEventListener('click', handleClaimTicket);
    }
    
    // Treasure boxes
    const treasureBoxes = document.querySelectorAll('.treasure-box');
    treasureBoxes.forEach(box => {
        box.addEventListener('click', handleTreasureBoxClick);
    });
    
    // Photo upload buttons
    const cameraBtn = document.getElementById('cameraBtn');
    const fileBtn = document.getElementById('fileBtn');
    const fileInput = document.getElementById('fileInput');
    const confirmBtn = document.getElementById('confirmBtn');
    
    if (cameraBtn) {
        cameraBtn.addEventListener('click', handleCameraClick);
    }
    
    if (fileBtn) {
        fileBtn.addEventListener('click', handleFileClick);
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', handleConfirmPhoto);
    }
    
    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Countdown Timer
function startCountdownTimer() {
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    if (!hoursEl || !minutesEl || !secondsEl) return;
    
    let totalSeconds = 12 * 3600 + 34 * 60 + 56; // 12:34:56
    
    countdownInterval = setInterval(() => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
        
        totalSeconds--;
        
        if (totalSeconds < 0) {
            totalSeconds = 12 * 3600 + 34 * 60 + 56; // Reset timer
        }
    }, 1000);
}

// Phase 1: Claim Ticket
function handleClaimTicket() {
    if (gameState !== 'initial') return;
    
    gameState = 'treasure';
    playSound('clickSound');
    
    // Add click animation
    const btn = document.getElementById('claimTicketBtn');
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = '';
    }, 150);
    
    // Transition to treasure game
    setTimeout(() => {
        showTreasureGame();
    }, 500);
}

function showTreasureGame() {
    const treasureSection = document.getElementById('treasureGame');
    treasureSection.classList.remove('hidden');
    
    // Animate entrance
    treasureSection.style.opacity = '0';
    treasureSection.style.transform = 'scale(0.8)';
    
    requestAnimationFrame(() => {
        treasureSection.style.transition = 'all 0.5s ease-out';
        treasureSection.style.opacity = '1';
        treasureSection.style.transform = 'scale(1)';
    });
    
    // Add sparkle effects to boxes
    addSparkleEffects();
}

function addSparkleEffects() {
    const boxes = document.querySelectorAll('.treasure-box');
    boxes.forEach((box, index) => {
        setTimeout(() => {
            box.style.animation = 'boxFloat 3s ease-in-out infinite';
            box.style.animationDelay = (index * 0.2) + 's';
            
            // Add random sparkles
            setInterval(() => {
                createSparkle(box);
            }, 1000 + Math.random() * 2000);
        }, index * 200);
    });
}

function createSparkle(element) {
    const sparkle = document.createElement('div');
    sparkle.textContent = '✨';
    sparkle.style.position = 'absolute';
    sparkle.style.fontSize = '1rem';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';
    sparkle.style.animation = 'sparkle 1s ease-out forwards';
    
    element.style.position = 'relative';
    element.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 1000);
}

// Phase 2: Treasure Box Selection
function handleTreasureBoxClick(event) {
    if (gameState !== 'treasure') return;
    
    gameState = 'uploading';
    playSound('clickSound');
    
    const clickedBox = event.currentTarget;
    const allBoxes = document.querySelectorAll('.treasure-box');
    
    // Animate clicked box
    clickedBox.style.transform = 'scale(1.2) rotate(360deg)';
    clickedBox.style.background = 'linear-gradient(45deg, #ffd700, #ffed4a)';
    
    // Fade out other boxes
    allBoxes.forEach(box => {
        if (box !== clickedBox) {
            box.style.opacity = '0.3';
            box.style.transform = 'scale(0.8)';
        }
    });
    
    // Show winner animation
    setTimeout(() => {
        showWinnerAnimation(clickedBox);
    }, 1000);
}

function showWinnerAnimation(winnerBox) {
    // Create explosion effect
    createExplosion(winnerBox);
    
    // Play winner sound (if available)
    playSound('clickSound');
    
    // Transition to photo upload
    setTimeout(() => {
        showPhotoUpload();
    }, 2000);
}

function createExplosion(element) {
    const rect = element.getBoundingClientRect();
    const explosion = document.createElement('div');
    explosion.style.position = 'fixed';
    explosion.style.left = rect.left + rect.width / 2 + 'px';
    explosion.style.top = rect.top + rect.height / 2 + 'px';
    explosion.style.width = '100px';
    explosion.style.height = '100px';
    explosion.style.background = 'radial-gradient(circle, #ffd700, transparent)';
    explosion.style.borderRadius = '50%';
    explosion.style.transform = 'scale(0)';
    explosion.style.animation = 'explosionEffect 0.5s ease-out forwards';
    explosion.style.pointerEvents = 'none';
    explosion.style.zIndex = '5000';
    
    document.body.appendChild(explosion);
    
    // Add CSS for explosion animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes explosionEffect {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(10); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        explosion.remove();
        style.remove();
    }, 500);
}

// Phase 3: Photo Upload
function showPhotoUpload() {
    const treasureSection = document.getElementById('treasureGame');
    const uploadSection = document.getElementById('photoUpload');
    
    // Hide treasure game
    treasureSection.style.opacity = '0';
    setTimeout(() => {
        treasureSection.classList.add('hidden');
    }, 300);
    
    // Show photo upload
    uploadSection.classList.remove('hidden');
    uploadSection.style.opacity = '0';
    
    requestAnimationFrame(() => {
        uploadSection.style.transition = 'opacity 0.5s ease-out';
        uploadSection.style.opacity = '1';
    });
    
    // Start confetti animation
    startConfetti();
}

function startConfetti() {
    const confetti = document.querySelector('.confetti');
    if (!confetti) return;
    
    // Create additional confetti elements
    for (let i = 0; i < 5; i++) {
        const confettiPiece = document.createElement('div');
        confettiPiece.style.position = 'absolute';
        confettiPiece.style.top = '-10%';
        confettiPiece.style.left = Math.random() * 100 + '%';
        confettiPiece.style.fontSize = '2rem';
        confettiPiece.textContent = ['🎊', '🎉', '⭐', '✨', '🏆'][Math.floor(Math.random() * 5)];
        confettiPiece.style.animation = `confettiFall ${3 + Math.random() * 2}s linear infinite`;
        confettiPiece.style.animationDelay = Math.random() * 2 + 's';
        
        confetti.appendChild(confettiPiece);
    }
}

function handleCameraClick() {
    // Simulate camera access (in real app, would use navigator.mediaDevices.getUserMedia)
    alert('📸 Camera access would be requested here. For demo purposes, please use the "Upload File" option.');
}

function handleFileClick() {
    const fileInput = document.getElementById('fileInput');
    fileInput.click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    // Show upload progress
    showUploadProgress(file);
}

function showUploadProgress(file) {
    const progressContainer = document.getElementById('uploadProgress');
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    progressContainer.classList.remove('hidden');
    
    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress > 100) progress = 100;
        
        progressFill.style.width = progress + '%';
        progressText.textContent = `Processing your verification... ${Math.floor(progress)}%`;
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
                showUploadedImage(file);
            }, 500);
        }
    }, 200);
}

function showUploadedImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const uploadedImageContainer = document.getElementById('uploadedImage');
        const previewImage = document.getElementById('previewImage');
        
        previewImage.src = e.target.result;
        uploadedPhoto = e.target.result;
        
        uploadedImageContainer.classList.remove('hidden');
        
        // Hide progress
        document.getElementById('uploadProgress').classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

function handleConfirmPhoto() {
    if (!uploadedPhoto || gameState !== 'uploading') return;
    
    gameState = 'pacman';
    playSound('clickSound');
    
    // Add confirmation animation
    const confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.style.transform = 'scale(0.95)';
    confirmBtn.textContent = '🎯 Processing...';
    
    setTimeout(() => {
        startPacmanSequence();
    }, 1000);
}

// Phase 4: Pac-Man Animation
function startPacmanSequence() {
    const uploadSection = document.getElementById('photoUpload');
    const pacmanSection = document.getElementById('pacmanSection');
    
    // Hide upload section
    uploadSection.style.opacity = '0';
    setTimeout(() => {
        uploadSection.classList.add('hidden');
    }, 300);
    
    // Show Pac-Man section
    pacmanSection.classList.remove('hidden');
    
    // Start Pac-Man animation
    setTimeout(() => {
        animatePacman();
    }, 500);
}

function animatePacman() {
    const pacman = document.getElementById('pacman');
    const uploadedImage = document.getElementById('previewImage');
    
    if (!pacman || !uploadedImage) return;
    
    // Position uploaded image in center for Pac-Man to "eat"
    const imageClone = uploadedImage.cloneNode(true);
    imageClone.style.position = 'fixed';
    imageClone.style.left = '50%';
    imageClone.style.top = '50%';
    imageClone.style.transform = 'translate(-50%, -50%)';
    imageClone.style.zIndex = '2999';
    imageClone.style.maxWidth = '200px';
    imageClone.style.maxHeight = '200px';
    imageClone.style.borderRadius = '15px';
    
    document.getElementById('pacmanSection').appendChild(imageClone);
    
    // Play Pac-Man sound
    playSound('pacmanSound');
    
    // Start Pac-Man movement
    pacman.style.animation = 'pacmanMove 3s linear forwards';
    
    // When Pac-Man reaches the image, make it disappear
    setTimeout(() => {
        // Add eating effect
        imageClone.style.transition = 'all 0.5s ease-out';
        imageClone.style.transform = 'translate(-50%, -50%) scale(0) rotate(360deg)';
        imageClone.style.opacity = '0';
        
        // Add chomp sound effect
        playSound('clickSound');
        
        setTimeout(() => {
            imageClone.remove();
            startHackSequence();
        }, 500);
    }, 2500);
}

// Phase 5: Hack Simulation
function startHackSequence() {
    gameState = 'hacked';
    
    const pacmanSection = document.getElementById('pacmanSection');
    const hackSection = document.getElementById('hackSimulation');
    
    // Hide Pac-Man section
    pacmanSection.classList.add('hidden');
    
    // Show hack section with dramatic effect
    hackSection.classList.remove('hidden');
    
    // Start screen effects
    setTimeout(() => {
        startMatrixEffect();
    }, 1000);
    
    // Show hack title with glitch effect
    setTimeout(() => {
        const hackTitle = document.getElementById('hackTitle');
        hackTitle.style.opacity = '1';
        hackTitle.style.animation = 'hackGlow 1s ease-in-out infinite, glitchEffect 0.3s linear infinite';
    }, 2000);
    
    // Show terminal with typing effect
    setTimeout(() => {
        showTerminalEffect();
    }, 3000);
    
    // Transition to educational reveal
    setTimeout(() => {
        showEducationalReveal();
    }, 8000);
}

function startMatrixEffect() {
    const matrixBg = document.getElementById('matrixBg');
    if (!matrixBg) return;
    
    matrixBg.style.opacity = '1';
    
    // Start matrix rain animation
    matrixInterval = setInterval(() => {
        createMatrixColumn();
    }, 100);
}

function createMatrixRain() {
    // Prepare matrix characters
    window.matrixChars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()'.split('');
}

function createMatrixColumn() {
    const matrixBg = document.getElementById('matrixBg');
    if (!matrixBg) return;
    
    const column = document.createElement('div');
    column.style.position = 'absolute';
    column.style.left = Math.random() * 100 + '%';
    column.style.top = '-50px';
    column.style.color = '#00ff00';
    column.style.fontSize = Math.random() * 20 + 10 + 'px';
    column.style.fontFamily = 'Courier New, monospace';
    column.style.fontWeight = 'bold';
    column.style.opacity = Math.random() * 0.5 + 0.5;
    column.style.animation = 'matrixFall 3s linear forwards';
    column.style.pointerEvents = 'none';
    
    // Random matrix character
    column.textContent = window.matrixChars[Math.floor(Math.random() * window.matrixChars.length)];
    
    matrixBg.appendChild(column);
    
    // Remove after animation
    setTimeout(() => {
        column.remove();
    }, 3000);
    
    // Add matrix fall animation if it doesn't exist
    if (!document.querySelector('style[data-matrix]')) {
        const style = document.createElement('style');
        style.setAttribute('data-matrix', 'true');
        style.textContent = `
            @keyframes matrixFall {
                0% { transform: translateY(-50px); }
                100% { transform: translateY(calc(100vh + 50px)); }
            }
        `;
        document.head.appendChild(style);
    }
}

function showTerminalEffect() {
    const terminal = document.getElementById('terminal');
    const lines = terminal.querySelectorAll('.terminal-line');
    
    lines.forEach((line, index) => {
        setTimeout(() => {
            line.style.opacity = '1';
            playSound('clickSound');
        }, index * 1000);
    });
}

// Phase 6: Educational Reveal
function showEducationalReveal() {
    gameState = 'education';
    
    const hackSection = document.getElementById('hackSimulation');
    const eduSection = document.getElementById('educationalReveal');
    
    // Stop matrix effect
    if (matrixInterval) {
        clearInterval(matrixInterval);
    }
    
    // Fade out hack section
    hackSection.style.opacity = '0';
    setTimeout(() => {
        hackSection.classList.add('hidden');
    }, 1000);
    
    // Show educational section
    eduSection.classList.remove('hidden');
    eduSection.style.opacity = '0';
    
    requestAnimationFrame(() => {
        eduSection.style.transition = 'opacity 1s ease-out';
        eduSection.style.opacity = '1';
    });
    
    // Scroll to top of educational section
    setTimeout(() => {
        eduSection.scrollIntoView({ behavior: 'smooth' });
    }, 500);
    
    // Animate flag items
    setTimeout(() => {
        animateFlagItems();
    }, 1000);
}

function animateFlagItems() {
    const flagItems = document.querySelectorAll('.flag-item');
    flagItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.transform = 'translateY(20px)';
            item.style.opacity = '0';
            
            requestAnimationFrame(() => {
                item.style.transition = 'all 0.5s ease-out';
                item.style.transform = 'translateY(0)';
                item.style.opacity = '1';
            });
        }, index * 200);
    });
}

// Social Sharing Functions
function shareExperience(platform) {
    const text = "I just experienced an amazing cybersecurity awareness demo! Learn how to protect yourself online: ";
    const url = window.location.href;
    
    let shareUrl;
    
    switch (platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            break;
        default:
            return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

// Sound Management
function preloadSounds() {
    // Sounds are embedded as data URLs in HTML for demo purposes
    // In a real application, you would load actual sound files
}

function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => {
            // Handle autoplay restrictions
            console.log('Sound play failed:', e);
        });
    }
}

// Utility Functions
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createRandomElement(container, element, className, content) {
    const el = document.createElement(element);
    el.className = className;
    el.textContent = content;
    el.style.left = Math.random() * 100 + '%';
    el.style.top = Math.random() * 100 + '%';
    container.appendChild(el);
    return el;
}

// Easter Eggs and Additional Effects
function addEasterEggs() {
    // Konami Code easter egg
    let konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', function(e) {
        if (e.keyCode === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateEasterEgg();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
}

function activateEasterEgg() {
    // Create rainbow effect
    document.body.style.animation = 'rainbowBackground 2s ease-in-out';
    
    // Add CSS for rainbow effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbowBackground {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Show easter egg message
    const message = document.createElement('div');
    message.textContent = '🌈 Easter Egg Activated! You found the secret! 🌈';
    message.style.position = 'fixed';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.background = 'rgba(0, 0, 0, 0.9)';
    message.style.color = 'white';
    message.style.padding = '20px 40px';
    message.style.borderRadius = '15px';
    message.style.fontSize = '1.5rem';
    message.style.zIndex = '10000';
    message.style.textAlign = 'center';
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
        style.remove();
        document.body.style.animation = '';
    }, 3000);
}

// Initialize easter eggs
addEasterEggs();

// Additional interactive effects
document.addEventListener('mousemove', function(e) {
    if (gameState === 'initial') {
        // Create subtle mouse trail effect
        createMouseTrail(e.clientX, e.clientY);
    }
});

function createMouseTrail(x, y) {
    const trail = document.createElement('div');
    trail.style.position = 'fixed';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    trail.style.width = '4px';
    trail.style.height = '4px';
    trail.style.background = '#ff6b6b';
    trail.style.borderRadius = '50%';
    trail.style.pointerEvents = 'none';
    trail.style.zIndex = '1';
    trail.style.animation = 'trailFade 0.5s ease-out forwards';
    
    document.body.appendChild(trail);
    
    // Add trail fade animation if it doesn't exist
    if (!document.querySelector('style[data-trail]')) {
        const style = document.createElement('style');
        style.setAttribute('data-trail', 'true');
        style.textContent = `
            @keyframes trailFade {
                0% { opacity: 1; transform: scale(1); }
                100% { opacity: 0; transform: scale(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        trail.remove();
    }, 500);
}

// Performance optimization - cleanup intervals on page unload
window.addEventListener('beforeunload', function() {
    if (countdownInterval) clearInterval(countdownInterval);
    if (matrixInterval) clearInterval(matrixInterval);
    if (pacmanTimeout) clearTimeout(pacmanTimeout);
});

// Console message for developers
console.log('%c🛡️ Cybersecurity Awareness Demo 🛡️', 'color: #ff6b6b; font-size: 20px; font-weight: bold;');
console.log('%cThis is an educational demonstration showing how scammers can manipulate users.', 'color: #4ecdc4; font-size: 14px;');
console.log('%cAlways be cautious when sharing personal information online!', 'color: #ffed4a; font-size: 14px;');
console.log('%cFor more cybersecurity tips, visit: https://staysafeonline.org/', 'color: #cccccc; font-size: 12px;');
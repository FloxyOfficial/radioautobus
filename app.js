const CORRECT_PIN = '1481';

// Check if Socket.IO is loaded
if (typeof io === 'undefined') {
    document.body.innerHTML = '<div style="color: white; text-align: center; padding: 50px; font-family: Arial; max-width: 600px; margin: 0 auto;"><h1 style="font-size: 48px;">❌</h1><h2>Server Not Running</h2><p style="font-size: 18px; line-height: 1.6;">Please start the server first:</p><code style="background: rgba(0,0,0,0.3); padding: 10px 20px; border-radius: 8px; display: block; margin: 20px 0;">npm start</code><p>Then refresh this page.</p></div>';
    throw new Error('Socket.IO not loaded - server not running');
}

// Language system
let currentLang = localStorage.getItem('language') || 'cs';

const translations = {
    cs: {
        logo: 'HITRADIO AUTOBUS',
        clickToListen: 'Klikni pro poslech',
        nowPlaying: 'Nyní hraje - HITRADIO AUTOBUS',
        ready: 'Připraveno',
        liveStream: '🔴 ŽIVÉ vysílání probíhá',
        cannotConnect: '❌ Nelze se připojit k serveru',
        adminPanel: '🔒 ADMIN PANEL',
        enterPin: 'Zadejte PIN pro přístup',
        unlock: 'Odemknout',
        wrongPin: '❌ Nesprávný PIN',
        broadcastControl: '🎙️ Ovládání vysílání',
        audioMode: 'Režim zvuku',
        music: '🎵 Hudba (vysoká kvalita)',
        voice: '🎤 Hlas (potlačení šumu)',
        musicHint: '💡 Pro hudbu vyberte "Hudba" - vypne filtry',
        selectMic: 'Vyberte mikrofon',
        loadingMics: 'Načítání mikrofonů...',
        noMicsFound: 'Žádné mikrofony nenalezeny',
        micError: 'Chyba načítání mikrofonů',
        micVolume: 'Hlasitost mikrofonu',
        monitorVolume: 'Hlasitost monitorování (jen pro vás)',
        monitorHint: '💡 Toto slyšíte pouze vy. Posluchači slyší "Hlasitost mikrofonu".',
        startBroadcast: '🎤 Spustit vysílání',
        stopBroadcast: '🎤 Zastavit vysílání',
        readyToBroadcast: 'Připraveno k vysílání',
        broadcasting: '🔴 Vysílání ŽIVĚ',
        selectMicError: '❌ Vyberte mikrofon',
        listeners: '👥'
    },
    en: {
        logo: 'HITRADIO AUTOBUS',
        clickToListen: 'Click to listen',
        nowPlaying: 'Now playing - HITRADIO AUTOBUS',
        ready: 'Ready',
        liveStream: '🔴 LIVE broadcast',
        cannotConnect: '❌ Cannot connect to server',
        adminPanel: '🔒 ADMIN PANEL',
        enterPin: 'Enter PIN to access',
        unlock: 'Unlock',
        wrongPin: '❌ Wrong PIN',
        broadcastControl: '🎙️ Broadcast Control',
        audioMode: 'Audio Mode',
        music: '🎵 Music (high quality)',
        voice: '🎤 Voice (noise suppression)',
        musicHint: '💡 Select "Music" for music - disables filters',
        selectMic: 'Select microphone',
        loadingMics: 'Loading microphones...',
        noMicsFound: 'No microphones found',
        micError: 'Error loading microphones',
        micVolume: 'Microphone volume',
        monitorVolume: 'Monitor volume (for you only)',
        monitorHint: '💡 Only you hear this. Listeners hear "Microphone volume".',
        startBroadcast: '🎤 Start broadcast',
        stopBroadcast: '🎤 Stop broadcast',
        readyToBroadcast: 'Ready to broadcast',
        broadcasting: '🔴 Broadcasting LIVE',
        selectMicError: '❌ Select a microphone',
        listeners: '👥'
    }
};

function t(key) {
    return translations[currentLang][key] || key;
}

function updateLanguage() {
    document.documentElement.lang = currentLang;
    
    // Update all translatable elements
    const logo = document.querySelector('.logo');
    if (logo) logo.textContent = t('logo');
    
    const status = document.getElementById('status');
    if (status && !status.classList.contains('live')) {
        status.textContent = t('clickToListen');
    }
    
    const connectionStatus = document.getElementById('connectionStatus');
    if (connectionStatus && !connectionStatus.classList.contains('connected')) {
        connectionStatus.textContent = t('ready');
    }
    
    // Admin panel
    const adminLogo = document.querySelector('.admin-logo');
    if (adminLogo) adminLogo.textContent = t('adminPanel');
    
    const pinSectionH3 = document.querySelector('.pin-section h3');
    if (pinSectionH3) pinSectionH3.textContent = t('enterPin');
    
    const submitBtn = document.getElementById('submitPin');
    if (submitBtn) submitBtn.textContent = t('unlock');
    
    const pinError = document.getElementById('pinError');
    if (pinError) pinError.textContent = t('wrongPin');
    
    const controlPanelH3 = document.querySelector('.control-panel h3');
    if (controlPanelH3) controlPanelH3.textContent = t('broadcastControl');
    
    // Update admin controls
    const audioModeLabel = document.querySelector('.control-group label[data-lang="audioMode"]');
    if (audioModeLabel) audioModeLabel.innerHTML = t('audioMode');
    
    const audioModeSelect = document.getElementById('audioMode');
    if (audioModeSelect) {
        audioModeSelect.innerHTML = `
            <option value="music">${t('music')}</option>
            <option value="voice">${t('voice')}</option>
        `;
    }
    
    const micSelectLabel = document.querySelector('.control-group label[data-lang="selectMic"]');
    if (micSelectLabel) micSelectLabel.textContent = t('selectMic');
    
    const micVolumeLabel = document.querySelector('.control-group label[data-lang="micVolume"]');
    if (micVolumeLabel) {
        const volumeValue = document.getElementById('volumeValue');
        micVolumeLabel.innerHTML = `${t('micVolume')} <span class="volume-value" id="volumeValue">${volumeValue ? volumeValue.textContent : '100%'}</span>`;
    }
    
    const monitorVolumeLabel = document.querySelector('.control-group label[data-lang="monitorVolume"]');
    if (monitorVolumeLabel) {
        const monitorValue = document.getElementById('monitorValue');
        monitorVolumeLabel.innerHTML = `${t('monitorVolume')} <span class="volume-value" id="monitorValue">${monitorValue ? monitorValue.textContent : '50%'}</span>`;
    }
    
    const micButton = document.getElementById('micButton');
    if (micButton && !micButton.classList.contains('active')) {
        micButton.textContent = t('startBroadcast');
    }
    
    const broadcastStatus = document.getElementById('broadcastStatus');
    if (broadcastStatus && !broadcastStatus.classList.contains('live')) {
        broadcastStatus.textContent = t('readyToBroadcast');
    }
    
    // Update language button
    const langBtn = document.getElementById('langToggle');
    if (langBtn) {
        langBtn.textContent = currentLang === 'cs' ? 'EN' : 'CZ';
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'cs' ? 'en' : 'cs';
    localStorage.setItem('language', currentLang);
    updateLanguage();
}

// Detect if we're on the admin page
const isAdmin = window.location.hash === '#admin';

const radioInterface = document.getElementById('radioInterface');
const adminPanel = document.getElementById('adminPanel');

// Initialize Socket.IO connection
const socket = io();

// Handle connection errors
socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    const status = document.getElementById('connectionStatus') || document.getElementById('broadcastStatus');
    if (status) {
        status.textContent = t('cannotConnect');
        status.style.color = '#dc2626';
    }
});

socket.on('connect', () => {
    console.log('Connected to server');
    const status = document.getElementById('connectionStatus') || document.getElementById('broadcastStatus');
    if (status && !isAdmin) {
        status.textContent = t('ready');
        status.classList.remove('connected');
    }
});

// Show appropriate interface
if (isAdmin) {
    radioInterface.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    initAdmin();
} else {
    initRadio();
}

// Initialize language
updateLanguage();

// ===== RADIO INTERFACE =====
function initRadio() {
    const playButton = document.getElementById('playButton');
    const playIcon = playButton.querySelector('.play-icon svg');
    const status = document.getElementById('status');
    const visualizer = document.getElementById('visualizer');
    const connectionStatus = document.getElementById('connectionStatus');
    
    let isPlaying = false;
    let audioContext;
    let audioQueue = [];
    let nextPlayTime = 0;
    let isScheduling = false;

    // Socket event listeners
    socket.on('stream_start', () => {
        connectionStatus.textContent = t('liveStream');
        connectionStatus.classList.add('connected');
    });

    socket.on('stream_stop', () => {
        connectionStatus.textContent = t('ready');
        connectionStatus.classList.remove('connected');
        audioQueue = [];
        if (isPlaying) {
            playButton.click();
        }
    });

    socket.on('broadcaster_connected', () => {
        connectionStatus.textContent = t('liveStream');
        connectionStatus.classList.add('connected');
    });

    socket.on('audio_chunk', (data) => {
        if (isPlaying && audioContext) {
            audioQueue.push(data);
            console.log('Received chunk, queue size:', audioQueue.length);
            
            // Start scheduling if not already doing so
            if (!isScheduling) {
                scheduleAudio();
            }
        }
    });

    function scheduleAudio() {
        if (isScheduling || !isPlaying) return;
        
        isScheduling = true;
        console.log('Starting audio scheduler');
        
        // Schedule audio in batches for smoother playback
        const schedule = () => {
            if (!isPlaying) {
                isScheduling = false;
                return;
            }
            
            const currentTime = audioContext.currentTime;
            
            // Initialize nextPlayTime with buffer
            if (nextPlayTime === 0 || nextPlayTime < currentTime) {
                nextPlayTime = currentTime + 0.3; // 300ms initial buffer
                console.log('Initialized playback time:', nextPlayTime);
            }
            
            // Schedule all available chunks
            let scheduledCount = 0;
            while (audioQueue.length > 0 && scheduledCount < 10) {
                const data = audioQueue.shift();
                
                try {
                    const audioData = data.audioData;
                    const channelData = Array.isArray(audioData[0]) ? audioData : [audioData];
                    const numChannels = channelData.length;
                    const bufferLength = channelData[0].length;
                    
                    const audioBuffer = audioContext.createBuffer(
                        numChannels,
                        bufferLength,
                        data.sampleRate || audioContext.sampleRate
                    );
                    
                    for (let i = 0; i < numChannels; i++) {
                        audioBuffer.copyToChannel(new Float32Array(channelData[i]), i);
                    }
                    
                    const source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(audioContext.destination);
                    source.start(nextPlayTime);
                    
                    console.log('Scheduled chunk at:', nextPlayTime, 'duration:', audioBuffer.duration);
                    
                    nextPlayTime += audioBuffer.duration;
                    scheduledCount++;
                    
                } catch (e) {
                    console.error('Audio scheduling error:', e);
                }
            }
            
            // Keep scheduling as long as there's audio
            if (audioQueue.length > 0 || nextPlayTime > currentTime) {
                setTimeout(schedule, 50); // Check every 50ms
            } else {
                console.log('Scheduler stopped - no more audio');
                isScheduling = false;
            }
        };
        
        schedule();
    }

    playButton.addEventListener('click', async () => {
        if (!isPlaying) {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }
            
            nextPlayTime = 0;
            audioQueue = [];
            isScheduling = false;
            
            playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>';
            playButton.classList.add('playing');
            status.textContent = t('nowPlaying');
            status.classList.add('live');
            visualizer.classList.add('active');
            isPlaying = true;
            
            console.log('Player started, waiting for audio...');
            
            socket.emit('listener_joined');
        } else {
            playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
            playButton.classList.remove('playing');
            status.textContent = t('clickToListen');
            status.classList.remove('live');
            visualizer.classList.remove('active');
            isPlaying = false;
            audioQueue = [];
            nextPlayTime = 0;
            isScheduling = false;
            
            console.log('Player stopped');
            
            socket.emit('listener_left');
        }
    });
}

// ===== ADMIN INTERFACE =====
function initAdmin() {
    const pinInput = document.getElementById('pinInput');
    const submitPin = document.getElementById('submitPin');
    const pinEntry = document.getElementById('pinEntry');
    const controlPanel = document.getElementById('controlPanel');
    const pinError = document.getElementById('pinError');
    const micButton = document.getElementById('micButton');
    const broadcastStatus = document.getElementById('broadcastStatus');
    const volumeControl = document.getElementById('volumeControl');
    const volumeValue = document.getElementById('volumeValue');
    const monitorControl = document.getElementById('monitorControl');
    const monitorValue = document.getElementById('monitorValue');
    const microphoneSelect = document.getElementById('microphoneSelect');
    const audioMode = document.getElementById('audioMode');
    const listenersCount = document.getElementById('listenersCount');

    let isBroadcasting = false;
    let micStream;
    let audioContext;
    let gainNode;
    let monitorGain;
    let processor;

    // Tell server we're the broadcaster
    socket.emit('broadcaster');

    // Socket event listeners
    socket.on('listener_count', (count) => {
        const suffix = currentLang === 'cs' 
            ? (count === 1 ? '' : count < 5 ? 'i' : 'ů')
            : (count === 1 ? '' : 's');
        listenersCount.textContent = `${t('listeners')} ${count} ${currentLang === 'cs' ? 'posluchač' + suffix : 'listener' + suffix}`;
    });

    async function loadMicrophones() {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    stream.getTracks().forEach(track => track.stop());
                });
            
            const devices = await navigator.mediaDevices.enumerateDevices();
            const microphones = devices.filter(device => device.kind === 'audioinput');
            
            microphoneSelect.innerHTML = '';
            
            if (microphones.length === 0) {
                microphoneSelect.innerHTML = `<option value="">${t('noMicsFound')}</option>`;
                return;
            }
            
            microphones.forEach((mic, index) => {
                const option = document.createElement('option');
                option.value = mic.deviceId;
                option.textContent = mic.label || `${currentLang === 'cs' ? 'Mikrofon' : 'Microphone'} ${index + 1}`;
                microphoneSelect.appendChild(option);
            });
        } catch (err) {
            microphoneSelect.innerHTML = `<option value="">${t('micError')}</option>`;
            console.error('Error loading microphones:', err);
        }
    }

    submitPin.addEventListener('click', async () => {
        if (pinInput.value === CORRECT_PIN) {
            pinEntry.classList.add('hidden');
            controlPanel.classList.remove('hidden');
            pinError.classList.add('hidden');
            await loadMicrophones();
        } else {
            pinError.classList.remove('hidden');
            pinInput.value = '';
            pinInput.focus();
        }
    });

    pinInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitPin.click();
        }
    });

    volumeControl.addEventListener('input', (e) => {
        volumeValue.textContent = e.target.value + '%';
        if (gainNode) {
            gainNode.gain.value = e.target.value / 100;
        }
    });

    monitorControl.addEventListener('input', (e) => {
        monitorValue.textContent = e.target.value + '%';
        if (monitorGain) {
            monitorGain.gain.value = e.target.value / 100;
        }
    });

    micButton.addEventListener('click', async () => {
        if (!isBroadcasting) {
            try {
                const selectedMicId = microphoneSelect.value;
                if (!selectedMicId) {
                    broadcastStatus.textContent = t('selectMicError');
                    return;
                }

                audioContext = new (window.AudioContext || window.webkitAudioContext)({
                    sampleRate: 48000
                });
                
                const isMusicMode = audioMode && audioMode.value === 'music';
                
                const constraints = {
                    audio: {
                        deviceId: selectedMicId ? { exact: selectedMicId } : undefined,
                        echoCancellation: !isMusicMode,
                        noiseSuppression: !isMusicMode,
                        autoGainControl: false,
                        sampleRate: 48000,
                        channelCount: isMusicMode ? 2 : 1
                    }
                };

                micStream = await navigator.mediaDevices.getUserMedia(constraints);
                
                const source = audioContext.createMediaStreamSource(micStream);
                gainNode = audioContext.createGain();
                gainNode.gain.value = volumeControl.value / 100;
                
                monitorGain = audioContext.createGain();
                monitorGain.gain.value = monitorControl.value / 100;
                
                const bufferSize = 4096;
                const channels = isMusicMode ? 2 : 1;
                processor = audioContext.createScriptProcessor(bufferSize, channels, channels);
                
                processor.onaudioprocess = (e) => {
                    if (!isBroadcasting) return;
                    
                    const processedChannels = [];
                    
                    for (let channel = 0; channel < channels; channel++) {
                        const inputData = e.inputBuffer.getChannelData(channel);
                        const processedData = new Float32Array(inputData.length);
                        
                        for (let i = 0; i < inputData.length; i++) {
                            let sample = inputData[i] * (gainNode.gain.value || 1);
                            // Simple clipping
                            sample = Math.max(-1, Math.min(1, sample));
                            processedData[i] = sample;
                        }
                        
                        processedChannels.push(Array.from(processedData));
                    }
                    
                    socket.emit('audio_chunk', { 
                        audioData: processedChannels,
                        sampleRate: audioContext.sampleRate,
                        channels: channels
                    });
                };
                
                source.connect(gainNode);
                gainNode.connect(processor);
                processor.connect(audioContext.destination);
                
                // Monitor connection - separate source for monitoring
                const monitorSource = audioContext.createMediaStreamSource(micStream);
                monitorSource.connect(monitorGain);
                monitorGain.connect(audioContext.destination);
                
                socket.emit('stream_start');
                
                micButton.classList.add('active');
                micButton.textContent = t('stopBroadcast');
                broadcastStatus.textContent = t('broadcasting');
                broadcastStatus.classList.add('live');
                isBroadcasting = true;
            } catch (err) {
                broadcastStatus.textContent = '❌ ' + err.message;
                broadcastStatus.classList.remove('live');
                console.error(err);
            }
        } else {
            if (processor) {
                processor.disconnect();
                processor = null;
            }
            if (gainNode) {
                gainNode.disconnect();
            }
            if (monitorGain) {
                monitorGain.disconnect();
            }
            if (micStream) {
                micStream.getTracks().forEach(track => track.stop());
            }
            if (audioContext) {
                audioContext.close();
            }
            
            socket.emit('stream_stop');
            
            micButton.classList.remove('active');
            micButton.textContent = t('startBroadcast');
            broadcastStatus.textContent = t('readyToBroadcast');
            broadcastStatus.classList.remove('live');
            isBroadcasting = false;
        }
    });
}

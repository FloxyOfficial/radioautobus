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
        listeners: '👥',
        listenerVolume: 'Hlasitost rádia',
        talkingMic: 'Mikrofon pro mluvení',
        musicMic: 'Mikrofon pro hudbu',
        talkingVolume: 'Hlasitost mluvení',
        musicVolume: 'Hlasitost hudby',
        switchToTalking: '🎤 Přepnout na mluvení',
        switchToMusic: '🎵 Přepnout na hudbu',
        currentMode: 'Aktuální režim',
        talkMode: 'Mluvení',
        musicMode: 'Hudba',
        microphoneSetup: '🎙️ Nastavení mikrofonů'
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
        listeners: '👥',
        listenerVolume: 'Radio volume',
        talkingMic: 'Talking microphone',
        musicMic: 'Music microphone',
        talkingVolume: 'Talking volume',
        musicVolume: 'Music volume',
        switchToTalking: '🎤 Switch to talking',
        switchToMusic: '🎵 Switch to music',
        currentMode: 'Current mode',
        talkMode: 'Talking',
        musicMode: 'Music',
        microphoneSetup: '🎙️ Microphone Setup'
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
    
    // Listener volume label
    const listenerVolumeLabel = document.querySelector('.control-group label[data-lang="listenerVolume"]');
    if (listenerVolumeLabel) {
        const volumeValue = document.getElementById('listenerVolumeValue');
        listenerVolumeLabel.innerHTML = `${t('listenerVolume')} <span class="volume-value" id="listenerVolumeValue">${volumeValue ? volumeValue.textContent : '100%'}</span>`;
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
    const micSetupH4 = document.querySelector('.control-panel h4');
    if (micSetupH4) micSetupH4.textContent = t('microphoneSetup');
    
    const talkingMicLabel = document.querySelector('.control-group label[data-lang="talkingMic"]');
    if (talkingMicLabel) talkingMicLabel.textContent = t('talkingMic');
    
    const musicMicLabel = document.querySelector('.control-group label[data-lang="musicMic"]');
    if (musicMicLabel) musicMicLabel.textContent = t('musicMic');
    
    const talkingVolumeLabel = document.querySelector('.control-group label[data-lang="talkingVolume"]');
    if (talkingVolumeLabel) {
        const volumeValue = document.getElementById('talkingVolumeValue');
        talkingVolumeLabel.innerHTML = `${t('talkingVolume')} <span class="volume-value" id="talkingVolumeValue">${volumeValue ? volumeValue.textContent : '100%'}</span>`;
    }
    
    const musicVolumeLabel = document.querySelector('.control-group label[data-lang="musicVolume"]');
    if (musicVolumeLabel) {
        const volumeValue = document.getElementById('musicVolumeValue');
        musicVolumeLabel.innerHTML = `${t('musicVolume')} <span class="volume-value" id="musicVolumeValue">${volumeValue ? volumeValue.textContent : '80%'}</span>`;
    }
    
    const monitorVolumeLabel = document.querySelector('.control-group label[data-lang="monitorVolume"]');
    if (monitorVolumeLabel) {
        const monitorValue = document.getElementById('monitorValue');
        monitorVolumeLabel.innerHTML = `${t('monitorVolume')} <span class="volume-value" id="monitorValue">${monitorValue ? monitorValue.textContent : '50%'}</span>`;
    }
    
    const modeButton = document.getElementById('modeButton');
    if (modeButton) {
        const isTalking = modeButton.classList.contains('talking-mode');
        modeButton.textContent = isTalking ? t('switchToMusic') : t('switchToTalking');
    }
    
    const micButton = document.getElementById('micButton');
    if (micButton && !micButton.classList.contains('active')) {
        micButton.textContent = t('startBroadcast');
    }
    
    const broadcastStatus = document.getElementById('broadcastStatus');
    if (broadcastStatus && !broadcastStatus.classList.contains('live')) {
        broadcastStatus.textContent = t('readyToBroadcast');
    }
    
    const currentModeLabel = document.getElementById('currentModeLabel');
    if (currentModeLabel) {
        const isTalking = document.getElementById('modeButton')?.classList.contains('talking-mode');
        currentModeLabel.textContent = `${t('currentMode')}: ${isTalking ? t('talkMode') : t('musicMode')}`;
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
    const listenerVolumeControl = document.getElementById('listenerVolumeControl');
    const listenerVolumeValue = document.getElementById('listenerVolumeValue');
    
    let isPlaying = false;
    let audioContext;
    let audioQueue = [];
    let nextPlayTime = 0;
    let isScheduling = false;
    let listenerGainNode;

    // Load saved volume
    const savedVolume = localStorage.getItem('listenerVolume') || '100';
    listenerVolumeControl.value = savedVolume;
    listenerVolumeValue.textContent = savedVolume + '%';

    // Volume control - instant update
    listenerVolumeControl.addEventListener('input', (e) => {
        const volume = e.target.value;
        listenerVolumeValue.textContent = volume + '%';
        localStorage.setItem('listenerVolume', volume);
        if (listenerGainNode) {
            listenerGainNode.gain.value = volume / 100;
        }
    });

    // Socket event listeners
    socket.on('stream_start', () => {
        console.log('Stream started');
        connectionStatus.textContent = t('liveStream');
        connectionStatus.classList.add('connected');
    });

    socket.on('stream_stop', () => {
        console.log('Stream stopped');
        connectionStatus.textContent = t('ready');
        connectionStatus.classList.remove('connected');
        audioQueue = [];
        if (isPlaying) {
            playButton.click();
        }
    });

    socket.on('broadcaster_connected', () => {
        console.log('Broadcaster connected');
        connectionStatus.textContent = t('liveStream');
        connectionStatus.classList.add('connected');
    });

    socket.on('audio_chunk', (data) => {
        if (isPlaying && audioContext) {
            audioQueue.push(data);
            
            if (!isScheduling) {
                scheduleAudio();
            }
        }
    });

    function scheduleAudio() {
        if (isScheduling || !isPlaying) return;
        
        isScheduling = true;
        
        const schedule = () => {
            if (!isPlaying) {
                isScheduling = false;
                return;
            }
            
            const currentTime = audioContext.currentTime;
            
            if (nextPlayTime === 0 || nextPlayTime < currentTime) {
                nextPlayTime = currentTime + 0.1;
            }
            
            let scheduledCount = 0;
            while (audioQueue.length > 0 && scheduledCount < 5) {
                const data = audioQueue.shift();
                
                try {
                    const audioData = data.audioData;
                    const channelData = Array.isArray(audioData[0]) ? audioData : [audioData];
                    const numChannels = channelData.length;
                    const bufferLength = channelData[0].length;
                    
                    const audioBuffer = audioContext.createBuffer(
                        numChannels,
                        bufferLength,
                        data.sampleRate || 48000
                    );
                    
                    for (let i = 0; i < numChannels; i++) {
                        audioBuffer.copyToChannel(new Float32Array(channelData[i]), i);
                    }
                    
                    const source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(listenerGainNode);
                    source.start(nextPlayTime);
                    
                    nextPlayTime += audioBuffer.duration;
                    scheduledCount++;
                    
                } catch (e) {
                    console.error('Audio scheduling error:', e);
                }
            }
            
            setTimeout(schedule, 100);
        };
        
        schedule();
    }

    playButton.addEventListener('click', async () => {
        if (!isPlaying) {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)({
                    sampleRate: 48000
                });
                listenerGainNode = audioContext.createGain();
                listenerGainNode.gain.value = listenerVolumeControl.value / 100;
                listenerGainNode.connect(audioContext.destination);
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
    const talkingVolumeControl = document.getElementById('talkingVolumeControl');
    const talkingVolumeValue = document.getElementById('talkingVolumeValue');
    const musicVolumeControl = document.getElementById('musicVolumeControl');
    const musicVolumeValue = document.getElementById('musicVolumeValue');
    const monitorControl = document.getElementById('monitorControl');
    const monitorValue = document.getElementById('monitorValue');
    const talkingMicSelect = document.getElementById('talkingMicSelect');
    const musicMicSelect = document.getElementById('musicMicSelect');
    const modeButton = document.getElementById('modeButton');
    const currentModeLabel = document.getElementById('currentModeLabel');
    const listenersCount = document.getElementById('listenersCount');

    let isBroadcasting = false;
    let micStream;
    let audioContext;
    let currentGainNode;
    let monitorGain;
    let processor;
    let currentMode = 'music';
    let isFading = false;

    socket.emit('broadcaster');

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
            
            talkingMicSelect.innerHTML = '';
            musicMicSelect.innerHTML = '';
            
            if (microphones.length === 0) {
                const noMicText = `<option value="">${t('noMicsFound')}</option>`;
                talkingMicSelect.innerHTML = noMicText;
                musicMicSelect.innerHTML = noMicText;
                return;
            }
            
            microphones.forEach((mic, index) => {
                const label = mic.label || `${currentLang === 'cs' ? 'Mikrofon' : 'Microphone'} ${index + 1}`;
                const talkOption = document.createElement('option');
                talkOption.value = mic.deviceId;
                talkOption.textContent = label;
                talkingMicSelect.appendChild(talkOption);
                
                const musicOption = document.createElement('option');
                musicOption.value = mic.deviceId;
                musicOption.textContent = label;
                musicMicSelect.appendChild(musicOption);
            });
            
            if (microphones.length > 1) {
                musicMicSelect.selectedIndex = 1;
            }
        } catch (err) {
            const errorText = `<option value="">${t('micError')}</option>`;
            talkingMicSelect.innerHTML = errorText;
            musicMicSelect.innerHTML = errorText;
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

    // Real-time volume updates
    talkingVolumeControl.addEventListener('input', (e) => {
        const volume = e.target.value;
        talkingVolumeValue.textContent = volume + '%';
        if (currentMode === 'talking' && currentGainNode && isBroadcasting) {
            currentGainNode.gain.setValueAtTime(volume / 100, audioContext.currentTime);
        }
    });

    musicVolumeControl.addEventListener('input', (e) => {
        const volume = e.target.value;
        musicVolumeValue.textContent = volume + '%';
        if (currentMode === 'music' && currentGainNode && isBroadcasting) {
            currentGainNode.gain.setValueAtTime(volume / 100, audioContext.currentTime);
        }
    });

    monitorControl.addEventListener('input', (e) => {
        const volume = e.target.value;
        monitorValue.textContent = volume + '%';
        if (monitorGain) {
            monitorGain.gain.setValueAtTime(volume / 100, audioContext.currentTime);
        }
    });

    async function switchMode(newMode) {
        if (!isBroadcasting || isFading || newMode === currentMode) return;
        
        isFading = true;
        const fadeTime = 0.3;
        const currentTime = audioContext.currentTime;
        
        if (currentGainNode) {
            currentGainNode.gain.linearRampToValueAtTime(0, currentTime + fadeTime);
        }
        
        await new Promise(resolve => setTimeout(resolve, fadeTime * 1000));
        
        if (processor) {
            processor.disconnect();
            processor = null;
        }
        if (currentGainNode) {
            currentGainNode.disconnect();
        }
        if (monitorGain) {
            monitorGain.disconnect();
        }
        if (micStream) {
            micStream.getTracks().forEach(track => track.stop());
        }
        
        currentMode = newMode;
        const selectedMicId = newMode === 'talking' ? talkingMicSelect.value : musicMicSelect.value;
        
        if (!selectedMicId) {
            broadcastStatus.textContent = t('selectMicError');
            isFading = false;
            return;
        }
        
        const isMusicMode = newMode === 'music';
        
        const constraints = {
            audio: {
                deviceId: { exact: selectedMicId },
                echoCancellation: !isMusicMode,
                noiseSuppression: !isMusicMode,
                autoGainControl: false,
                sampleRate: 48000,
                channelCount: isMusicMode ? 2 : 1
            }
        };
        
        try {
            micStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            const source = audioContext.createMediaStreamSource(micStream);
            currentGainNode = audioContext.createGain();
            currentGainNode.gain.value = 0;
            
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
                        let sample = inputData[i] * (currentGainNode.gain.value || 1);
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
            
            source.connect(currentGainNode);
            currentGainNode.connect(processor);
            processor.connect(audioContext.destination);
            
            const monitorSource = audioContext.createMediaStreamSource(micStream);
            monitorSource.connect(monitorGain);
            monitorGain.connect(audioContext.destination);
            
            const targetVolume = (newMode === 'talking' ? talkingVolumeControl.value : musicVolumeControl.value) / 100;
            currentGainNode.gain.linearRampToValueAtTime(targetVolume, audioContext.currentTime + fadeTime);
            
            currentModeLabel.textContent = `${t('currentMode')}: ${newMode === 'talking' ? t('talkMode') : t('musicMode')}`;
            modeButton.textContent = newMode === 'talking' ? t('switchToMusic') : t('switchToTalking');
            modeButton.classList.toggle('talking-mode', newMode === 'talking');
            
            await new Promise(resolve => setTimeout(resolve, fadeTime * 1000));
            isFading = false;
        } catch (err) {
            console.error('Error switching mode:', err);
            broadcastStatus.textContent = '❌ ' + err.message;
            isFading = false;
        }
    }

    modeButton.addEventListener('click', () => {
        if (!isBroadcasting) return;
        const newMode = currentMode === 'music' ? 'talking' : 'music';
        switchMode(newMode);
    });

    micButton.addEventListener('click', async () => {
        if (!isBroadcasting) {
            try {
                const selectedMicId = currentMode === 'talking' ? talkingMicSelect.value : musicMicSelect.value;
                if (!selectedMicId) {
                    broadcastStatus.textContent = t('selectMicError');
                    return;
                }

                audioContext = new (window.AudioContext || window.webkitAudioContext)({
                    sampleRate: 48000,
                    latencyHint: 'interactive'
                });
                
                const isMusicMode = currentMode === 'music';
                
                const constraints = {
                    audio: {
                        deviceId: { exact: selectedMicId },
                        echoCancellation: !isMusicMode,
                        noiseSuppression: !isMusicMode,
                        autoGainControl: false,
                        sampleRate: 48000,
                        channelCount: isMusicMode ? 2 : 1
                    }
                };

                console.log('Requesting microphone with constraints:', constraints);
                micStream = await navigator.mediaDevices.getUserMedia(constraints);
                console.log('Microphone access granted');
                
                const source = audioContext.createMediaStreamSource(micStream);
                currentGainNode = audioContext.createGain();
                const targetVolume = (isMusicMode ? musicVolumeControl.value : talkingVolumeControl.value) / 100;
                currentGainNode.gain.value = targetVolume;
                
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
                            let sample = inputData[i] * (currentGainNode.gain.value || 1);
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
                
                console.log('Connecting audio pipeline...');
                source.connect(currentGainNode);
                currentGainNode.connect(processor);
                processor.connect(audioContext.destination);
                
                const monitorSource = audioContext.createMediaStreamSource(micStream);
                monitorSource.connect(monitorGain);
                monitorGain.connect(audioContext.destination);
                
                console.log('Emitting stream_start...');
                socket.emit('stream_start');
                
                micButton.classList.add('active');
                micButton.textContent = t('stopBroadcast');
                broadcastStatus.textContent = t('broadcasting');
                broadcastStatus.classList.add('live');
                modeButton.disabled = false;
                isBroadcasting = true;
                
                currentModeLabel.textContent = `${t('currentMode')}: ${currentMode === 'talking' ? t('talkMode') : t('musicMode')}`;
                console.log('Broadcasting started successfully');
            } catch (err) {
                broadcastStatus.textContent = '❌ ' + err.message;
                broadcastStatus.classList.remove('live');
                console.error('Broadcasting error:', err);
            }
        } else {
            console.log('Stopping broadcast...');
            if (processor) {
                processor.disconnect();
                processor = null;
            }
            if (currentGainNode) {
                currentGainNode.disconnect();
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
            modeButton.disabled = true;
            isBroadcasting = false;
            console.log('Broadcast stopped');
        }
    });
}

const CORRECT_PIN = '1481';

// Check if Socket.IO is loaded
if (typeof io === 'undefined') {
    document.body.innerHTML = '<div style="color: white; text-align: center; padding: 50px; font-family: Arial; max-width: 600px; margin: 0 auto;"><h1 style="font-size: 48px;">❌</h1><h2>Server Not Running</h2><p style="font-size: 18px; line-height: 1.6;">Please start the server first:</p><code style="background: rgba(0,0,0,0.3); padding: 10px 20px; border-radius: 8px; display: block; margin: 20px 0;">npm start</code><p>Then refresh this page.</p></div>';
    throw new Error('Socket.IO not loaded - server not running');
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
        status.textContent = '❌ Nelze se připojit k serveru';
        status.style.color = '#dc2626';
    }
});

socket.on('connect', () => {
    console.log('Connected to server');
    const status = document.getElementById('connectionStatus') || document.getElementById('broadcastStatus');
    if (status && !isAdmin) {
        status.textContent = 'Připraveno';
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
    let isProcessingQueue = false;

    // Socket event listeners
    socket.on('stream_start', () => {
        connectionStatus.textContent = '🔴 ŽIVÉ vysílání probíhá';
        connectionStatus.classList.add('connected');
    });

    socket.on('stream_stop', () => {
        connectionStatus.textContent = 'Připraveno';
        connectionStatus.classList.remove('connected');
        audioQueue = [];
        if (isPlaying) {
            playButton.click();
        }
    });

    socket.on('broadcaster_connected', () => {
        connectionStatus.textContent = '🔴 ŽIVÉ vysílání probíhá';
        connectionStatus.classList.add('connected');
    });

    socket.on('audio_chunk', (data) => {
        if (isPlaying && audioContext) {
            audioQueue.push(data);
            
            // Keep a small buffer to prevent gaps
            if (!isProcessingQueue || audioQueue.length > 1) {
                processAudioQueue();
            }
        }
    });

    function processAudioQueue() {
        if (audioQueue.length === 0 || !isPlaying || isProcessingQueue) {
            return;
        }

        isProcessingQueue = true;
        const data = audioQueue.shift();

        try {
            const audioData = data.audioData;
            
            // Handle both mono and stereo
            const channelData = Array.isArray(audioData[0]) ? audioData : [audioData];
            const numChannels = channelData.length;
            const bufferLength = channelData[0].length;
            
            const audioBuffer = audioContext.createBuffer(
                numChannels, 
                bufferLength, 
                data.sampleRate || audioContext.sampleRate
            );
            
            // Copy all channels
            for (let i = 0; i < numChannels; i++) {
                const float32Array = new Float32Array(channelData[i]);
                audioBuffer.copyToChannel(float32Array, i);
            }
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            
            const currentTime = audioContext.currentTime;
            
            // Initialize or catch up if we fell behind
            if (nextPlayTime === 0 || nextPlayTime < currentTime) {
                nextPlayTime = currentTime + 0.01; // Small delay to prevent immediate playback issues
            }
            
            source.start(nextPlayTime);
            nextPlayTime += audioBuffer.duration;
            
            source.onended = () => {
                isProcessingQueue = false;
                // Immediately process next if available
                if (audioQueue.length > 0) {
                    processAudioQueue();
                }
            };
            
        } catch (e) {
            console.error('Audio processing error:', e);
            isProcessingQueue = false;
            if (audioQueue.length > 0) {
                setTimeout(() => processAudioQueue(), 10);
            }
        }
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
            
            playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>';
            playButton.classList.add('playing');
            status.textContent = 'Nyní hraje - HITRADIO AUTOBUS';
            status.classList.add('live');
            visualizer.classList.add('active');
            isPlaying = true;
            
            socket.emit('listener_joined');
        } else {
            playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
            playButton.classList.remove('playing');
            status.textContent = 'Klikni pro poslech';
            status.classList.remove('live');
            visualizer.classList.remove('active');
            isPlaying = false;
            audioQueue = [];
            nextPlayTime = 0;
            
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
        listenersCount.textContent = `👥 ${count} posluchač${count === 1 ? '' : count < 5 ? 'i' : 'ů'}`;
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
                microphoneSelect.innerHTML = '<option value="">Žádné mikrofony nenalezeny</option>';
                return;
            }
            
            microphones.forEach((mic, index) => {
                const option = document.createElement('option');
                option.value = mic.deviceId;
                option.textContent = mic.label || `Mikrofon ${index + 1}`;
                microphoneSelect.appendChild(option);
            });
        } catch (err) {
            microphoneSelect.innerHTML = '<option value="">Chyba načítání mikrofonů</option>';
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
                    broadcastStatus.textContent = '❌ Vyberte mikrofon';
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
                
                // Monitor connection (only local)
                source.connect(monitorGain);
                monitorGain.connect(audioContext.destination);
                
                socket.emit('stream_start');
                
                micButton.classList.add('active');
                micButton.textContent = '🎤 Zastavit vysílání';
                broadcastStatus.textContent = '🔴 Vysílání ŽIVĚ';
                broadcastStatus.classList.add('live');
                isBroadcasting = true;
            } catch (err) {
                broadcastStatus.textContent = '❌ Chyba: ' + err.message;
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
            micButton.textContent = '🎤 Spustit vysílání';
            broadcastStatus.textContent = 'Připraveno k vysílání';
            broadcastStatus.classList.remove('live');
            isBroadcasting = false;
        }
    });
}

const CORRECT_PIN = '1481';

// Detect if we're on the admin page
const isAdmin = window.location.hash === '#admin';

const radioInterface = document.getElementById('radioInterface');
const adminPanel = document.getElementById('adminPanel');

// Initialize Socket.IO connection
const socket = io();

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
    let isProcessing = false;
    let nextPlayTime = 0;

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
            if (!isProcessing) {
                processAudioQueue();
            }
        }
    });

    async function processAudioQueue() {
        if (audioQueue.length === 0 || !isPlaying) {
            isProcessing = false;
            return;
        }

        isProcessing = true;
        const data = audioQueue.shift();

        try {
            const float32Array = new Float32Array(data.audioData);
            const audioBuffer = audioContext.createBuffer(1, float32Array.length, data.sampleRate || audioContext.sampleRate);
            audioBuffer.copyToChannel(float32Array, 0);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            
            const currentTime = audioContext.currentTime;
            if (nextPlayTime < currentTime) {
                nextPlayTime = currentTime;
            }
            
            source.start(nextPlayTime);
            nextPlayTime += audioBuffer.duration;
            
            source.onended = () => {
                processAudioQueue();
            };
            
            if (audioQueue.length > 0) {
                setTimeout(() => processAudioQueue(), 0);
            }
        } catch (e) {
            console.error('Audio processing error:', e);
            processAudioQueue();
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
            
            nextPlayTime = audioContext.currentTime;
            
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

                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                const constraints = {
                    audio: {
                        deviceId: selectedMicId ? { exact: selectedMicId } : undefined,
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: false,
                        sampleRate: 48000,
                        channelCount: 1
                    }
                };

                micStream = await navigator.mediaDevices.getUserMedia(constraints);
                
                const source = audioContext.createMediaStreamSource(micStream);
                gainNode = audioContext.createGain();
                gainNode.gain.value = volumeControl.value / 100;
                
                monitorGain = audioContext.createGain();
                monitorGain.gain.value = monitorControl.value / 100;
                
                const bufferSize = 2048;
                processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
                
                processor.onaudioprocess = (e) => {
                    if (!isBroadcasting) return;
                    
                    const inputData = e.inputBuffer.getChannelData(0);
                    const processedData = new Float32Array(inputData.length);
                    
                    for (let i = 0; i < inputData.length; i++) {
                        let sample = inputData[i] * (gainNode.gain.value || 1);
                        if (sample > 0.95) sample = 0.95;
                        if (sample < -0.95) sample = -0.95;
                        processedData[i] = sample;
                    }
                    
                    const audioArray = Array.from(processedData);
                    
                    socket.emit('audio_chunk', { 
                        audioData: audioArray,
                        sampleRate: audioContext.sampleRate
                    });
                };
                
                source.connect(gainNode);
                gainNode.connect(processor);
                processor.connect(audioContext.destination);
                
                gainNode.connect(monitorGain);
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

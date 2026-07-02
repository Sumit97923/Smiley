const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();

// Set static files support (serve index.html from same folder)
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" },
    maxHttpBufferSize: 2e6 // 🌟 2MB Buffer limit taaki images/audio par node crash na ho
});

// Masking dictionary for moderation
const badWords = ['fuck', 'bitch', 'chutiya', 'saala', 'asshole', 'bastard', 'gali1', 'gali2', 'bhenchod', 'gand'];

function maskBadWords(text) {
    if (!text) return "";
    let cleanText = text;
    badWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        cleanText = cleanText.replace(regex, (matched) => {
            if (matched.length <= 2) return '*'.repeat(matched.length);
            return matched[0] + '*'.repeat(matched.length - 2) + matched[matched.length - 1];
        });
    });
    return cleanText;
}

// 🌟 Server side Link Detection (Double Security Check)
function containsLink(text) {
    if (!text) return false;
    const urlPattern = /(https?:\/\/[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/ig;
    return urlPattern.test(text);
}

app.get('/googledf5bde9b8612d08a.html', (req, res) => {
    res.send('google-site-verification: googledf5bde9b8612d08a.html');
});

// Global active channels routing pools including calling modes configuration map
let waitingUsers = { all: [], male: [], female: [] };

// 🌟 Server RAM buffer block reported sockets tracking
const reportedUsers = new Set();

io.on('connection', (socket) => {
    console.log('User connected safely:', socket.id);

    // 🔍 Matchmaker Engine Optimized with WebRTC Streams Pipeline Alignment
    socket.on('find-partner', (data) => {
        // 🚩 Safety Check: Block reported sockets from entering queue
        if (reportedUsers.has(socket.id)) {
            socket.emit('partner-disconnected', 'Aapko bohot se users ne report kiya hai. Matchmaking blocked.');
            return;
        }

        // Mobile fallback and call modes tracking allocation
        const gender = data.gender || 'all';
        const targetGender = data.targetGender || 'all';
        const mode = data.mode || 'video'; // Tracking mode to align SDP pipelines smoothly
        
        socket.gender = gender;
        socket.targetGender = targetGender;
        socket.callMode = mode;

        let pool = waitingUsers[targetGender] || waitingUsers['all'];
        
        // Find match avoiding connecting user to themselves, matching filters and checking reported list tracker
        let partnerSocket = pool.find(s => 
            s.id !== socket.id && 
            !reportedUsers.has(s.id) &&
            (s.targetGender === 'all' || s.targetGender === socket.gender)
        );

        if (partnerSocket) {
            // Remove match from waiting queue matrix
            for (let g in waitingUsers) {
                waitingUsers[g] = waitingUsers[g].filter(s => s.id !== partnerSocket.id);
            }
            
            // Core link binding
            socket.partner = partnerSocket;
            partnerSocket.partner = socket;

            // Trigger handshake pipelines on frontend with synced stream variables
            socket.emit('matched', { isInitiator: true, mode: partnerSocket.callMode });
            partnerSocket.emit('matched', { isInitiator: false, mode: socket.callMode });
            console.log(`🎯 Link established between ${socket.id} & ${partnerSocket.id}`);
        } else {
            // Double check duplication listing clean
            for (let g in waitingUsers) {
                waitingUsers[g] = waitingUsers[g].filter(s => s.id !== socket.id);
            }
            if (!waitingUsers[gender]) waitingUsers[gender] = [];
            waitingUsers[gender].push(socket);
        }
    });

    // 💬 Core Messaging Block with Badword & Link Moderation
    socket.on('text-message', (payload) => {
        if (socket.partner) {
            // 🚫 Link Blocking Rule (If link found, drop transmission packet)
            if (containsLink(payload.text) || containsLink(payload.replyToText)) {
                return; 
            }

            // Filter user input string before transmission
            payload.text = maskBadWords(payload.text);
            if (payload.replyToText) {
                payload.replyToText = maskBadWords(payload.replyToText);
            }
            socket.partner.emit('text-message', payload);
        }
    });

    // 📸 High-Speed Photo Data Route Pipe
    socket.on('send-image', (base64Image) => {
        if (socket.partner) {
            socket.partner.emit('receive-image', base64Image);
        }
    });

    // 🚩 Permanent Report and Instant Kick Execution
    socket.on('report-stranger', () => {
        const badPartner = socket.partner;
        if (badPartner) {
            reportedUsers.add(badPartner.id); // Add offender to block-list
            console.log(`🚩 User ${badPartner.id} was blacklisted by reports.`);
            
            badPartner.emit('partner-disconnected');
            badPartner.partner = null;
            
            // Instantly clean up offender from all routing matrices
            for (let g in waitingUsers) {
                waitingUsers[g] = waitingUsers[g].filter(s => s.id !== badPartner.id);
            }
        }
        socket.partner = null;
    });

    // ✏️ Live Edit Synchronization 
    socket.on('edit-message', (data) => {
        if (socket.partner) {
            if (containsLink(data.newText)) return; // Link secure drop
            data.newText = maskBadWords(data.newText);
            socket.partner.emit('edit-message', data);
        }
    });

    // 🗑️ Live Delete Synchronization
    socket.on('delete-message', (data) => {
        if (socket.partner) {
            socket.partner.emit('delete-message', data);
        }
    });

    // 🎙️ High-Speed Voice Note Data Route
    socket.on('voice-note', (base64Audio) => {
        if (socket.partner) {
            socket.partner.emit('voice-note', base64Audio);
        }
    });

    // 📹 WebRTC Multi-stream Ice Signaling Layer (Crucial for Audio/Video synchronization)
    socket.on('signal', (data) => {
        if (socket.partner) {
            socket.partner.emit('signal', data);
        }
    });

    // ⌨️ Typing Indicator Pulse Router
    socket.on('typing-state', (isTyping) => {
        if (socket.partner) {
            socket.partner.emit('typing-state', isTyping);
        }
    });

    // Centralized safe teardown engine
    const disconnectUser = () => {
        if (socket.partner) {
            socket.partner.emit('partner-disconnected');
            socket.partner.partner = null;
        }
        // Wipe traces from all gender waiting matrix queues
        for (let g in waitingUsers) {
            waitingUsers[g] = waitingUsers[g].filter(s => s.id !== socket.id);
        }
        console.log(`Clean trace teardown for: ${socket.id}`);
    };

    socket.on('skip', disconnectUser);
    socket.on('disconnect', () => {
        disconnectUser();
        reportedUsers.delete(socket.id); // Clean stack allocation memory on socket close
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Master Core Engine Live on http://localhost:${PORT}`));

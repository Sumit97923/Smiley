const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
app.use(express.static(__dirname));
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" } 
});

// Static files support (serve index.html from same folder)
app.use(express.static(__dirname));

// Masking dictionary for moderation
const badWords = ['fuck', 'bitch', 'chutiya', 'saala', 'asshole', 'bastard'];

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

// Global active channels routing pools
let waitingUsers = { all: [], male: [], female: [] };

io.on('connection', (socket) => {
    console.log('User connected safely:', socket.id);

    // 🔍 Matchmaker Engine
    socket.on('find-partner', (data) => {
        const gender = data.gender || 'all';
        const targetGender = data.targetGender || 'all';
        
        socket.gender = gender;
        socket.targetGender = targetGender;

        let pool = waitingUsers[targetGender] || waitingUsers['all'];
        // Find match avoiding connecting user to themselves
        let partnerSocket = pool.find(s => s.id !== socket.id && (s.targetGender === 'all' || s.targetGender === socket.gender));

        if (partnerSocket) {
            // Remove match from waiting queue
            waitingUsers[targetGender] = pool.filter(s => s.id !== partnerSocket.id);
            
            // Core link binding
            socket.partner = partnerSocket;
            partnerSocket.partner = socket;

            // Trigger handshake pipelines on frontend
            socket.emit('matched', { isInitiator: true });
            partnerSocket.emit('matched', { isInitiator: false });
            console.log(`🎯 Link established between ${socket.id} & ${partnerSocket.id}`);
        } else {
            waitingUsers[gender].push(socket);
        }
    });

    // 💬 Core Messaging Block with Badword Moderation
    socket.on('text-message', (payload) => {
        if (socket.partner) {
            // Filter user input string before transmission
            payload.text = maskBadWords(payload.text);
            if (payload.replyToText) {
                payload.replyToText = maskBadWords(payload.replyToText);
            }
            socket.partner.emit('text-message', payload);
        }
    });

    // ✏️ Live Edit Synchronization 
    socket.on('edit-message', (data) => {
        if (socket.partner) {
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

    // 📹 WebRTC Multi-stream Ice Signaling Layer
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
    socket.on('disconnect', disconnectUser);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Master Core Engine Live on http://localhost:${PORT}`));

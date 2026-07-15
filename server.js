const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();

app.use(express.static(__dirname));

const path = require('path');

app.get('/robots.txt', (req, res) => {
    res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
    res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
    maxHttpBufferSize: 2e6
});

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

function containsLink(text) {
    if (!text) return false;
    const urlPattern = /(https?:\/\/[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/ig;
    return urlPattern.test(text);
}

app.get('/googledf5bde9b8612d08a.html', (req, res) => {
    res.send('google-site-verification: googledf5bde9b8612d08a.html');
});

let waitingUsers = { all: [], male: [], female: [] };
const reportedUsers = new Set();

// 🔒 Lightweight per-socket rate limit on find-partner spam (privacy/abuse control)
const FIND_PARTNER_COOLDOWN_MS = 800;

io.on('connection', (socket) => {
    console.log('User connected safely:', socket.id);
    socket.lastFindAt = 0;

    socket.on('find-partner', (data) => {
        const now = Date.now();
        if (now - socket.lastFindAt < FIND_PARTNER_COOLDOWN_MS) return;
        socket.lastFindAt = now;

        if (reportedUsers.has(socket.id)) {
            socket.emit('partner-disconnected', 'Aapko bohot se users ne report kiya hai. Matchmaking blocked.');
            return;
        }

        const gender = data.gender || 'all';
        const targetGender = data.targetGender || 'all';
        const mode = data.mode || 'video';

        socket.gender = gender;
        socket.targetGender = targetGender;
        socket.callMode = mode;

        let pool = waitingUsers[targetGender] || waitingUsers['all'];

        let partnerSocket = pool.find(s =>
            s.id !== socket.id &&
            !reportedUsers.has(s.id) &&
            (s.targetGender === 'all' || s.targetGender === socket.gender)
        );

        if (partnerSocket) {
            for (let g in waitingUsers) {
                waitingUsers[g] = waitingUsers[g].filter(s => s.id !== partnerSocket.id);
            }

            socket.partner = partnerSocket;
            partnerSocket.partner = socket;

            socket.emit('matched', { isInitiator: true, mode: partnerSocket.callMode });
            partnerSocket.emit('matched', { isInitiator: false, mode: socket.callMode });
            console.log(`🎯 Link established between ${socket.id} & ${partnerSocket.id}`);
        } else {
            for (let g in waitingUsers) {
                waitingUsers[g] = waitingUsers[g].filter(s => s.id !== socket.id);
            }
            if (!waitingUsers[gender]) waitingUsers[gender] = [];
            waitingUsers[gender].push(socket);
        }
    });

    socket.on('text-message', (payload) => {
        if (socket.partner) {
            if (containsLink(payload.text) || containsLink(payload.replyToText)) {
                return;
            }

            payload.text = maskBadWords(payload.text);
            if (payload.replyToText) {
                payload.replyToText = maskBadWords(payload.replyToText);
            }
            socket.partner.emit('text-message', payload);
        }
    });

    // ✅ Fixed: was reading socket.partnerId (never set anywhere), so filter/mask
    // sync silently never reached the other person. Now mirrors the pattern
    // used by every other relay handler below (socket.partner).
    socket.on('effect-sync', (data) => {
        if (socket.partner) {
            socket.partner.emit('effect-sync', data);
        }
    });

    socket.on('send-image', (base64Image) => {
        if (socket.partner) {
            socket.partner.emit('receive-image', base64Image);
        }
    });

    socket.on('report-stranger', () => {
        const badPartner = socket.partner;
        if (badPartner) {
            reportedUsers.add(badPartner.id);
            console.log(`🚩 User ${badPartner.id} was blacklisted by reports.`);

            badPartner.emit('partner-disconnected');
            badPartner.partner = null;

            for (let g in waitingUsers) {
                waitingUsers[g] = waitingUsers[g].filter(s => s.id !== badPartner.id);
            }
        }
        socket.partner = null;
    });

    socket.on('edit-message', (data) => {
        if (socket.partner) {
            if (containsLink(data.newText)) return;
            data.newText = maskBadWords(data.newText);
            socket.partner.emit('edit-message', data);
        }
    });

    socket.on('delete-message', (data) => {
        if (socket.partner) {
            socket.partner.emit('delete-message', data);
        }
    });

    socket.on('voice-note', (base64Audio) => {
        if (socket.partner) {
            socket.partner.emit('voice-note', base64Audio);
        }
    });

    socket.on('signal', (data) => {
        if (socket.partner) {
            socket.partner.emit('signal', data);
        }
    });

    socket.on('typing-state', (isTyping) => {
        if (socket.partner) {
            socket.partner.emit('typing-state', isTyping);
        }
    });

    const disconnectUser = () => {
        if (socket.partner) {
            socket.partner.emit('partner-disconnected');
            socket.partner.partner = null;
        }
        for (let g in waitingUsers) {
            waitingUsers[g] = waitingUsers[g].filter(s => s.id !== socket.id);
        }
        console.log(`Clean trace teardown for: ${socket.id}`);
    };

    socket.on('skip', disconnectUser);
    socket.on('disconnect', () => {
        disconnectUser();
        reportedUsers.delete(socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Master Core Engine Live on http://localhost:${PORT}`));

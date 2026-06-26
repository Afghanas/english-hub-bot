const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');

async function startBot() {
    // د واتساپ سیشن ساتل ترڅو بیا بیا سکین ونه غواړي
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const sock = makeWASocket({ auth: state });

    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if (qr) qrcode.generate(qr, { small: true });
        if (connection === 'open') console.log('✅ Bot Connected to Global English Hub!');
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const sender = msg.key.remoteJid;

        // د لینکونو چیک کول او اتومات پاکول
        const hasLink = text.includes('http://') || text.includes('https://') || text.includes('www.');
        
        if (hasLink) {
            await sock.sendMessage(sender, { delete: msg.key });
            await sock.sendMessage(sender, { 
                text: '⚠️ @Member: Unauthorized links are strictly prohibited in Global English Learning Hub! Please ask Haseebullah Rassoli (Admin) for approval first.' 
            });
        }
    });
}

startBot();
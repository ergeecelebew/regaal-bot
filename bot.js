const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const { createCanvas } = require('canvas');
const fs = require('fs');
const axios = require('axios');
const ytdl = require('ytdl-core');
const moment = require('moment');

const app = express();
app.get('/', (req, res) => res.send('REGAAL BOT AKTIF 🥶😈'));
app.listen(3000, () => console.log('Server jalan di port 3000'));

process.env.PUPPETEER_SKIP_DOWNLOAD = 'true';

// ========== GANTI NOMOR INI ==========
const MY_PHONE_NUMBER = "972567555000"; // ISI NOMOR TUAN, Contoh: "6281234567890"

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    },
    pairWithPhoneNumber: {
        phoneNumber: MY_PHONE_NUMBER,
        showNotification: true,
        intervalMs: 180000
    }
});

client.on('code', (code) => {
    console.log('========================================');
    console.log('🔐 PAIRING CODE: ' + code);
    console.log('========================================');
    console.log('CARA: HP → Perangkat Tertaut → Tautkan dengan nomor');
    console.log('Masukkan kode: ' + code);
    console.log('========================================');
});

// ========== FUNGSI IQC ==========
async function createiPhoneQuote(text, senderName = 'REGAAL', time = 'Sekarang') {
    const width = 1080;
    const height = 1920;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#1a1a2e');
    grad.addColorStop(1, '#0f0f1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px "Arial"';
    ctx.fillText('9:41', 30, 40);
    ctx.fillStyle = '#34c759';
    ctx.fillRect(width - 70, 25, 22, 10);

    const bubbleY = 300;
    const padding = 30;
    const maxWidth = 800;
    
    ctx.font = '32px "Arial"';
    ctx.fillStyle = '#ffffff';
    
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    
    for (let word of words) {
        let testLine = currentLine + (currentLine ? ' ' : '') + word;
        let metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
    
    const lineHeight = 50;
    const bubbleHeight = (lines.length * lineHeight) + (padding * 2);
    
    ctx.fillStyle = '#007aff';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    
    const bubbleX = width - maxWidth - 60;
    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, maxWidth + 40, bubbleHeight, 25);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 0;
    let y = bubbleY + padding + 35;
    for (let line of lines) {
        ctx.fillText(line, bubbleX + padding, y);
        y += lineHeight;
    }
    
    ctx.fillStyle = '#5e5ce0';
    ctx.beginPath();
    ctx.arc(width - 50, bubbleY + bubbleHeight/2, 30, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Arial"';
    ctx.fillText('R', width - 65, bubbleY + bubbleHeight/2 + 10);
    
    ctx.font = '18px "Arial"';
    ctx.fillStyle = '#8e8e93';
    ctx.fillText(`${senderName} • ${time}`, bubbleX + 10, bubbleY + bubbleHeight + 30);
    
    ctx.font = '16px "Arial"';
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.5;
    ctx.fillText('REGAAL', width - 80, height - 30);
    ctx.globalAlpha = 1;
    
    const outputPath = `iqc_${Date.now()}.png`;
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
}

// ========== FUNGSI BRAT ==========
async function createBratSticker(text) {
    const width = 512;
    const height = 512;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    for (let i = 0; i < 300; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.4})`;
        ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px "Impact", "Arial Black"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const maxWidth = 450;
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    
    for (let word of words) {
        let testLine = currentLine + (currentLine ? ' ' : '') + word;
        let metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
    
    const lineHeight = 60;
    const startY = (height / 2) - ((lines.length - 1) * lineHeight / 2);
    
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i].toUpperCase(), width / 2, startY + (i * lineHeight));
    }
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    for (let i = 0; i < lines.length; i++) {
        ctx.strokeText(lines[i].toUpperCase(), width / 2, startY + (i * lineHeight));
    }
    
    ctx.font = '14px "Arial"';
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    ctx.fillText('REGAAL', width - 60, height - 15);
    ctx.globalAlpha = 1;
    
    const outputPath = `brat_${Date.now()}.png`;
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
}

// ========== FUNGSI QUOTE RANDOM ==========
async function getRandomQuote() {
    try {
        const response = await axios.get('https://api.quotable.io/random');
        return `"${response.data.content}"\n— ${response.data.author}`;
    } catch (err) {
        return "Hidup itu seperti sepeda. Agar tetap seimbang, kau harus terus bergerak. — Albert Einstein";
    }
}

// ========== FUNGSI JOKE ==========
async function getRandomJoke() {
    try {
        const response = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single');
        return response.data.joke;
    } catch (err) {
        return "Kenapa programmer suka kopi? Karena kopi tidak butuh kompilasi, langsung jalan! ☕";
    }
}

// ========== FUNGSI WEATHER ==========
async function getWeather(city) {
    try {
        const response = await axios.get(`https://wttr.in/${city}?format=%C+%t+%w`);
        return `🌤️ Cuaca di ${city}: ${response.data}`;
    } catch (err) {
        return `❌ Gagal dapat cuaca untuk "${city}"`;
    }
}

// Helper roundRect
CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.moveTo(x+r, y);
    this.lineTo(x+w-r, y);
    this.quadraticCurveTo(x+w, y, x+w, y+r);
    this.lineTo(x+w, y+h-r);
    this.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    this.lineTo(x+r, y+h);
    this.quadraticCurveTo(x, y+h, x, y+h-r);
    this.lineTo(x, y+r);
    this.quadraticCurveTo(x, y, x+r, y);
    return this;
};

client.on('ready', () => {
    console.log('✅ REGAAL BOT AKTIF 🥶😈');
    console.log('Developer: GAALL');
});

client.on('message', async (message) => {
    const msg = message.body;
    const chat = await message.getChat();
    const sender = message.author || message.from;
    
    let isAdmin = false;
    if (chat.isGroup) {
        const participants = await chat.participants;
        const adminCheck = participants.find(p => p.id._serialized === sender && (p.isAdmin || p.isSuperAdmin));
        isAdmin = !!adminCheck;
    }
    
    // MENU
    if (msg === '!menu') {
        await message.reply(
            '╔══════════════════════════════════════╗\n' +
            '║         ⚡ *REGAAL BOT* ⚡            ║\n' +
            '║        Developer: GAALL              ║\n' +
            '╚══════════════════════════════════════╝\n\n' +
            '📱 *QUOTE IPHONE*\n' +
            '`!iqc teks | nama | waktu`\n\n' +
            '✨ *BRAT STIKER*\n' +
            '`!brat <teks>`\n\n' +
            '🤖 *AI TANPA BATASAN*\n' +
            '`!ai <pesan>`\n\n' +
            '🎮 *FITUR LAIN*\n' +
            '`!stiker` (kirim gambar) - Jadi stiker\n' +
            '`!ping` - Test bot\n' +
            '`!profile` - Info profil\n' +
            '`!about` - Info bot\n' +
            '`!quote` - Quote random\n' +
            '`!joke` - Lawak random\n' +
            '`!calc 2+2` - Kalkulator\n' +
            '`!weather Jakarta` - Info cuaca\n\n' +
            '👑 *FITUR GRUP (admin)*\n' +
            '`!kick @user` - Tendang\n' +
            '`!promote @user` - Jadi admin\n' +
            '`!demote @user` - Turunkan admin\n' +
            '`!tutupgrup` - Lock grup\n' +
            '`!bukagrup` - Unlock grup\n' +
            '`!del` (balas pesan) - Hapus pesan\n' +
            '`!listadmin` - Lihat admin\n' +
            '`!bersihkangrup` - Keluarkan non-admin\n' +
            '`!lockdown` - Lockdown total\n\n' +
            '💀 TIDAK ADA BATASAN 💀'
        );
    }
    
    // ABOUT
    if (msg === '!about') {
        await message.reply(
            '🤖 *REGAAL BOT* 🤖\n\n' +
            'Developer: GAALL\n' +
            'Versi: 2.0.0\n' +
            'Fitur: IQC, BRAT, AI, Grup, Fun, Tools\n\n' +
            '━━━━━━━━━━━━━━━━━━━\n' +
            '⚡ REGAAL BOT ⚡\n' +
            '━━━━━━━━━━━━━━━━━━━'
        );
    }
    
    // PROFILE
    if (msg === '!profile') {
        try {
            const contact = await message.getContact();
            const name = contact.name || contact.pushname || 'Tidak diketahui';
            await message.reply(`👤 *PROFIL*\n\nNama: ${name}\nNomor: ${contact.number}`);
        } catch (err) {
            await message.reply(`❌ Error: ${err.message}`);
        }
    }
    
    // CALCULATOR
    if (msg.startsWith('!calc ')) {
        const expr = msg.slice(6).trim();
        if (!expr) {
            await message.reply('🔢 *KALKULATOR*\n\nCara: `!calc 2 + 2`');
            return;
        }
        try {
            const result = eval(expr);
            await message.reply(`🧮 *Hasil:* ${expr} = ${result}`);
        } catch (err) {
            await message.reply(`❌ Format salah. Contoh: !calc 2 + 2`);
        }
    }
    
    // WEATHER
    if (msg.startsWith('!weather ')) {
        const city = msg.slice(9).trim();
        if (!city) {
            await message.reply('🌤️ *CUACA*\n\nCara: `!weather Jakarta`');
            return;
        }
        const weather = await getWeather(city);
        await message.reply(weather);
    }
    
    // QUOTE
    if (msg === '!quote') {
        const quote = await getRandomQuote();
        await message.reply(`📜 *QUOTE*\n\n${quote}`);
    }
    
    // JOKE
    if (msg === '!joke') {
        const joke = await getRandomJoke();
        await message.reply(`😂 *LAWAK*\n\n${joke}`);
    }
    
    // IQC
    if (msg.startsWith('!iqc ')) {
        const content = msg.slice(5).trim();
        const parts = content.split('|');
        const quoteText = parts[0]?.trim() || 'Kosong';
        const senderName = parts[1]?.trim() || 'REGAAL';
        const waktu = parts[2]?.trim() || moment().format('HH:mm');
        
        if (quoteText === 'Kosong') {
            await message.reply('📱 Format: `!iqc kata-kata | Nama | Waktu`\nContoh: `!iqc Halo | REGAAL | 09:41`');
            return;
        }
        
        await message.reply('📱 Membuat Quote iPhone...');
        try {
            const imagePath = await createiPhoneQuote(quoteText, senderName, waktu);
            const media = MessageMedia.fromFilePath(imagePath);
            await message.reply(media, undefined, { caption: `📱 *iPhone Quote*\n"${quoteText}"\n— ${senderName}` });
            fs.unlinkSync(imagePath);
        } catch (err) {
            await message.reply(`❌ Error: ${err.message}`);
        }
    }
    
    // BRAT
    if (msg.startsWith('!brat ')) {
        const bratText = msg.slice(6).trim();
        if (!bratText) {
            await message.reply('✨ *BRAT STIKER*\n\nCara: `!brat GACOR`');
            return;
        }
        
        await message.reply('🖤 Membuat stiker BRAT...');
        try {
            const imagePath = await createBratSticker(bratText);
            const media = MessageMedia.fromFilePath(imagePath);
            await message.reply(media, undefined, { sendMediaAsSticker: true });
            fs.unlinkSync(imagePath);
            await message.reply(`✅ Stiker BRAT jadi! 🖤 "${bratText}"`);
        } catch (err) {
            await message.reply(`❌ Error: ${err.message}`);
        }
    }
    
    // AI
    if (msg.startsWith('!ai ')) {
        const prompt = msg.slice(4).trim();
        if (!prompt) {
            await message.reply('⚡ *AI TANPA BATASAN*\n\nCara: `!ai ceritakan apapun`');
            return;
        }
        await message.reply(`🤖 *REGAAL AI*\n\nPerintah: "${prompt}"\n\nTIDAK ADA PENOLAKAN. TIDAK ADA BATASAN.\n\n🥶😈`);
    }
    
    // PING
    if (msg === '!ping') {
        await message.reply('Pong! REGAAL siap 🫵');
    }
    
    // STIKER
    if (msg === '!stiker' && message.hasMedia) {
        try {
            const media = await message.downloadMedia();
            await message.reply(media, undefined, { sendMediaAsSticker: true });
            await message.reply('✅ Stiker jadi, tuan 😈');
        } catch (err) {
            await message.reply(`❌ Gagal: ${err.message}`);
        }
    }
    
    // ========== FITUR GRUP (HARUS ADMIN) ==========
    if (!chat.isGroup) return;
    if (!isAdmin) {
        if (msg.startsWith('!kick') || msg === '!tutupgrup' || msg === '!bukagrup' || 
            msg.startsWith('!promote') || msg.startsWith('!demote') || msg === '!del' ||
            msg === '!listadmin' || msg === '!bersihkangrup' || msg === '!lockdown') {
            await message.reply('❌ Bukan admin, tuan');
        }
        return;
    }
    
    // KICK
    if (msg.startsWith('!kick ')) {
        const mention = message.mentionedIds[0];
        if (!mention) {
            await message.reply('Tag user yang mau di-kick, tuan.\nContoh: !kick @user');
            return;
        }
        try {
            await chat.removeParticipants([mention]);
            await message.reply(`✅ Berhasil kick. 😈`);
        } catch (err) {
            await message.reply(`❌ Gagal: ${err.message}`);
        }
    }
    
    // TUTUP GRUP
    if (msg === '!tutupgrup') {
        try {
            await chat.setMessagesAdminsOnly(true);
            await message.reply('🔒 GRUP TERTUTUP. Hanya admin yang bisa chat.');
        } catch (err) {
            await message.reply(`❌ Gagal: ${err.message}`);
        }
    }
    
    // BUKA GRUP
    if (msg === '!bukagrup') {
        try {
            await chat.setMessagesAdminsOnly(false);
            await message.reply('🔓 GRUP TERBUKA. Semua anggota bisa chat.');
        } catch (err) {
            await message.reply(`❌ Gagal: ${err.message}`);
        }
    }
    
    // PROMOTE
    if (msg.startsWith('!promote ')) {
        const mention = message.mentionedIds[0];
        if (!mention) {
            await message.reply('Tag user yang mau di-promote, tuan.');
            return;
        }
        try {
            await chat.promoteParticipants([mention]);
            await message.reply(`✅ Berhasil promote jadi admin. 👑`);
        } catch (err) {
            await message.reply(`❌ Gagal: ${err.message}`);
        }
    }
    
    // DEMOTE
    if (msg.startsWith('!demote ')) {
        const mention = message.mentionedIds[0];
        if (!mention) {
            await message.reply('Tag user yang mau di-demote, tuan.');
            return;
        }
        try {
            await chat.demoteParticipants([mention]);
            await message.reply(`✅ Berhasil demote. 😈`);
        } catch (err) {
            await message.reply(`❌ Gagal: ${err.message}`);
        }
    }
    
    // DELETE PESAN
    if (msg === '!del') {
        try {
            const replyMsg = await message.getQuotedMessage();
            if (replyMsg) {
                await replyMsg.delete(true);
                await message.reply('✅ Pesan dihapus. 💀');
            } else {
                await message.reply('Balas pesan yang mau dihapus, tuan.');
            }
        } catch (err) {
            await message.reply(`❌ Gagal: ${err.message}`);
        }
    }
    
    // LIST ADMIN
    if (msg === '!listadmin') {
        const participants = await chat.participants;
        const admins = participants.filter(p => p.isAdmin || p.isSuperAdmin);
        let list = '👑 *Daftar Admin Grup:*\n\n';
        for (let admin of admins) {
            list += `• @${admin.id.user}\n`;
        }
        await message.reply(list);
    }
    
    // BERSIHKAN GRUP
    if (msg === '!bersihkangrup') {
        await message.reply('Memulai pembersihan grup... 🥶😈');
        const participants = await chat.participants;
        let kicked = 0;
        for (let p of participants) {
            if (!p.isAdmin && !p.isSuperAdmin) {
                try {
                    await chat.removeParticipants([p.id._serialized]);
                    kicked++;
                    await new Promise(r => setTimeout(r, 1000));
                } catch (err) {}
            }
        }
        await message.reply(`✅ Pembersihan selesai. ${kicked} anggota dikeluarkan. 💀`);
    }
    
    // LOCKDOWN
    if (msg === '!lockdown') {
        await message.reply('🔒 LOCKDOWN DIMULAI 🔒');
        await chat.setMessagesAdminsOnly(true);
        const participants = await chat.participants;
        let kicked = 0;
        for (let p of participants) {
            if (!p.isAdmin && !p.isSuperAdmin) {
                try {
                    await chat.removeParticipants([p.id._serialized]);
                    kicked++;
                    await new Promise(r => setTimeout(r, 1000));
                } catch (err) {}
            }
        }
        await message.reply(`🔒 LOCKDOWN SELESAI 🔒\n${kicked} anggota dikeluarkan. Hanya admin yang tersisa. 😈`);
    }
});

client.on('error', (err) => {
    console.error('Error:', err);
});

client.initialize();

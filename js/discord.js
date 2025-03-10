// Konfigurasi Discord API
const DISCORD_USER_ID = '802424434807144449'; // Masukkan Discord User ID Anda di sini
const DISCORD_USERNAME = 'radinkaa'; // Masukkan username Discord Anda di sini

// Konfigurasi tambahan
const DISCORD_AVATAR_HASH = ''; // Contoh: 'abcdef1234567890' (opsional, kosongkan jika tidak diketahui)

// Debugging mode
const DEBUG = true;

// Fungsi untuk logging debug
function debugLog(...args) {
    if (DEBUG) {
        console.log('[Discord Debug]', ...args);
    }
}

// Fungsi untuk menginisialisasi integrasi Discord
function initDiscord() {
    debugLog('Inisialisasi integrasi Discord');
    
    // Tampilkan data Discord yang dikonfigurasi secara manual
    displayConfiguredDiscordData();
    
    // Coba dapatkan avatar dari Discord CDN
    tryGetDiscordAvatar();
}

// Fungsi untuk menampilkan data Discord yang dikonfigurasi secara manual
function displayConfiguredDiscordData() {
    debugLog('Menampilkan data Discord yang dikonfigurasi');
    
    // Perbarui username
    const usernameElement = document.querySelector('.discord-name');
    if (usernameElement) {
        usernameElement.textContent = `@${DISCORD_USERNAME}`;
        debugLog('Username diperbarui ke:', DISCORD_USERNAME);
    }
    
    // Perbarui link "Add on Discord"
    const discordLinkElement = document.querySelector('.discord-add');
    if (discordLinkElement) {
        discordLinkElement.href = `https://discord.com/users/${DISCORD_USER_ID}`;
        debugLog('Link "Add on Discord" diperbarui');
    }
    
    // Tambahkan status offline
    addDiscordStatus('offline');
}

// Fungsi untuk mencoba mendapatkan avatar Discord
function tryGetDiscordAvatar() {
    debugLog('Mencoba mendapatkan avatar Discord');
    
    // Coba beberapa metode untuk mendapatkan avatar
    tryDiscordAvatarCDN();
}

// Fungsi untuk mencoba mendapatkan avatar dari Discord CDN
function tryDiscordAvatarCDN() {
    debugLog('Mencoba mendapatkan avatar dari Discord CDN');
    
    // Jika ada avatar hash kustom, coba gunakan itu terlebih dahulu
    if (DISCORD_AVATAR_HASH) {
        const customAvatarUrl = `https://cdn.discordapp.com/avatars/802424434807144449/5895e255dcf06317bbfbb273a7703abe.png?size=1024`;
        tryLoadImage(customAvatarUrl);
        return;
    }
    
    // Jika tidak ada avatar hash atau gagal, gunakan avatar default
    const defaultAvatarId = parseInt(DISCORD_USER_ID) % 5;
    const defaultAvatarUrl = `https://cdn.discordapp.com/avatars/802424434807144449/5895e255dcf06317bbfbb273a7703abe.png?size=1024`;
    tryLoadImage(defaultAvatarUrl);
}

// Fungsi untuk mencoba memuat gambar
function tryLoadImage(url) {
    debugLog('Mencoba memuat gambar:', url);
    
    const img = new Image();
    img.onload = function() {
        debugLog('Berhasil memuat gambar:', url);
        updateDiscordAvatar(url);
    };
    img.onerror = function() {
        debugLog('Gagal memuat gambar:', url);
    };
    img.src = url;
}

// Fungsi untuk memperbarui avatar Discord
function updateDiscordAvatar(avatarUrl) {
    const discordImgEl = document.querySelector('.discord-img');
    if (discordImgEl && !discordImgEl.dataset.updated) {
        discordImgEl.src = avatarUrl;
        discordImgEl.dataset.updated = 'true'; // Tandai bahwa avatar sudah diperbarui
        debugLog('Avatar diperbarui ke:', avatarUrl);
    }
}

// Fungsi untuk menambahkan status Discord
function addDiscordStatus(status) {
    debugLog('Menambahkan status:', status);
    
    // Hapus status yang ada jika ada
    const existingStatus = document.querySelector('.discord-status');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    if (status) {
        const discordStatusEl = document.createElement('div');
        discordStatusEl.className = 'discord-status';
        discordStatusEl.classList.add(`status-${status}`);
        
        // Tambahkan status ke elemen discord-user
        const discordUserEl = document.querySelector('.discord-user');
        if (discordUserEl) {
            discordUserEl.appendChild(discordStatusEl);
            
            // Tambahkan CSS untuk status
            addStatusCSS();
        } else {
            debugLog('Elemen discord-user tidak ditemukan');
        }
    }
}

// Fungsi untuk menambahkan CSS untuk status Discord
function addStatusCSS() {
    // Cek apakah CSS sudah ada
    if (!document.getElementById('discord-status-css')) {
        debugLog('Menambahkan CSS untuk status Discord');
        
        const style = document.createElement('style');
        style.id = 'discord-status-css';
        style.textContent = `
            .discord-user {
                position: relative;
            }
            .discord-status {
                position: absolute;
                bottom: 5px;
                left: 30px;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                border: 2px solid var(--bg-color, rgba(30, 30, 30, 0.8));
                z-index: 2;
            }
            .status-online {
                background-color: #43b581;
            }
            .status-idle {
                background-color: #faa61a;
            }
            .status-dnd {
                background-color: #f04747;
            }
            .status-offline {
                background-color: #747f8d;
            }
        `;
        document.head.appendChild(style);
    }
}

// Inisialisasi saat dokumen dimuat
document.addEventListener('DOMContentLoaded', function() {
    debugLog('DOM loaded, inisialisasi integrasi Discord');
    
    // Cek apakah Discord User ID telah diatur
    if (DISCORD_USER_ID) {
        debugLog('Discord User ID ditemukan:', DISCORD_USER_ID);
        
        // Inisialisasi integrasi Discord
        initDiscord();
    } else {
        console.warn('Discord User ID belum diatur. Silakan atur DISCORD_USER_ID di file discord.js');
        debugLog('Discord User ID tidak dikonfigurasi');
    }
}); 
// Konfigurasi Discord API
const DISCORD_USER_ID = '802424434807144449'; // Masukkan Discord User ID Anda di sini
const DISCORD_USERNAME = 'radinkaa'; // Masukkan username Discord Anda di sini

// Konfigurasi tambahan
const DISCORD_AVATAR_HASH = '5895e255dcf06317bbfbb273a7703abe'; // Avatar hash dari data Lanyard

// Debugging mode
const DEBUG = true;

// Lanyard API URL
const LANYARD_API_URL = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`;
const LANYARD_SOCKET_URL = 'wss://api.lanyard.rest/socket';

// Variabel untuk WebSocket dan polling
let socket = null;
let reconnectInterval = null;
let pollingInterval = null;
let websocketRetryCount = 0;
const MAX_WEBSOCKET_RETRIES = 3;

// Cek apakah browser mendukung WebSocket
const WEBSOCKET_SUPPORTED = typeof WebSocket !== 'undefined';

// Fungsi untuk logging debug
function debugLog(...args) {
    if (DEBUG) {
        console.log('[Discord Debug]', ...args);
    }
}

// Fungsi untuk menginisialisasi integrasi Discord
function initDiscord() {
    debugLog('Inisialisasi integrasi Discord');
    
    // Tampilkan data Discord yang dikonfigurasi secara manual sebagai fallback awal
    displayConfiguredDiscordData();
    
    // Bersihkan interval yang mungkin masih berjalan
    if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
    }
    
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
    
    // Reset counter percobaan WebSocket
    websocketRetryCount = 0;
    
    // Coba dapatkan data real-time dari Lanyard API
    fetchLanyardData();
    
    // Coba inisialisasi WebSocket untuk pembaruan real-time
    initLanyardWebSocket();
    
    // Atur polling sebagai metode utama untuk memperbarui data
    // Polling akan memeriksa data setiap 30 detik
    pollingInterval = setInterval(() => {
        debugLog('Polling untuk data baru...');
        fetchLanyardData();
    }, 30000);
    
    // Tambahkan event listener untuk visibilitychange
    // Ini akan memperbarui data ketika tab browser menjadi aktif kembali
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            debugLog('Tab menjadi visible, memperbarui data...');
            fetchLanyardData();
        }
    });
}

// Fungsi untuk menampilkan data Discord yang dikonfigurasi secara manual (fallback)
function displayConfiguredDiscordData() {
    debugLog('Menampilkan data Discord yang dikonfigurasi (fallback)');
    
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
    
    // Tambahkan status offline sebagai default
    addDiscordStatus('offline');
    
    // Coba dapatkan avatar dari Discord CDN
    tryGetDiscordAvatar();
}

// Fungsi untuk mengambil data dari Lanyard API
function fetchLanyardData() {
    debugLog('Mengambil data dari Lanyard API:', LANYARD_API_URL);
    
    fetch(LANYARD_API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            debugLog('Data Lanyard diterima:', data);
            if (data.success) {
                updateDiscordDataFromLanyard(data.data);
                
                // Jika WebSocket tidak didukung atau gagal terhubung, tetap gunakan polling
                if (WEBSOCKET_SUPPORTED && (!socket || socket.readyState !== WebSocket.OPEN) && websocketRetryCount < MAX_WEBSOCKET_RETRIES) {
                    debugLog('WebSocket tidak terhubung, mencoba inisialisasi ulang...');
                    // Hanya coba lagi jika belum mencapai batas percobaan
                    setTimeout(initLanyardWebSocket, 1000);
                }
            } else {
                throw new Error('Lanyard API returned unsuccessful response');
            }
        })
        .catch(error => {
            debugLog('Error mengambil data Lanyard:', error);
            
            // Jika error adalah masalah jaringan atau CORS, gunakan data statis
            if (error instanceof TypeError || error.message.includes('NetworkError') || error.message.includes('CORS')) {
                debugLog('Terdeteksi error jaringan atau CORS, menggunakan data statis');
                displayConfiguredDiscordData();
            }
            
            // Tidak perlu mencoba lagi di sini karena polling interval akan menanganinya
        });
}

// Fungsi untuk inisialisasi WebSocket Lanyard
function initLanyardWebSocket() {
    // Jika sudah mencoba terlalu banyak kali, gunakan polling saja
    if (websocketRetryCount >= MAX_WEBSOCKET_RETRIES) {
        debugLog(`Mencapai batas maksimum percobaan WebSocket (${MAX_WEBSOCKET_RETRIES}), beralih ke polling saja`);
        return;
    }
    
    websocketRetryCount++;
    debugLog(`Inisialisasi WebSocket Lanyard (percobaan ke-${websocketRetryCount})`);
    
    try {
        // Tutup socket yang ada jika masih terbuka
        if (socket && socket.readyState !== WebSocket.CLOSED) {
            socket.close();
        }
        
        socket = new WebSocket(LANYARD_SOCKET_URL);
        
        socket.onopen = function() {
            debugLog('WebSocket terhubung');
            
            // Reset counter percobaan karena berhasil terhubung
            websocketRetryCount = 0;
            
            // Kirim pesan subscribe
            socket.send(JSON.stringify({
                op: 2,
                d: {
                    subscribe_to_ids: [DISCORD_USER_ID]
                }
            }));
            
            // Kirim heartbeat setiap 30 detik
            if (reconnectInterval) {
                clearInterval(reconnectInterval);
            }
            
            reconnectInterval = setInterval(() => {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    debugLog('Mengirim heartbeat');
                    socket.send(JSON.stringify({
                        op: 3
                    }));
                } else {
                    debugLog('Socket tidak terbuka, membersihkan interval heartbeat');
                    clearInterval(reconnectInterval);
                    reconnectInterval = null;
                }
            }, 30000);
        };
        
        socket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                debugLog('WebSocket message received:', data);
                
                if (data.op === 0) {
                    const eventType = data.t;
                    const eventData = data.d;
                    
                    debugLog('Event type:', eventType);
                    
                    if (eventType === 'INIT_STATE') {
                        debugLog('Received INIT_STATE');
                        if (eventData[DISCORD_USER_ID]) {
                            updateDiscordDataFromLanyard(eventData[DISCORD_USER_ID]);
                        }
                    } else if (eventType === 'PRESENCE_UPDATE') {
                        debugLog('Received PRESENCE_UPDATE');
                        if (eventData.user_id === DISCORD_USER_ID) {
                            updateDiscordDataFromLanyard(eventData);
                        }
                    }
                } else if (data.op === 1) {
                    debugLog('Received HELLO, sending identify');
                    // Kirim identify setelah menerima HELLO
                    socket.send(JSON.stringify({
                        op: 2,
                        d: {
                            subscribe_to_ids: [DISCORD_USER_ID]
                        }
                    }));
                }
            } catch (error) {
                debugLog('Error parsing WebSocket message:', error);
            }
        };
        
        socket.onclose = function(event) {
            debugLog('WebSocket terputus dengan kode:', event.code, 'alasan:', event.reason);
            
            // Bersihkan interval heartbeat
            if (reconnectInterval) {
                clearInterval(reconnectInterval);
                reconnectInterval = null;
            }
            
            // Jika belum mencapai batas percobaan, coba lagi setelah beberapa detik
            if (websocketRetryCount < MAX_WEBSOCKET_RETRIES) {
                const retryDelay = Math.min(5000 * Math.pow(2, websocketRetryCount - 1), 30000);
                debugLog(`Mencoba menghubungkan kembali dalam ${retryDelay/1000} detik...`);
                setTimeout(initLanyardWebSocket, retryDelay);
            } else {
                debugLog('Mencapai batas maksimum percobaan WebSocket, beralih ke polling saja');
            }
        };
        
        socket.onerror = function(error) {
            debugLog('Error WebSocket:', error);
            
            // Tutup socket jika terjadi error
            if (socket) {
                socket.close();
            }
        };
    } catch (error) {
        debugLog('Error inisialisasi WebSocket:', error);
        websocketRetryCount = MAX_WEBSOCKET_RETRIES; // Hindari percobaan lebih lanjut
    }
}

// Fungsi untuk memperbarui data Discord dari Lanyard
function updateDiscordDataFromLanyard(data) {
    debugLog('Memperbarui data Discord dari Lanyard:', data);
    
    try {
        // Perbarui status online/offline
        const status = data.discord_status || 'offline';
        addDiscordStatus(status);
        debugLog('Status diperbarui ke:', status);
        
        // Perbarui avatar jika tersedia
        if (data.discord_user && data.discord_user.avatar) {
            const avatarHash = data.discord_user.avatar;
            const avatarUrl = `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/${avatarHash}.png?size=128`;
            updateDiscordAvatar(avatarUrl);
            debugLog('Avatar diperbarui dengan hash:', avatarHash);
        }
        
        // Perbarui username jika tersedia
        if (data.discord_user && data.discord_user.username) {
            const username = data.discord_user.username;
            const discriminator = data.discord_user.discriminator;
            const displayName = data.discord_user.display_name || data.discord_user.global_name || username;
            const fullUsername = discriminator !== '0' ? `${username}#${discriminator}` : displayName;
            
            const usernameElement = document.querySelector('.discord-name');
            if (usernameElement) {
                usernameElement.textContent = `@${fullUsername}`;
                debugLog('Username diperbarui ke:', fullUsername);
            }
        }
        
        // Tambahkan informasi aktivitas jika tersedia
        if (data.activities && data.activities.length > 0) {
            addActivityInfo(data.activities);
            debugLog('Aktivitas diperbarui dengan', data.activities.length, 'aktivitas');
        } else if (data.spotify) {
            // Khusus untuk Spotify jika tidak ada di activities
            const spotifyActivity = {
                type: 2, // LISTENING
                name: 'Spotify',
                details: data.spotify.song,
                state: data.spotify.artist,
                assets: {
                    large_image: data.spotify.album_art_url,
                    large_text: data.spotify.album
                }
            };
            addActivityInfo([spotifyActivity]);
            debugLog('Aktivitas Spotify diperbarui');
        } else {
            // Hapus informasi aktivitas jika tidak ada
            removeActivityInfo();
            debugLog('Aktivitas dihapus karena tidak ada aktivitas');
        }
    } catch (error) {
        debugLog('Error saat memperbarui data Discord:', error);
    }
}

// Fungsi untuk menambahkan informasi aktivitas
function addActivityInfo(activities) {
    debugLog('Menambahkan informasi aktivitas:', activities);
    
    // Hapus informasi aktivitas yang ada
    removeActivityInfo();
    
    // Cari aktivitas yang ingin ditampilkan (prioritaskan PLAYING, kemudian STREAMING, dll.)
    const activity = activities.find(a => a.type === 0) || // PLAYING
                    activities.find(a => a.type === 1) || // STREAMING
                    activities.find(a => a.type === 2) || // LISTENING
                    activities.find(a => a.type === 3) || // WATCHING
                    activities.find(a => a.type === 5) || // COMPETING
                    activities[0]; // Ambil yang pertama jika tidak ada yang cocok
    
    if (activity) {
        const activityType = getActivityTypeText(activity.type);
        const activityName = activity.name;
        const activityDetails = activity.details || '';
        const activityState = activity.state || '';
        
        // Buat elemen aktivitas
        const activityEl = document.createElement('div');
        activityEl.className = 'discord-activity';
        
        // Tambahkan kelas khusus berdasarkan jenis aktivitas
        activityEl.classList.add(`activity-type-${activity.type}`);
        
        // Tambahkan ikon sesuai jenis aktivitas
        let activityIcon = '';
        switch (activity.type) {
            case 0: // PLAYING
                activityIcon = '<i class="fas fa-gamepad"></i>';
                break;
            case 1: // STREAMING
                activityIcon = '<i class="fas fa-broadcast-tower"></i>';
                break;
            case 2: // LISTENING
                activityIcon = '<i class="fas fa-music"></i>';
                break;
            case 3: // WATCHING
                activityIcon = '<i class="fas fa-tv"></i>';
                break;
            case 5: // COMPETING
                activityIcon = '<i class="fas fa-trophy"></i>';
                break;
            default:
                activityIcon = '<i class="fas fa-circle"></i>';
        }
        
        // Persiapkan gambar aktivitas jika ada
        let activityImage = '';
        if (activity.assets && activity.assets.large_image) {
            let imageUrl = activity.assets.large_image;
            
            // Jika URL adalah ID Spotify, konversi ke URL gambar Spotify
            if (imageUrl.startsWith('spotify:')) {
                imageUrl = `https://i.scdn.co/image/${imageUrl.split(':')[1]}`;
            }
            // Jika URL adalah ID Discord, konversi ke URL gambar Discord
            else if (!imageUrl.startsWith('http')) {
                imageUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${imageUrl}.png`;
            }
            
            activityImage = `
                <div class="activity-image">
                    <img src="${imageUrl}" alt="${activityName}" onerror="this.style.display='none'">
                </div>
            `;
        }
        
        // Buat HTML untuk aktivitas
        activityEl.innerHTML = `
            <div class="activity-content">
                ${activityImage}
                <div class="activity-info">
                    <div class="activity-header">
                        <div class="activity-icon">${activityIcon}</div>
                        <div class="activity-type">${activityType}</div>
                    </div>
                    <div class="activity-name">${activityName}</div>
                    ${activityDetails ? `<div class="activity-details">${activityDetails}</div>` : ''}
                    ${activityState ? `<div class="activity-state">${activityState}</div>` : ''}
                    ${activity.timestamps ? `<div class="activity-time"><i class="far fa-clock"></i> ${formatActivityTime(activity.timestamps)}</div>` : ''}
                </div>
            </div>
        `;
        
        // Tambahkan ke elemen discord-section
        const discordSection = document.querySelector('.discord-section');
        if (discordSection) {
            discordSection.appendChild(activityEl);
            
            // Tambahkan CSS untuk aktivitas
            addActivityCSS();
            
            // Tambahkan efek hover
            activityEl.addEventListener('mouseenter', function() {
                this.classList.add('activity-hover');
            });
            
            activityEl.addEventListener('mouseleave', function() {
                this.classList.remove('activity-hover');
            });
        }
    }
}

// Fungsi untuk memformat waktu aktivitas
function formatActivityTime(timestamps) {
    if (!timestamps || !timestamps.start) return 'Just now';
    
    const now = new Date();
    const start = new Date(timestamps.start);
    const diff = Math.floor((now - start) / 1000 / 60); // dalam menit
    
    if (diff < 1) return 'Just started';
    if (diff < 60) return `${diff} minute${diff === 1 ? '' : 's'}`;
    
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'}`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'}`;
}

// Fungsi untuk menghapus informasi aktivitas
function removeActivityInfo() {
    const activityEl = document.querySelector('.discord-activity');
    if (activityEl) {
        activityEl.remove();
    }
}

// Fungsi untuk menambahkan CSS untuk aktivitas
function addActivityCSS() {
    // Cek apakah CSS sudah ada
    if (!document.getElementById('discord-activity-css')) {
        debugLog('Menambahkan CSS untuk aktivitas Discord');
        
        const style = document.createElement('style');
        style.id = 'discord-activity-css';
        style.textContent = `
            .discord-activity {
                margin-top: 12px;
                padding: 10px;
                background-color: rgba(40, 40, 40, 0.6);
                border-radius: 10px;
                font-size: 14px;
                transition: all 0.3s ease;
                border-left: 3px solid #7289da;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            
            .discord-activity.activity-hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                background-color: rgba(50, 50, 50, 0.7);
            }
            
            .activity-content {
                display: flex;
                align-items: center;
            }
            
            .activity-image {
                width: 60px;
                height: 60px;
                margin-right: 12px;
                border-radius: 8px;
                overflow: hidden;
                flex-shrink: 0;
                background-color: rgba(30, 30, 30, 0.5);
            }
            
            .activity-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .activity-info {
                flex: 1;
                min-width: 0;
            }
            
            .activity-header {
                display: flex;
                align-items: center;
                margin-bottom: 4px;
            }
            
            .activity-icon {
                margin-right: 6px;
                font-size: 14px;
                color: #7289da;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .activity-type {
                color: #aaa;
                font-size: 12px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .activity-name {
                font-weight: bold;
                margin: 2px 0;
                font-size: 15px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .activity-details, .activity-state {
                font-size: 13px;
                color: #ddd;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 2px;
            }
            
            .activity-time {
                font-size: 11px;
                color: #999;
                margin-top: 4px;
                display: flex;
                align-items: center;
            }
            
            .activity-time i {
                margin-right: 4px;
                font-size: 10px;
            }
            
            /* Warna khusus berdasarkan jenis aktivitas */
            .activity-type-0 { border-left-color: #3ba55c; } /* PLAYING */
            .activity-type-1 { border-left-color: #fb3c4e; } /* STREAMING */
            .activity-type-2 { border-left-color: #1db954; } /* LISTENING */
            .activity-type-3 { border-left-color: #ff0000; } /* WATCHING */
            .activity-type-5 { border-left-color: #faa61a; } /* COMPETING */
            
            .activity-type-0 .activity-icon { color: #3ba55c; }
            .activity-type-1 .activity-icon { color: #fb3c4e; }
            .activity-type-2 .activity-icon { color: #1db954; }
            .activity-type-3 .activity-icon { color: #ff0000; }
            .activity-type-5 .activity-icon { color: #faa61a; }
            
            @media (max-width: 480px) {
                .activity-image {
                    width: 50px;
                    height: 50px;
                }
                
                .discord-activity {
                    padding: 8px;
                }
            }
        `;
        document.head.appendChild(style);
    }
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
        const customAvatarUrl = `https://cdn.discordapp.com/avatars/${DISCORD_USER_ID}/${DISCORD_AVATAR_HASH}.png?size=128`;
        tryLoadImage(customAvatarUrl);
        return;
    }
    
    // Jika tidak ada avatar hash atau gagal, gunakan avatar default
    const defaultAvatarId = parseInt(DISCORD_USER_ID) % 5;
    const defaultAvatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarId}.png`;
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
        
        // Jika URL berisi avatar kustom dan gagal, coba avatar default
        if (url.includes('/avatars/')) {
            const defaultAvatarId = parseInt(DISCORD_USER_ID) % 5;
            const defaultAvatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarId}.png`;
            tryLoadImage(defaultAvatarUrl);
        }
    };
    img.src = url;
}

// Fungsi untuk memperbarui avatar Discord
function updateDiscordAvatar(avatarUrl) {
    const discordImgEl = document.querySelector('.discord-img');
    if (discordImgEl) {
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

// Fungsi untuk mendapatkan teks jenis aktivitas
function getActivityTypeText(type) {
    switch (type) {
        case 0: return 'Playing';
        case 1: return 'Streaming';
        case 2: return 'Listening to';
        case 3: return 'Watching';
        case 5: return 'Competing in';
        default: return 'Active in';
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
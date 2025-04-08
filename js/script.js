// Inisialisasi counter view
document.addEventListener('DOMContentLoaded', function() {
    // Increment view counter
    let viewCount = localStorage.getItem('viewCount') || 0;
    viewCount = parseInt(viewCount) + 1;
    localStorage.setItem('viewCount', viewCount);
    document.getElementById('view-counter').textContent = viewCount;
    
    // Inisialisasi social icons
    initSocialIcons();
    
    // Inisialisasi music player dengan lagu lokal
    initMusicPlayer();
    
    // Inisialisasi toggle playlist
    initPlaylistToggle();
});

// Fungsi untuk inisialisasi social icons
function initSocialIcons() {
    // Tambahkan event listener untuk social icons
    const socialIcons = document.querySelectorAll('.social-icon');
    socialIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Fungsi untuk inisialisasi music player dengan lagu lokal
function initMusicPlayer() {
    const playPauseBtn = document.getElementById('play-pause');
    const prevTrackBtn = document.getElementById('prev-track');
    const nextTrackBtn = document.getElementById('next-track');
    const shuffleBtn = document.getElementById('shuffle');
    const progressBar = document.querySelector('.progress');
    const progressBarContainer = document.querySelector('.progress-bar');
    const currentTimeEl = document.querySelector('.current-time');
    const durationEl = document.querySelector('.duration');
    const currentTrackTitleEl = document.getElementById('current-track-title');
    const currentTrackArtistEl = document.getElementById('current-track-artist');
    const volumeControl = document.querySelector('.volume-control i');
    
    // Periksa apakah elemen yang diperlukan ada
    if (!playPauseBtn || !prevTrackBtn || !nextTrackBtn || !progressBar || !currentTrackTitleEl || !currentTrackArtistEl || !shuffleBtn) {
        console.warn('Beberapa elemen kontrol player tidak ditemukan');
        return;
    }
    
    // Daftar lagu lokal
    const songs = [
        {
            title: 'West Coast',
            artist: 'Lana Del Rey',
            file: 'audio/West Coast.mp3'
        },
        {
            title: 'Young and Beautiful',
            artist: 'Lana Del Rey',
            file: 'audio/Young and Beautiful.mp3'
        },
        {
            title: 'Radio',
            artist: 'Lana Del Rey',
            file: 'audio/Radio.mp3'
        },
        {
            title: 'Runaway',
            artist: 'AURORA',
            file: 'audio/Runaway.mp3'
        },
        {
            title: 'Disenchanted',
            artist: 'My Chemical Romance',
            file: 'audio/Disenchanted.mp3'
        },
        {
            title: 'See you again ft. Kali Uchis',
            artist: 'Tyler, The Creator, Kali Uchis',
            file: 'audio/See you again.mp3'
        },
        {
            title: 'About You',
            artist: 'The 1975',
            file: 'audio/About You.mp3'
        },
        {
            title: 'Cancer',
            artist: 'My Chemical Romance',
            file: 'audio/Cancer.mp3'
        },
    ];
    
    // Inisialisasi audio player
    const audioPlayer = new Audio();
    let currentSongIndex = 0;
    let isPlaying = false;
    let isMuted = false;
    let isShuffleMode = false;
    let originalSongs = [...songs]; // Simpan urutan asli
    let shuffledSongs = [...songs]; // Untuk urutan acak
    
    // Format waktu dari detik ke format mm:ss
    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Fungsi untuk memuat dan memainkan lagu
    function loadAndPlaySong(index) {
        const song = songs[index];
        
        // Hapus event listener lama jika ada
        audioPlayer.removeEventListener('loadedmetadata', updateDuration);
        
        // Set source dan muat audio
        audioPlayer.src = song.file;
        audioPlayer.load();
        
        // Update informasi lagu
        currentTrackTitleEl.textContent = song.title;
        currentTrackArtistEl.textContent = song.artist;
        
        // Reset tampilan durasi sampai file audio dimuat
        durationEl.textContent = '00:00';
        currentTimeEl.textContent = '00:00';
        
        // Ketika metadata audio dimuat, perbarui durasi
        audioPlayer.addEventListener('loadedmetadata', updateDuration);
        
        // Coba putar jika isPlaying true
        if (isPlaying) {
            playAudio();
        }
        
        // Fungsi untuk memperbarui durasi
        function updateDuration() {
            durationEl.textContent = formatTime(audioPlayer.duration);
        }
        
        // Fungsi untuk memutar audio dengan penanganan error
        function playAudio() {
            const playPromise = audioPlayer.play();
            
            // Tangani promise untuk browser modern
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    // Autoplay berhasil
                    isPlaying = true;
                    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                })
                .catch(error => {
                    // Autoplay diblokir atau error lainnya
                    console.error('Error playing audio:', error);
                    isPlaying = false;
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                });
            }
        }
    }
    
    // Update informasi lagu
    function updateSongInfo() {
        const song = songs[currentSongIndex];
        currentTrackTitleEl.textContent = song.title;
        currentTrackArtistEl.textContent = song.artist;
    }
    
    // Toggle play/pause
    function togglePlay() {
        if (isPlaying) {
            // Jeda audio
            audioPlayer.pause();
            isPlaying = false;
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            // Putar audio dengan penanganan error
            const playPromise = audioPlayer.play();
            
            // Tangani promise untuk browser modern
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    // Autoplay berhasil
                    isPlaying = true;
                    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                })
                .catch(error => {
                    // Autoplay diblokir atau error lainnya
                    console.error('Error playing audio:', error);
                    isPlaying = false;
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                });
            }
        }
    }
    
    // Pindah ke lagu berikutnya
    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadAndPlaySong(currentSongIndex);
    }
    
    // Pindah ke lagu sebelumnya
    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        loadAndPlaySong(currentSongIndex);
    }
    
    // Toggle mute
    function toggleMute() {
        audioPlayer.muted = !audioPlayer.muted;
        isMuted = audioPlayer.muted;
        
        if (isMuted) {
            volumeControl.className = 'fas fa-volume-mute';
        } else {
            volumeControl.className = 'fas fa-volume-up';
        }
    }
    
    // Update progress bar saat lagu diputar
    audioPlayer.addEventListener('timeupdate', function() {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = `${progress}%`;
        
        // Update current time display
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    });
    
    // Ketika lagu selesai, putar lagu berikutnya
    audioPlayer.addEventListener('ended', nextSong);
    
    // Klik pada progress bar untuk melompat ke posisi tertentu
    progressBarContainer.addEventListener('click', function(e) {
        if (!audioPlayer) return;
        
        // Jika sedang dragging, jangan lakukan apa-apa karena sudah ditangani oleh event mouseup
        if (isDragging) return;
        
        const rect = progressBarContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        
        // Batasi nilai pos antara 0 dan 1
        const clampedPos = Math.max(0, Math.min(1, pos));
        
        // Perbarui posisi lagu
        if (audioPlayer.duration) {
            audioPlayer.currentTime = clampedPos * audioPlayer.duration;
        }
    });
    
    // Tambahkan event listener untuk drag pada progress bar
    let isDragging = false;
    
    progressBarContainer.addEventListener('mousedown', function(e) {
        e.preventDefault(); // Mencegah pemilihan teks
        
        isDragging = true;
        updateProgressFromMouse(e);
        
        // Tambahkan class untuk menunjukkan bahwa sedang dragging
        progressBarContainer.classList.add('dragging');
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            updateProgressFromMouse(e);
        }
    });
    
    document.addEventListener('mouseup', function(e) {
        if (isDragging) {
            // Update posisi akhir saat mouse dilepas
            updateProgressFromMouse(e, true);
            
            isDragging = false;
            progressBarContainer.classList.remove('dragging');
        }
    });
    
    // Tambahkan event listener untuk touch events (mobile)
    progressBarContainer.addEventListener('touchstart', function(e) {
        e.preventDefault(); // Mencegah scroll
        
        isDragging = true;
        updateProgressFromTouch(e);
        
        // Tambahkan class untuk menunjukkan bahwa sedang dragging
        progressBarContainer.classList.add('dragging');
    });
    
    document.addEventListener('touchmove', function(e) {
        if (isDragging) {
            updateProgressFromTouch(e);
        }
    });
    
    document.addEventListener('touchend', function(e) {
        if (isDragging) {
            // Update posisi akhir saat touch dilepas
            updateProgressFromTouch(e, true);
            
            isDragging = false;
            progressBarContainer.classList.remove('dragging');
        }
    });
    
    // Fungsi untuk memperbarui progress berdasarkan posisi mouse
    function updateProgressFromMouse(e, isFinal = false) {
        if (!audioPlayer || !isDragging) return;
        
        const rect = progressBarContainer.getBoundingClientRect();
        let pos = (e.clientX - rect.left) / rect.width;
        
        // Batasi nilai pos antara 0 dan 1
        pos = Math.max(0, Math.min(1, pos));
        
        // Update visual progress bar segera untuk responsivitas
        progressBar.style.width = `${pos * 100}%`;
        
        // Update tampilan waktu saat ini
        if (audioPlayer.duration) {
            const newTime = pos * audioPlayer.duration;
            currentTimeEl.textContent = formatTime(newTime);
            
            // Hanya perbarui posisi audio jika ini adalah event final (mouseup)
            // atau jika kita ingin update real-time
            if (isFinal) {
                audioPlayer.currentTime = newTime;
            }
        }
    }
    
    // Fungsi untuk memperbarui progress berdasarkan posisi touch
    function updateProgressFromTouch(e, isFinal = false) {
        if (!audioPlayer || !isDragging) return;
        
        // Dapatkan touch pertama
        const touch = e.touches && e.touches.length ? e.touches[0] : 
                     (e.changedTouches && e.changedTouches.length ? e.changedTouches[0] : null);
        
        if (!touch) return;
        
        const rect = progressBarContainer.getBoundingClientRect();
        let pos = (touch.clientX - rect.left) / rect.width;
        
        // Batasi nilai pos antara 0 dan 1
        pos = Math.max(0, Math.min(1, pos));
        
        // Update visual progress bar segera untuk responsivitas
        progressBar.style.width = `${pos * 100}%`;
        
        // Update tampilan waktu saat ini
        if (audioPlayer.duration) {
            const newTime = pos * audioPlayer.duration;
            currentTimeEl.textContent = formatTime(newTime);
            
            // Hanya perbarui posisi audio jika ini adalah event final (touchend)
            // atau jika kita ingin update real-time
            if (isFinal) {
                audioPlayer.currentTime = newTime;
            }
        }
    }
    
    // Fungsi untuk mengacak array (algoritma Fisher-Yates)
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    // Fungsi untuk mengaktifkan/menonaktifkan mode shuffle
    function toggleShuffle() {
        isShuffleMode = !isShuffleMode;
        
        if (isShuffleMode) {
            // Aktifkan mode shuffle
            shuffleBtn.classList.add('active');
            
            // Simpan indeks lagu saat ini
            const currentSong = songs[currentSongIndex];
            
            // Acak lagu-lagu
            shuffledSongs = shuffleArray(songs);
            
            // Pastikan lagu yang sedang diputar tetap menjadi yang pertama
            const currentSongShuffledIndex = shuffledSongs.findIndex(song => 
                song.title === currentSong.title && song.artist === currentSong.artist);
            
            if (currentSongShuffledIndex !== -1) {
                // Pindahkan lagu saat ini ke posisi pertama
                [shuffledSongs[0], shuffledSongs[currentSongShuffledIndex]] = 
                    [shuffledSongs[currentSongShuffledIndex], shuffledSongs[0]];
            }
            
            // Ganti array lagu dengan versi yang diacak
            songs.length = 0;
            shuffledSongs.forEach(song => songs.push(song));
            
            // Reset indeks ke 0 (lagu saat ini)
            currentSongIndex = 0;
            
        } else {
            // Nonaktifkan mode shuffle
            shuffleBtn.classList.remove('active');
            
            // Simpan lagu yang sedang diputar
            const currentSong = songs[currentSongIndex];
            
            // Kembalikan ke urutan asli
            songs.length = 0;
            originalSongs.forEach(song => songs.push(song));
            
            // Temukan indeks lagu saat ini dalam urutan asli
            currentSongIndex = songs.findIndex(song => 
                song.title === currentSong.title && song.artist === currentSong.artist);
            
            if (currentSongIndex === -1) {
                currentSongIndex = 0;
            }
        }
        
        console.log('Shuffle mode:', isShuffleMode);
        console.log('Current song index:', currentSongIndex);
    }
    
    // Event listeners untuk tombol kontrol
    playPauseBtn.addEventListener('click', function() {
        // Add button press effect
        this.classList.add('pressed');
        setTimeout(() => this.classList.remove('pressed'), 150);
        
        togglePlay();
    });
    
    nextTrackBtn.addEventListener('click', function() {
        // Add button press effect
        this.classList.add('pressed');
        setTimeout(() => this.classList.remove('pressed'), 150);
        
        nextSong();
    });
    
    prevTrackBtn.addEventListener('click', function() {
        // Add button press effect
        this.classList.add('pressed');
        setTimeout(() => this.classList.remove('pressed'), 150);
        
        prevSong();
    });
    
    shuffleBtn.addEventListener('click', function() {
        // Add button press effect
        this.classList.add('pressed');
        setTimeout(() => this.classList.remove('pressed'), 150);
        
        toggleShuffle();
    });
    
    if (volumeControl) {
        volumeControl.addEventListener('click', toggleMute);
    }
    
    // Muat lagu pertama
    loadAndPlaySong(currentSongIndex);
    
    // Debug: Tampilkan informasi tentang elemen-elemen yang digunakan
    console.log('Music Player Elements:', {
        currentTrackTitleEl: currentTrackTitleEl,
        currentTrackArtistEl: currentTrackArtistEl,
        songs: songs
    });
}

// Fungsi untuk toggle playlist Spotify
function initPlaylistToggle() {
    const togglePlaylistBtn = document.getElementById('toggle-playlist');
    const spotifyPlaylist = document.getElementById('spotify-playlist');
    
    if (!togglePlaylistBtn || !spotifyPlaylist) {
        console.warn('Elemen playlist tidak ditemukan');
        return;
    }
    
    // Toggle playlist dengan efek slide
    togglePlaylistBtn.addEventListener('click', function() {
        // Get the current state
        const isHidden = spotifyPlaylist.style.display === 'none' || spotifyPlaylist.style.display === '';
        
        if (isHidden) {
            // First make it visible but with height 0
            spotifyPlaylist.style.display = 'block';
            spotifyPlaylist.style.maxHeight = '0';
            spotifyPlaylist.style.opacity = '0';
            
            // Force a reflow to ensure the browser recognizes the change
            void spotifyPlaylist.offsetWidth;
            
            // Then animate to full height
            setTimeout(() => {
                spotifyPlaylist.classList.add('active');
                spotifyPlaylist.style.maxHeight = '152px';
                spotifyPlaylist.style.opacity = '1';
            }, 10);
            
            togglePlaylistBtn.textContent = 'Tutup Playlist';
        } else {
            // Animate to height 0
            spotifyPlaylist.classList.remove('active');
            spotifyPlaylist.style.maxHeight = '0';
            spotifyPlaylist.style.opacity = '0';
            
            // Then hide it after animation completes
            setTimeout(() => {
                spotifyPlaylist.style.display = 'none';
            }, 300);
            
            togglePlaylistBtn.textContent = 'Playlist';
        }
    });
} 
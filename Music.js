// MusicPlayerModule.js
(function () {
    'use strict';

    const STORAGE_KEY = 'itd_music_user_tracks';

    const STATE = {
        open: false,
        tracks: [],
        index: -1,
        repeat: 'off', // off | one | all
        shuffle: false
    };

    const style = document.createElement('style');
    style.textContent = `
    .itd-music-btn {
        position:fixed;
        bottom:20px;
        right:20px;
        width:54px;
        height:54px;
        border-radius:16px;
        background:rgba(25,25,25,.75);
        backdrop-filter:blur(14px);
        display:flex;
        align-items:center;
        justify-content:center;
        cursor:pointer;
        z-index:9999;
        transition:.15s;
    }
    .itd-music-btn:hover { background:rgba(40,40,40,.85); }

    .itd-player {
        position:fixed;
        bottom:90px;
        right:20px;
        width:340px;
        background:rgba(20,20,20,.8);
        backdrop-filter:blur(18px);
        border-radius:18px;
        padding:14px;
        color:#fff;
        font-family:system-ui;
        z-index:9999;
        display:none;
        flex-direction:column;
        gap:12px;
    }
    .itd-player.active { display:flex; }

    .itd-title {
        font-size:14px;
        font-weight:600;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
    }

    .itd-progress {
        height:4px;
        background:rgba(255,255,255,.15);
        border-radius:4px;
        cursor:pointer;
        position:relative;
    }
    .itd-progress-fill {
        height:100%;
        background:#fff;
        width:0%;
        border-radius:4px;
    }

    .itd-controls {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
    }

    .itd-btn {
        width:32px;
        height:32px;
        display:flex;
        align-items:center;
        justify-content:center;
        cursor:pointer;
        opacity:.85;
        transition:.15s;
    }
    .itd-btn:hover { opacity:1; }

    .itd-list {
        max-height:180px;
        overflow:auto;
        font-size:13px;
    }
    .itd-track {
        padding:6px 8px;
        border-radius:6px;
        cursor:pointer;
        display:flex;
        justify-content:space-between;
        align-items:center;
    }
    .itd-track:hover {
        background:rgba(255,255,255,.1);
    }
    .itd-remove {
        opacity:.4;
        cursor:pointer;
    }
    .itd-remove:hover { opacity:1; }
    `;
    document.head.appendChild(style);

    const musicBtn = document.createElement('div');
    musicBtn.className = 'itd-music-btn';
    musicBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="26" height="26" fill="white">
        <path d="M12 3v10.5a4 4 0 1 0 2 3.5V7h4V3h-6z"/>
    </svg>`;
    document.body.appendChild(musicBtn);

    const player = document.createElement('div');
    player.className = 'itd-player';
    player.innerHTML = `
        <div class="itd-title">Нет трека</div>
        <div class="itd-progress"><div class="itd-progress-fill"></div></div>
        <div class="itd-controls"></div>
        <div class="itd-list"></div>
    `;
    document.body.appendChild(player);

    const audio = new Audio();
    audio.volume = 0.8;

    audio.addEventListener('timeupdate', () => {
        const fill = player.querySelector('.itd-progress-fill');
        fill.style.width = `${(audio.currentTime / audio.duration) * 100 || 0}%`;
    });

    audio.addEventListener('ended', () => {
        if (STATE.repeat === 'one') play(STATE.index);
        else next();
    });

    const icon = d => `
    <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
        <path d="${d}"/>
    </svg>`;

    const icons = {
        play: icon('M8 5v14l11-7z'),
        pause: icon('M6 5h4v14H6zm8 0h4v14h-4z'),
        prev: icon('M6 6h2v12H6zm3 6l9 6V6z'),
        next: icon('M16 6h2v12h-2zM6 18V6l9 6z'),
        repeat: icon('M7 7h10v4l4-5-4-5v4H5v6h2V7z'),
        shuffle: icon('M16 3h5v5l-1.5-1.5-3 3-4-4-8 8-2-2 10-10 4 4 1.5-1.5z'),
        add: icon('M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z')
    };

    const controls = player.querySelector('.itd-controls');

    const btn = (svg, action) => {
        const b = document.createElement('div');
        b.className = 'itd-btn';
        b.innerHTML = svg;
        b.onclick = action;
        return b;
    };

    const playBtn = btn(icons.play, () => {
        if (audio.paused) audio.play();
        else audio.pause();
    });

    controls.append(
        btn(icons.prev, prev),
        playBtn,
        btn(icons.next, next),
        btn(icons.repeat, () => {
            STATE.repeat = STATE.repeat === 'off' ? 'all' : STATE.repeat === 'all' ? 'one' : 'off';
        }),
        btn(icons.shuffle, () => STATE.shuffle = !STATE.shuffle),
        btn(icons.add, addTracks)
    );

    audio.addEventListener('play', () => playBtn.innerHTML = icons.pause);
    audio.addEventListener('pause', () => playBtn.innerHTML = icons.play);

    const loadTracks = () => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch { return []; }
    };
    const saveTracks = t => localStorage.setItem(STORAGE_KEY, JSON.stringify(t));

    const rebuildList = () => {
        STATE.tracks = loadTracks();
        const list = player.querySelector('.itd-list');
        list.innerHTML = '';

        STATE.tracks.forEach((t, i) => {
            const el = document.createElement('div');
            el.className = 'itd-track';
            el.innerHTML = `
                <span>${t.title}</span>
                <span class="itd-remove">✕</span>
            `;
            el.onclick = () => play(i);
            el.querySelector('.itd-remove').onclick = e => {
                e.stopPropagation();
                STATE.tracks.splice(i, 1);
                saveTracks(STATE.tracks);
                rebuildList();
            };
            list.appendChild(el);
        });
    };

    const play = i => {
        if (!STATE.tracks[i]) return;
        STATE.index = i;
        audio.src = STATE.tracks[i].data;
        audio.play();
        player.querySelector('.itd-title').textContent = STATE.tracks[i].title;
    };

    function next() {
        if (!STATE.tracks.length) return;
        let i = STATE.shuffle
            ? Math.floor(Math.random() * STATE.tracks.length)
            : STATE.index + 1;

        if (i >= STATE.tracks.length) {
            if (STATE.repeat === 'all') i = 0;
            else return;
        }
        play(i);
    }

    function prev() {
        play(Math.max(STATE.index - 1, 0));
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.multiple = true;
    input.style.display = 'none';
    document.body.appendChild(input);

    function addTracks() {
        input.click();
    }

    input.onchange = () => {
        const saved = loadTracks();
        [...input.files].forEach(f => {
            const r = new FileReader();
            r.onload = e => {
                saved.push({
                    title: f.name.replace(/\.[^/.]+$/, ''),
                    data: e.target.result
                });
                saveTracks(saved);
                rebuildList();
            };
            r.readAsDataURL(f);
        });
        input.value = '';
    };

    musicBtn.onclick = () => {
        STATE.open = !STATE.open;
        player.classList.toggle('active', STATE.open);
        rebuildList();
    };

    player.querySelector('.itd-progress').onclick = e => {
        const r = e.currentTarget.getBoundingClientRect();
        audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
    };

    console.log('[ITD+] MusicPlayerModule loaded');
    window.initMusicPlayerModule = () => {};
})();

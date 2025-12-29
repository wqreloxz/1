// MusicPageModule.js
(function () {
    'use strict';

    const STORAGE_KEY = 'itd_music_tracks';

    const style = document.createElement('style');
    style.textContent = `
    .itd-nav-music {
        display:flex;
        align-items:center;
        gap:10px;
        cursor:pointer;
    }
    .itd-music-page {
        position:fixed;
        inset:0;
        background:#0f0f10;
        color:#fff;
        font-family:system-ui;
        z-index:10000;
        display:none;
        flex-direction:column;
    }
    .itd-music-header {
        padding:16px;
        font-size:20px;
        font-weight:600;
        border-bottom:1px solid #222;
    }
    .itd-music-content {
        flex:1;
        overflow:auto;
        padding:12px;
    }
    .itd-track-row {
        padding:10px 12px;
        border-radius:10px;
        display:flex;
        justify-content:space-between;
        align-items:center;
        cursor:pointer;
    }
    .itd-track-row:hover {
        background:#1a1a1d;
    }
    .itd-track-title {
        font-size:14px;
    }
    .itd-upload {
        margin:12px;
        padding:10px;
        border-radius:10px;
        background:#1e1e22;
        cursor:pointer;
        text-align:center;
    }
    .itd-player-bar {
        height:64px;
        background:#151518;
        border-top:1px solid #222;
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:0 16px;
    }
    `;
    document.head.appendChild(style);

    const addMusicButton = () => {
        const nav = document.querySelector('.bottom-nav, .mobile-nav');
        if (!nav || nav.querySelector('.itd-nav-music')) return;

        const btn = document.createElement('div');
        btn.className = 'itd-nav-music';
        btn.innerHTML = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M12 3v10.5a4 4 0 1 0 2 3.5V7h4V3h-6z"/>
        </svg>
        <span>Музыка</span>
        `;
        btn.onclick = openMusicPage;
        nav.appendChild(btn);
    };

    const page = document.createElement('div');
    page.className = 'itd-music-page';
    page.innerHTML = `
        <div class="itd-music-header">Музыка</div>
        <div class="itd-upload">Загрузить музыку</div>
        <div class="itd-music-content"></div>
        <div class="itd-player-bar">
            <div class="itd-now">Ничего не играет</div>
            <div class="itd-play">▶</div>
        </div>
    `;
    document.body.appendChild(page);

    const audio = new Audio();

    const loadTracks = () => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch { return []; }
    };
    const saveTracks = t => localStorage.setItem(STORAGE_KEY, JSON.stringify(t));

    const renderList = () => {
        const list = page.querySelector('.itd-music-content');
        list.innerHTML = '';
        loadTracks().forEach((t, i) => {
            const row = document.createElement('div');
            row.className = 'itd-track-row';
            row.innerHTML = `<div class="itd-track-title">${t.title}</div>`;
            row.onclick = () => playTrack(i);
            list.appendChild(row);
        });
    };

    const playTrack = i => {
        const t = loadTracks()[i];
        if (!t) return;
        audio.src = t.data;
        audio.play();
        page.querySelector('.itd-now').textContent = t.title;
    };

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.multiple = true;
    input.style.display = 'none';
    document.body.appendChild(input);

    page.querySelector('.itd-upload').onclick = () => input.click();

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
                renderList();
            };
            r.readAsDataURL(f);
        });
        input.value = '';
    };

    const openMusicPage = () => {
        page.style.display = 'flex';
        renderList();
    };

    new MutationObserver(addMusicButton).observe(document.body, {
        childList: true,
        subtree: true
    });

    addMusicButton();

    console.log('[ITD+] Music Page loaded');
    window.initMusicPageModule = () => {};
})();

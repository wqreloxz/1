// VideoOverlayUIModule.js
(function () {
    'use strict';

    const STATE = {
        video: null,
        overlay: null
    };

    const style = document.createElement('style');
    style.textContent = `
    .itd-overlay {
        position:absolute;
        inset:0;
        display:flex;
        align-items:flex-end;
        opacity:0;
        transition:.2s;
        pointer-events:none;
        background:linear-gradient(to top, rgba(0,0,0,.6), rgba(0,0,0,.1));
    }
    .itd-overlay.active {
        opacity:1;
        pointer-events:auto;
    }
    .itd-controls {
        display:flex;
        gap:10px;
        margin:12px;
        padding:10px 14px;
        background:rgba(20,20,20,.6);
        backdrop-filter:blur(14px);
        border-radius:14px;
        align-items:center;
    }
    .itd-btn {
        width:36px;height:36px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        background:rgba(255,255,255,.12);
        cursor:pointer;
        transition:.15s;
    }
    .itd-btn:hover {
        background:rgba(255,255,255,.25);
    }
    .itd-btn svg {
        width:18px;height:18px;
        fill:#fff;
    }
    .itd-hud {
        position:absolute;
        top:10px;
        left:10px;
        font:12px monospace;
        color:#0f0;
        background:rgba(0,0,0,.6);
        padding:6px 8px;
        border-radius:8px;
        display:none;
    }
    `;
    document.head.appendChild(style);

    const createOverlay = video => {
        if (video._itd) return;

        const overlay = document.createElement('div');
        overlay.className = 'itd-overlay';

        const controls = document.createElement('div');
        controls.className = 'itd-controls';

        const btn = (svg, action) => {
            const b = document.createElement('div');
            b.className = 'itd-btn';
            b.innerHTML = svg;
            b.onclick = action;
            return b;
        };

        const playSVG = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
        const backSVG = `<svg viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6zM13 6v12l8.5-6z"/></svg>`;
        const fwdSVG = `<svg viewBox="0 0 24 24"><path d="M13 6v12l8.5-6zM11 6v12l-8.5-6z"/></svg>`;
        const loopSVG = `<svg viewBox="0 0 24 24"><path d="M17 1l4 4-4 4V6H3V4h14V1zM7 23l-4-4 4-4v3h14v2H7v3z"/></svg>`;
        const pipSVG = `<svg viewBox="0 0 24 24"><path d="M19 7h-8v6h8V7zM21 3H3v18h18V3z"/></svg>`;
        const speedSVG = `<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 100 18 9 9 0 000-18zm1 5h-2v6l5 3 .8-1.2-3.8-2.3V8z"/></svg>`;
        const statsSVG = `<svg viewBox="0 0 24 24"><path d="M3 3h18v18H3V3zm4 10h2v4H7v-4zm4-6h2v10h-2V7zm4 3h2v7h-2v-7z"/></svg>`;

        let speed = 1;
        let loop = false;
        let hudEnabled = false;

        const hud = document.createElement('div');
        hud.className = 'itd-hud';
        video.parentElement.style.position = 'relative';
        video.parentElement.appendChild(hud);

        controls.append(
            btn(playSVG, () => video.paused ? video.play() : video.pause()),
            btn(backSVG, () => video.currentTime -= 10),
            btn(fwdSVG, () => video.currentTime += 10),
            btn(speedSVG, () => {
                speed = speed >= 4 ? 0.5 : speed + 0.5;
                video.playbackRate = speed;
            }),
            btn(loopSVG, () => {
                loop = !loop;
                video.loop = loop;
            }),
            btn(pipSVG, () => {
                if (document.pictureInPictureElement) {
                    document.exitPictureInPicture();
                } else video.requestPictureInPicture();
            }),
            btn(statsSVG, () => {
                hudEnabled = !hudEnabled;
                hud.style.display = hudEnabled ? 'block' : 'none';
            })
        );

        overlay.appendChild(controls);
        video.parentElement.appendChild(overlay);

        video.addEventListener('click', () => {
            overlay.classList.toggle('active');
        });

        video._itd = true;

        setInterval(() => {
            if (!hudEnabled) return;
            hud.textContent =
                ` ${video.currentTime.toFixed(1)}s\n` +
                ` ${video.videoWidth}x${video.videoHeight}\n` +
                ` x${video.playbackRate}\n` +
                ` ${video.buffered.length ? video.buffered.end(0).toFixed(1) : 0}s`;
        }, 500);
    };

    const scan = () => {
        document.querySelectorAll('video').forEach(createOverlay);
    };

    new MutationObserver(scan).observe(document.body, {
        childList: true,
        subtree: true
    });

    scan();

    console.log('[ITD+] Video Overlay UI loaded');
    window.initVideoOverlayUIModule = () => {};
})();

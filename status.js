 // ITD+ Profile Badge
(function () {
    'use strict';

    const BADGE_TEXT = ' [ITD+]';

    const isProfilePage = () => {
        
        return (
            location.pathname.includes('/profile') ||
            document.querySelector('.profile-header, .profile-page')
        );
    };

    const addBadge = () => {
        if (!isProfilePage()) return;

        const nameEl =
            document.querySelector('.profile-name') ||
            document.querySelector('.user-name') ||
            document.querySelector('.profile-header h1');

        if (!nameEl) return;

        
        if (nameEl.textContent.includes('[ITD+]')) return;

        nameEl.textContent += BADGE_TEXT;
    };

    
    addBadge();
    const observer = new MutationObserver(addBadge);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();

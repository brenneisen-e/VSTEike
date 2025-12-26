/**
 * Versicherung Images Module
 * ES6 Module for image upload and management (ES2024)
 */

// ========================================
// UPLOAD MODE
// ========================================

let uploadModeActive = true;

export function toggleUploadMode() {
    const toggle = document.getElementById('uploadModeToggle');
    const hint = document.getElementById('uploadModeHint');

    uploadModeActive = toggle?.checked ?? true;

    if (uploadModeActive) {
        document.body.classList.add('upload-mode-active');
        if (hint) hint.style.display = 'block';
        console.log('Upload-Modus aktiviert');
    } else {
        document.body.classList.remove('upload-mode-active');
        if (hint) hint.style.display = 'none';
        console.log('Upload-Modus deaktiviert');
    }
}

export function initUploadMode() {
    const toggle = document.getElementById('uploadModeToggle');
    if (toggle) toggle.checked = true;
    document.body.classList.add('upload-mode-active');

    const hint = document.getElementById('uploadModeHint');
    if (hint) hint.style.display = 'block';

    uploadModeActive = true;
    console.log('Upload-Modus standardmäßig aktiviert');
}

// ========================================
// LOGO UPLOAD
// ========================================

export function triggerLogoUpload() {
    if (!uploadModeActive) {
        console.log('Upload-Modus nicht aktiv');
        return;
    }
    document.getElementById('logoUploadInput')?.click();
}

export function handleLogoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const logoImg = document.getElementById('uploadedLogo');
        const placeholder = document.getElementById('logoPlaceholder');

        if (logoImg) {
            logoImg.src = e.target.result;
            logoImg.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';

        localStorage.setItem('customLogo', e.target.result);
        console.log('Logo hochgeladen und gespeichert');
    };
    reader.readAsDataURL(file);
}

// ========================================
// PROFILE UPLOAD
// ========================================

export function triggerProfileUpload(vermittlerId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handleProfileUpload(e, vermittlerId);
    input.click();
}

export function handleProfileUpload(event, vermittlerId) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        localStorage.setItem(`profileImage_${vermittlerId}`, e.target.result);

        if (vermittlerId === 'kunde') {
            const kundenFoto = document.querySelector('.kunden-foto');
            if (kundenFoto) {
                kundenFoto.innerHTML = `<img src="${e.target.result}" alt="Kundenfoto" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
            }
            console.log('Kundenfoto gespeichert');
        } else {
            const photoContainer = document.getElementById('agenturPhoto');
            if (photoContainer) {
                photoContainer.innerHTML = `<img src="${e.target.result}" alt="Profilbild">`;
            }
            console.log('Profilbild gespeichert für:', vermittlerId);
        }
    };
    reader.readAsDataURL(file);
}

// ========================================
// AGENTUR PHOTO UPLOAD
// ========================================

export function triggerAgenturPhotoUpload() {
    document.getElementById('agenturPhotoInput')?.click();
}

export function handleAgenturPhotoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const photoImg = document.getElementById('agenturPhotoImgSmall');
        const placeholder = document.querySelector('.agentur-photo-placeholder-small');

        if (photoImg) {
            photoImg.src = e.target.result;
            photoImg.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';

        localStorage.setItem('agenturPhoto', e.target.result);
        console.log('Agentur-Foto hochgeladen und gespeichert');
    };
    reader.readAsDataURL(file);
}

// ========================================
// LOAD SAVED IMAGES
// ========================================

export async function loadSavedImages() {
    let configImages = { logo: null, profile: null };
    try {
        const response = await fetch('assets/images/images-config.json');
        if (response.ok) {
            configImages = await response.json();
        }
    } catch {
        console.log('Keine images-config.json gefunden, nutze Fallbacks');
    }

    const savedLogo = localStorage.getItem('customLogo');
    const logoImg = document.getElementById('uploadedLogo');
    const logoPlaceholder = document.getElementById('logoPlaceholder');

    if (logoImg && logoPlaceholder) {
        if (savedLogo) {
            logoImg.src = savedLogo;
            logoImg.style.display = 'block';
            logoPlaceholder.style.display = 'none';
        } else if (configImages.logo) {
            logoImg.src = configImages.logo;
            logoImg.style.display = 'block';
            logoPlaceholder.style.display = 'none';
        } else {
            logoImg.src = 'assets/images/default-logo.svg';
            logoImg.style.display = 'block';
            logoPlaceholder.style.display = 'none';
        }
    }

    const savedAgenturPhoto = localStorage.getItem('agenturPhoto');
    const photoImg = document.getElementById('agenturPhotoImg');
    const photoPlaceholder = document.querySelector('.agentur-photo-placeholder');

    if (photoImg) {
        if (savedAgenturPhoto) {
            photoImg.src = savedAgenturPhoto;
            photoImg.style.display = 'block';
            if (photoPlaceholder) photoPlaceholder.style.display = 'none';
        } else if (configImages.profile) {
            photoImg.src = configImages.profile;
            photoImg.style.display = 'block';
            if (photoPlaceholder) photoPlaceholder.style.display = 'none';
        } else {
            photoImg.src = 'assets/images/default-profile.svg';
            photoImg.style.display = 'block';
            if (photoPlaceholder) photoPlaceholder.style.display = 'none';
        }
    }

    const photoImgSmall = document.getElementById('agenturPhotoImgSmall');
    const photoPlaceholderSmall = document.querySelector('.agentur-photo-placeholder-small');

    if (photoImgSmall) {
        if (savedAgenturPhoto) {
            photoImgSmall.src = savedAgenturPhoto;
            photoImgSmall.style.display = 'block';
            if (photoPlaceholderSmall) photoPlaceholderSmall.style.display = 'none';
        } else if (configImages.profile) {
            photoImgSmall.src = configImages.profile;
            photoImgSmall.style.display = 'block';
            if (photoPlaceholderSmall) photoPlaceholderSmall.style.display = 'none';
        }
    }
}

// ========================================
// EXPORT FOR GITHUB
// ========================================

export function exportImagesForGitHub() {
    const images = {};

    const logo = localStorage.getItem('customLogo');
    if (logo) images.logo = logo;

    const photo = localStorage.getItem('agenturPhoto');
    if (photo) images.photo = photo;

    if (Object.keys(images).length === 0) {
        alert('Keine hochgeladenen Bilder gefunden.');
        return;
    }

    const blob = new Blob([JSON.stringify(images, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uploaded-images.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('Bilder exportiert für GitHub');
}

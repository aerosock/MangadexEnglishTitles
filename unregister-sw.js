// Run immediately before anything else

// Unregister all service workers
if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(reg => reg.unregister());
    });
    
    // Clear all caches used by the service worker
    if (window.caches) {
        caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
        });
    }
}

// Completely disable service worker API
try {
    Object.defineProperty(navigator, 'serviceWorker', {
        get: () => undefined,
        configurable: false
    });
} catch(e) {}
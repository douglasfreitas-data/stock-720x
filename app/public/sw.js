self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
    const title = '⚠️ Alerta de Estoque Mínimo';
    const options = {
        body: 'Um ou mais produtos atingiram o estoque mínimo. Toque para ver o relatório de reposição.',
        icon: '/logo.png',   // Certifique-se de que o logo.png / ícone 192x192 exista
        badge: '/logo.png',
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        requireInteraction: true // A notificação fica até o usuário descartá-la
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    // Abre o app na tela de Relatório de Reposição
    const urlToOpen = new URL('/reports/replenishment', self.location.origin).href;

    // eslint-disable-next-line
    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        let matchingClient = null;

        for (let i = 0; i < windowClients.length; i++) {
            const windowClient = windowClients[i];
            if (windowClient.url === urlToOpen) {
                matchingClient = windowClient;
                break;
            }
        }

        if (matchingClient) {
            return matchingClient.focus();
        } else {
            return clients.openWindow(urlToOpen);
        }
    });

    event.waitUntil(promiseChain);
});

async function initMocks() {
  console.log('using msw in nextjs');
  if (typeof window === 'undefined') {
    const { server } = await import('./server');
    server.listen();
  } else {
    const { worker } = await import('./browser');
    worker.start({
      serviceWorker: {
        url: '/aap/soknad/mockServiceWorker.js',
        options: {
          scope: '/',
        },
      },
    });
  }
}

initMocks();

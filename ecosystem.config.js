module.exports = {
    apps: [
        {
            name: 'adventure-engine',
            cwd: '/home/adventurengine/htdocs/adventurengine.com',
            script: 'node_modules/next/dist/bin/next',
            args: 'start -p 3002',
            interpreter: '/usr/bin/node20',
            env: {
                NODE_ENV: 'production',
                PORT: '3002',
            },
            listen_timeout: 10000,
            kill_timeout: 5000,
            // Si /usr/bin/node20 no existe, PM2 fallará al primer intento.
            // El deploy.yml se encargará de encontrar el binario correcto y reescribir este archivo.
        },
    ],
};

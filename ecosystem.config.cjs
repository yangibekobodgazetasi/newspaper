const path = require('path');

const app = (name, dir, script, args) => ({
  name,
  cwd: path.join(__dirname, dir),
  script,
  args,
  autorestart: true,
  time: true,
});

module.exports = {
  apps: [
    app('nb-backend', 'backend', 'dist/src/server.js'),
    app('nb-front', 'frontend', 'npm', 'run start'), // port 3000
    app('nb-admin', 'admin', 'npm', 'run start'),    // port 3001
  ],
};

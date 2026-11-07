const net = require('net');

let server = null;

function startKeyReceiver(onReceive) {
  if (server) return;
  server = net.createServer((socket) => {
    let data = '';
    socket.on('data', chunk => {
      data += chunk;
      try {
        const keyData = JSON.parse(data);
        onReceive(keyData);
        socket.end('OK');
      } catch(e) {  }
    });
  });
  server.listen(3000, () => console.log('Key receiver listening on port 3000'));
}

function sendPublicKey(host, port, keyData) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.connect(port, host, () => {
      client.write(JSON.stringify(keyData));
    });
    client.on('data', (data) => {
      client.destroy();
      resolve(data.toString());
    });
    client.on('error', reject);
  });
}

module.exports = { startKeyReceiver, sendPublicKey };
// Test de conexión cruda de socket
const net = require('net');

const socket = new net.Socket();

socket.setTimeout(5000);

console.log('🔌 Intentando conectar al socket TCP localhost:5432...\n');

socket.connect(5432, 'localhost', () => {
  console.log('✅ Socket TCP conectado exitosamente!');
  console.log('   Local:', socket.localAddress + ':' + socket.localPort);
  console.log('   Remote:', socket.remoteAddress + ':' + socket.remotePort);
  socket.destroy();
});

socket.on('data', (data) => {
  console.log('📦 Datos recibidos:', data.toString('hex').substring(0, 100));
});

socket.on('error', (err) => {
  console.error('❌ Error de socket:', err.message);
  console.error('   Código:', err.code);
  socket.destroy();
  process.exit(1);
});

socket.on('timeout', () => {
  console.error('⏱️  Timeout de conexión');
  socket.destroy();
  process.exit(1);
});

socket.on('close', () => {
  console.log('\n🔌 Socket cerrado');
  process.exit(0);
});

// Test de conexión directa con pg (sin Prisma)
const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',  // Forzar IPv4 explícito en lugar de 'localhost'
  port: 5433,
  database: 'nasa_db',
  user: 'postgres',
  password: 'postgres',
});

async function testConnection() {
  try {
    console.log('🔌 Intentando conectar a PostgreSQL...');
    console.log('   Host: ' + client.host + ':' + client.port);
    console.log('   Database: ' + client.database);
    console.log('   User: ' + client.user);
    console.log('');
    
    await client.connect();
    console.log('✅ Conexión exitosa!\n');
    
    const result = await client.query('SELECT current_user, current_database(), version()');
    console.log('📊 Información del servidor:');
    console.log('   Usuario:', result.rows[0].current_user);
    console.log('   Base de datos:', result.rows[0].current_database);
    console.log('   Versión:', result.rows[0].version.split(',')[0]);
    console.log('');
    
    const countResult = await client.query('SELECT COUNT(*) FROM tempo_measurements');
    console.log('📈 Registros en tempo_measurements:', countResult.rows[0].count);
    
    await client.end();
    console.log('\n✅ Test completado exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error de conexión:');
    console.error('   Código:', error.code);
    console.error('   Mensaje:', error.message);
    console.error('');
    console.error('Stack completo:', error);
    await client.end();
    process.exit(1);
  }
}

testConnection();

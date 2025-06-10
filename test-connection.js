#!/usr/bin/env node

const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Probando conexión a MySQL...\n');
  
  const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  };
  
  console.log('📋 Configuración:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Puerto: ${config.port}`);
  console.log(`   Usuario: ${config.user}`);
  console.log(`   Base de datos: ${config.database}`);
  console.log(`   Contraseña: ${config.password ? '✅ Configurada' : '❌ No configurada'}\n`);
  
  try {
    const connection = await mysql.createConnection(config);
    
    // Probar consulta simple
    const [rows] = await connection.execute('SELECT VERSION() as version, DATABASE() as db, NOW() as time');
    
    console.log('✅ ¡Conexión exitosa!');
    console.log('📊 Información del servidor:');
    console.log(`   Versión MySQL: ${rows[0].version}`);
    console.log(`   Base de datos actual: ${rows[0].db}`);
    console.log(`   Hora del servidor: ${rows[0].time}`);
    
    // Probar listar tablas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`\n📋 Tablas encontradas: ${tables.length}`);
    if (tables.length > 0) {
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${Object.values(table)[0]}`);
      });
    } else {
      console.log('   (No hay tablas en la base de datos)');
    }
    
    await connection.end();
    
    console.log('\n🎉 ¡Todo listo! Tu MCP Server debería funcionar correctamente.');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Configura Claude Desktop con la configuración mostrada arriba');
    console.log('2. Reinicia Claude Desktop');
    console.log('3. Busca el ícono 🔌 para confirmar la conexión');
    
  } catch (error) {
    console.error('❌ Error de conexión:');
    console.error(`   Código: ${error.code}`);
    console.error(`   Mensaje: ${error.message}`);
    
    console.log('\n💡 Posibles soluciones:');
    if (error.code === 'ECONNREFUSED') {
      console.log('• Verifica que MySQL esté ejecutándose');
      console.log('• Verifica el host y puerto');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('• Verifica el usuario y contraseña');
      console.log('• Verifica que el usuario tenga permisos');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('• Verifica que la base de datos exista');
      console.log('• Crea la base de datos si es necesario');
    }
    
    process.exit(1);
  }
}

testConnection();
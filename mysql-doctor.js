#!/usr/bin/env node

const mysql = require('mysql2/promise');
const readline = require('readline');
const fs = require('fs');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function mysqlDoctor() {
  console.log('🩺 MySQL Doctor - Diagnóstico y solución de problemas\n');
  
  // Leer configuración actual
  const currentConfig = {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || '',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || '',
  };
  
  console.log('📋 Configuración actual:');
  console.log(`   Host: ${currentConfig.host}`);
  console.log(`   Puerto: ${currentConfig.port}`);
  console.log(`   Usuario: ${currentConfig.user} ${currentConfig.user === 'rot' ? '⚠️ (¿Debería ser "root"?)' : ''}`);
  console.log(`   Base de datos: ${currentConfig.database}`);
  console.log(`   Contraseña: ${currentConfig.password ? '✅ Configurada' : '❌ No configurada'}\n`);
  
  // Detectar problemas comunes
  const problems = [];
  
  if (currentConfig.user === 'rot') {
    problems.push('❌ Usuario "rot" probablemente debería ser "root"');
  }
  
  if (!currentConfig.user) {
    problems.push('❌ Usuario no configurado');
  }
  
  if (!currentConfig.password) {
    problems.push('❌ Contraseña no configurada');
  }
  
  if (!currentConfig.database) {
    problems.push('❌ Base de datos no configurada');
  }
  
  if (problems.length > 0) {
    console.log('🔍 Problemas detectados:');
    problems.forEach(problem => console.log(`   ${problem}`));
    console.log('');
    
    const fix = await askQuestion('¿Quieres que te ayude a solucionarlos? (y/n): ');
    if (fix.toLowerCase() === 'y' || fix.toLowerCase() === 'yes') {
      await fixConfiguration();
      return;
    }
  }
  
  // Intentar conexión
  console.log('🔄 Intentando conexión...\n');
  
  try {
    const connection = await mysql.createConnection(currentConfig);
    
    // Probar consultas básicas
    const [version] = await connection.execute('SELECT VERSION() as version');
    const [databases] = await connection.execute('SHOW DATABASES');
    
    console.log('✅ ¡Conexión exitosa!');
    console.log(`📊 MySQL versión: ${version[0].version}`);
    console.log(`📋 Bases de datos disponibles: ${databases.length}`);
    
    // Verificar si la base de datos objetivo existe
    const dbExists = databases.some(db => Object.values(db)[0] === currentConfig.database);
    if (!dbExists) {
      console.log(`⚠️ La base de datos "${currentConfig.database}" no existe`);
      const create = await askQuestion('¿Quieres crearla? (y/n): ');
      if (create.toLowerCase() === 'y') {
        await connection.execute(`CREATE DATABASE \`${currentConfig.database}\``);
        console.log(`✅ Base de datos "${currentConfig.database}" creada`);
      }
    } else {
      // Probar usar la base de datos
      await connection.execute(`USE \`${currentConfig.database}\``);
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`📋 Tablas en ${currentConfig.database}: ${tables.length}`);
    }
    
    await connection.end();
    console.log('\n🎉 ¡Todo está funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error de conexión:');
    console.error(`   Código: ${error.code}`);
    console.error(`   Mensaje: ${error.message}\n`);
    
    await suggestSolutions(error);
  }
  
  rl.close();
}

async function fixConfiguration() {
  console.log('\n🔧 Configuración interactiva:\n');
  
  const host = await askQuestion('Host de MySQL (localhost): ') || 'localhost';
  const port = await askQuestion('Puerto de MySQL (3306): ') || '3306';
  
  let user = await askQuestion('Usuario de MySQL (root): ') || 'root';
  if (user === 'rot') {
    console.log('⚠️ Detecté "rot", ¿quisiste decir "root"?');
    const correct = await askQuestion('¿Cambiar a "root"? (y/n): ');
    if (correct.toLowerCase() === 'y') {
      user = 'root';
    }
  }
  
  const password = await askQuestion('Contraseña de MySQL: ');
  const database = await askQuestion('Nombre de la base de datos (test_mcp): ') || 'test_mcp';
  
  // Crear archivo .env actualizado
  const envContent = `MYSQL_HOST=${host}
MYSQL_PORT=${port}
MYSQL_USER=${user}
MYSQL_PASSWORD=${password}
MYSQL_DATABASE=${database}
`;
  
  fs.writeFileSync('.env', envContent);
  console.log('\n✅ Archivo .env actualizado');
  console.log('🔄 Probando nueva configuración...\n');
  
  // Probar nueva configuración
  try {
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database
    });
    
    await connection.execute('SELECT 1');
    await connection.end();
    
    console.log('✅ ¡Nueva configuración funciona correctamente!');
  } catch (error) {
    console.error('❌ La nueva configuración también falló:');
    console.error(`   ${error.message}`);
  }
}

async function suggestSolutions(error) {
  switch (error.code) {
    case 'ER_ACCESS_DENIED_ERROR':
      console.log('💡 Soluciones para error de acceso:');
      console.log('   1. Verifica que el usuario sea "root" (no "rot")');
      console.log('   2. Verifica la contraseña');
      console.log('   3. Prueba conectarte manualmente: mysql -u root -p');
      console.log('   4. Si olvidaste la contraseña de root, necesitas resetearla');
      
      const resetPassword = await askQuestion('\n¿Quieres instrucciones para resetear la contraseña de root? (y/n): ');
      if (resetPassword.toLowerCase() === 'y') {
        showPasswordResetInstructions();
      }
      break;
      
    case 'ECONNREFUSED':
      console.log('💡 Soluciones para conexión rechazada:');
      console.log('   1. Verifica que MySQL esté ejecutándose: net start mysql');
      console.log('   2. Verifica el puerto (por defecto 3306)');
      console.log('   3. Verifica que MySQL esté instalado');
      break;
      
    case 'ER_BAD_DB_ERROR':
      console.log('💡 Soluciones para base de datos no encontrada:');
      console.log('   1. Crea la base de datos: CREATE DATABASE test_mcp;');
      console.log('   2. Verifica el nombre de la base de datos');
      break;
      
    default:
      console.log('💡 Soluciones generales:');
      console.log('   1. Verifica que MySQL esté instalado y ejecutándose');
      console.log('   2. Verifica todas las credenciales');
      console.log('   3. Revisa los logs de MySQL para más detalles');
  }
}

function showPasswordResetInstructions() {
  console.log('\n🔑 Instrucciones para resetear contraseña de root en Windows:');
  console.log('');
  console.log('1. Abrir CMD como Administrador');
  console.log('2. Detener MySQL: net stop mysql80');
  console.log('3. Crear archivo reset.sql con:');
  console.log('   ALTER USER \'root\'@\'localhost\' IDENTIFIED BY \'nueva_password\';');
  console.log('4. Ejecutar: mysqld --init-file=C:\\ruta\\al\\reset.sql');
  console.log('5. Reiniciar MySQL: net start mysql80');
  console.log('');
  console.log('O usa MySQL Workbench para cambiar la contraseña gráficamente.');
}

// Ejecutar el doctor
mysqlDoctor().catch(error => {
  console.error('❌ Error inesperado:', error.message);
  process.exit(1);
});
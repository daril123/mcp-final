#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');

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

async function setup() {
  console.log('\n🚀 Configuración del MySQL MCP Server\n');
  
  // Solicitar información de la base de datos
  const host = await askQuestion('Host de MySQL (localhost): ') || 'localhost';
  const port = await askQuestion('Puerto de MySQL (3306): ') || '3306';
  const user = await askQuestion('Usuario de MySQL: ');
  const password = await askQuestion('Contraseña de MySQL: ');
  const database = await askQuestion('Nombre de la base de datos: ');
  
  if (!user || !password || !database) {
    console.error('❌ Usuario, contraseña y base de datos son requeridos');
    process.exit(1);
  }
  
  // Crear archivo .env
  const envContent = `# MySQL Database Configuration
MYSQL_HOST=${host}
MYSQL_PORT=${port}
MYSQL_USER=${user}
MYSQL_PASSWORD=${password}
MYSQL_DATABASE=${database}
`;
  
  fs.writeFileSync('.env', envContent);
  console.log('✅ Archivo .env creado');
  
  // Detectar sistema operativo y generar configuración de Claude Desktop
  const isWindows = os.platform() === 'win32';
  const isMac = os.platform() === 'darwin';
  
  let configPath;
  if (isMac) {
    configPath = path.join(os.homedir(), 'Library/Application Support/Claude/claude_desktop_config.json');
  } else if (isWindows) {
    configPath = path.join(os.homedir(), 'AppData/Roaming/Claude/claude_desktop_config.json');
  } else {
    configPath = path.join(os.homedir(), '.config/claude/claude_desktop_config.json');
  }
  
  const claudeConfig = {
    mcpServers: {
      mysql: {
        command: "npx",
        args: ["daril123-mysql-mcp-server"],
        env: {
          MYSQL_HOST: host,
          MYSQL_PORT: port,
          MYSQL_USER: user,
          MYSQL_PASSWORD: password,
          MYSQL_DATABASE: database
        }
      }
    }
  };
  
  console.log('\n📋 Configuración para Claude Desktop:');
  console.log('📂 Ruta del archivo de configuración:');
  console.log(`   ${configPath}`);
  console.log('\n📄 Contenido a agregar/modificar:');
  console.log(JSON.stringify(claudeConfig, null, 2));
  
  const updateClaude = await askQuestion('\n¿Quieres que actualice automáticamente la configuración de Claude Desktop? (y/n): ');
  
  if (updateClaude.toLowerCase() === 'y' || updateClaude.toLowerCase() === 'yes') {
    try {
      // Crear directorio si no existe
      const configDir = path.dirname(configPath);
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      let existingConfig = {};
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf8');
        try {
          existingConfig = JSON.parse(content);
        } catch (e) {
          console.log('⚠️ Archivo de configuración existente no es válido, creando uno nuevo');
        }
      }
      
      // Combinar configuraciones
      if (!existingConfig.mcpServers) {
        existingConfig.mcpServers = {};
      }
      existingConfig.mcpServers.mysql = claudeConfig.mcpServers.mysql;
      
      // Escribir configuración
      fs.writeFileSync(configPath, JSON.stringify(existingConfig, null, 2));
      console.log('✅ Configuración de Claude Desktop actualizada');
    } catch (error) {
      console.error('❌ Error al actualizar la configuración de Claude Desktop:', error.message);
      console.log('💡 Por favor, actualiza manualmente el archivo de configuración');
    }
  }
  
  console.log('\n🎉 ¡Configuración completada!');
  console.log('\n📝 Próximos pasos:');
  console.log('1. Reinicia Claude Desktop si está ejecutándose');
  console.log('2. Abre Claude Desktop');
  console.log('3. Busca el ícono de 🔌 en la interfaz para confirmar que el MCP está conectado');
  console.log('4. Prueba con: "Muéstrame todas las tablas en mi base de datos"');
  
  console.log('\n💡 Comandos útiles:');
  console.log('- npm run build     # Compilar el proyecto');
  console.log('- npm run start     # Ejecutar directamente');
  console.log('- npm test          # Ejecutar pruebas (cuando estén disponibles)');
  
  rl.close();
}

setup().catch(error => {
  console.error('❌ Error durante la configuración:', error);
  process.exit(1);
});
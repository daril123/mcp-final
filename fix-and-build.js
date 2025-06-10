#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

function fixAndBuild() {
  console.log('🔧 Solucionando problemas de compilación...\n');
  
  // 1. Verificar estructura del proyecto
  console.log('📁 Verificando estructura del proyecto:');
  const requiredFiles = ['package.json', 'src/index.ts'];
  
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) {
      console.error(`❌ Archivo requerido no encontrado: ${file}`);
      process.exit(1);
    }
  });
  
  // 2. Verificar/crear tsconfig.json
  console.log('\n📝 Verificando tsconfig.json...');
  
  if (!fs.existsSync('tsconfig.json')) {
    console.log('⚠️ tsconfig.json no encontrado, creándolo...');
    
    const tsconfig = {
      "compilerOptions": {
        "target": "ES2020",
        "module": "CommonJS",
        "moduleResolution": "node",
        "lib": ["ES2020"],
        "outDir": "./dist",
        "rootDir": "./src",
        "strict": true,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true,
        "resolveJsonModule": true
      },
      "include": ["src/**/*"],
      "exclude": ["node_modules", "dist"]
    };
    
    fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));
    console.log('✅ tsconfig.json creado');
  } else {
    console.log('✅ tsconfig.json existe');
    
    // Verificar que el tsconfig.json sea válido
    try {
      const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      if (!tsconfig.compilerOptions || !tsconfig.compilerOptions.outDir) {
        throw new Error('Configuración incompleta');
      }
      console.log('✅ tsconfig.json válido');
    } catch (error) {
      console.log('⚠️ tsconfig.json corrupto, recreándolo...');
      
      const tsconfig = {
        "compilerOptions": {
          "target": "ES2020",
          "module": "CommonJS",
          "moduleResolution": "node",
          "lib": ["ES2020"],
          "outDir": "./dist",
          "rootDir": "./src",
          "strict": true,
          "esModuleInterop": true,
          "allowSyntheticDefaultImports": true,
          "skipLibCheck": true,
          "forceConsistentCasingInFileNames": true,
          "declaration": true,
          "sourceMap": true,
          "resolveJsonModule": true
        },
        "include": ["src/**/*"],
        "exclude": ["node_modules", "dist"]
      };
      
      fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));
      console.log('✅ tsconfig.json recreado');
    }
  }
  
  // 3. Verificar package.json scripts
  console.log('\n📦 Verificando package.json scripts...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (!packageJson.scripts || !packageJson.scripts.build) {
      console.log('⚠️ Script build no encontrado, agregándolo...');
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      packageJson.scripts.build = 'tsc';
      packageJson.scripts['build:watch'] = 'tsc --watch';
      packageJson.scripts['build:clean'] = 'rm -rf dist && tsc';
      
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
      console.log('✅ Scripts agregados al package.json');
    } else {
      console.log('✅ Script build existe');
    }
  } catch (error) {
    console.error('❌ Error leyendo package.json:', error.message);
    process.exit(1);
  }
  
  // 4. Limpiar dist anterior
  if (fs.existsSync('dist')) {
    console.log('\n🧹 Limpiando compilación anterior...');
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('✅ Directorio dist limpiado');
  }
  
  // 5. Verificar dependencias
  console.log('\n📦 Verificando dependencias...');
  if (!fs.existsSync('node_modules')) {
    console.log('⚠️ node_modules no encontrado, instalando dependencias...');
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Dependencias instaladas');
    } catch (error) {
      console.error('❌ Error instalando dependencias:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Dependencias instaladas');
  }
  
  // 6. Compilar con diferentes métodos
  console.log('\n🔨 Compilando proyecto...');
  
  const compileMethods = [
    { name: 'npm run build', command: 'npm run build' },
    { name: 'npx tsc', command: 'npx tsc' },
    { name: 'tsc directo', command: 'tsc' }
  ];
  
  let compiled = false;
  
  for (const method of compileMethods) {
    if (compiled) break;
    
    console.log(`\n🔄 Intentando: ${method.name}`);
    try {
      execSync(method.command, { 
        stdio: ['pipe', 'pipe', 'pipe'],
        encoding: 'utf8'
      });
      
      // Verificar que se creó dist/index.js
      if (fs.existsSync('dist/index.js')) {
        console.log(`✅ Compilación exitosa con: ${method.name}`);
        compiled = true;
      }
    } catch (error) {
      console.log(`❌ Falló: ${method.name}`);
      console.log(`   Error: ${error.message.split('\n')[0]}`);
    }
  }
  
  if (!compiled) {
    console.log('\n❌ Todos los métodos de compilación fallaron');
    console.log('\n💡 Intentando compilación manual paso a paso...');
    
    try {
      // Intentar compilación manual
      execSync('npx tsc --project .', { stdio: 'inherit' });
      
      if (fs.existsSync('dist/index.js')) {
        console.log('✅ Compilación manual exitosa');
        compiled = true;
      }
    } catch (error) {
      console.error('❌ Compilación manual falló:', error.message);
    }
  }
  
  // 7. Verificar resultado
  console.log('\n📋 Resultado de la compilación:');
  
  if (fs.existsSync('dist')) {
    const distFiles = fs.readdirSync('dist');
    console.log(`✅ Directorio dist creado con ${distFiles.length} archivos:`);
    distFiles.forEach(file => {
      const filePath = path.join('dist', file);
      const stats = fs.statSync(filePath);
      console.log(`   📄 ${file} (${Math.round(stats.size / 1024)}KB)`);
    });
    
    if (fs.existsSync('dist/index.js')) {
      console.log('\n🎉 ¡Compilación exitosa!');
      console.log('\n🚀 Ahora puedes ejecutar:');
      console.log('   node dist/index.js');
      
      // Verificar configuración MySQL
      console.log('\n🔐 Verificando configuración MySQL...');
      require('dotenv').config();
      
      const mysqlVars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'];
      const missingVars = mysqlVars.filter(v => !process.env[v]);
      
      if (missingVars.length === 0) {
        console.log('✅ Variables MySQL configuradas');
        console.log('\n💡 ¿Quieres ejecutar el servidor ahora? (Ctrl+C para cancelar)');
        
        setTimeout(() => {
          console.log('\n🚀 Iniciando servidor MCP...');
          console.log('━'.repeat(50));
          
          try {
            execSync('node dist/index.js', { stdio: 'inherit' });
          } catch (error) {
            console.log('\n✅ Servidor detenido');
          }
        }, 3000);
        
      } else {
        console.log(`⚠️ Variables MySQL faltantes: ${missingVars.join(', ')}`);
        console.log('💡 Configura tu archivo .env antes de ejecutar');
      }
      
    } else {
      console.error('❌ dist/index.js no fue creado');
      process.exit(1);
    }
  } else {
    console.error('❌ Directorio dist no fue creado');
    process.exit(1);
  }
}

// Manejar Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n🛑 Proceso cancelado por el usuario');
  process.exit(0);
});

console.log('🔧 MySQL MCP Server - Solucionador de problemas de compilación\n');
fixAndBuild();
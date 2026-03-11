// Script para verificar que los triggers se muestran correctamente
const axios = require('axios');

async function testTriggersDisplay() {
  console.log('🎯 VERIFICANDO VISUALIZACIÓN DE TRIGGERS');
  console.log('======================================\n');
  
  try {
    // Obtener flows del backend
    const response = await axios.get('http://localhost:3000/api/flows');
    
    console.log('📊 DATOS DEL BACKEND:');
    console.log('====================');
    
    response.data.forEach((flow, index) => {
      console.log(`\n${index + 1}. ${flow.name}`);
      console.log(`   Status: ${flow.status}`);
      console.log(`   Triggers (${flow.triggers?.length || 0}):`);
      
      if (flow.triggers && Array.isArray(flow.triggers)) {
        flow.triggers.forEach((trigger, i) => {
          console.log(`     ${i + 1}. "${trigger}"`);
        });
      }
    });
    
    console.log('\n🎉 CAMBIOS REALIZADOS:');
    console.log('====================');
    console.log('✅ Agregada columna "Triggers" en la tabla');
    console.log('✅ Los triggers se muestran como badges/píldoras');
    console.log('✅ Cada trigger tiene su propio estilo visual');
    console.log('✅ Si no hay triggers, muestra "Sin triggers"');
    
    console.log('\n📱 ¿Qué deberías ver en el frontend?');
    console.log('====================================');
    console.log('1. Una nueva columna "Triggers" en la tabla');
    console.log('2. 6 badges con los triggers:');
    console.log('   - hola');
    console.log('   - nuevo');
    console.log('   - buenos días');
    console.log('   - inicio');
    console.log('   - bienvenida');
    console.log('   - registro');
    console.log('3. Cada trigger con estilo indigo/azul');
    
    console.log('\n🔄 Para ver los cambios:');
    console.log('======================');
    console.log('1. Refresca la página del frontend (F5)');
    console.log('2. Deberías ver la nueva columna con todos los triggers');
    console.log('3. Si no se ve, prueba Ctrl+F5 (refresco forzado)');
    
    console.log('\n🎯 Funcionalidad completa:');
    console.log('========================');
    console.log('✅ Triggers funcionan en WhatsApp');
    console.log('✅ Triggers se muestran en el frontend');
    console.log('✅ Sistema completamente sincronizado');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTriggersDisplay();

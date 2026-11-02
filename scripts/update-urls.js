/**
 * SCRIPT: Actualizar URLs de Google Maps en las 5 ópticas
 * Ejecutar con: node scripts/update-urls.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// 1. Cargar Service Account
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
let serviceAccount;
try {
  const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(fileContent);
  console.log('✅ Service Account cargado');
} catch (error) {
  console.error('❌ Error al leer serviceAccountKey.json:', error.message);
  process.exit(1);
}

// 2. Inicializar Firebase Admin
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// 3. URLs correctas de Google Maps (las que me pasaste originalmente)
const urlsCorrectas = {
  "Ópticas Álvarez": "https://www.google.com/maps/place/Ópticas+Álvarez/@20.6412961,-105.2354235,17z/data=!3m1!4b1!4m6!3m5!1s0x8421457734ff2815:0xdae94d51bf6ebac0!8m2!3d20.6412911!4d-105.2328486!16s%2Fg%2F11cncpmf6c?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D",
  "ÓPTICA CUAUTITLAN IZCALLI | Zeiss Vision Expert": "https://www.google.com/maps/place/ÓPTICA+CUAUTITLAN+IZCALLI+%7C+Zeiss+Vision+Expert/@19.6469616,-99.2079886,17z/data=!4m8!3m7!1s0x85d21fc797c13665:0xbb34e8ff18c316f9!8m2!3d19.6469566!4d-99.2054137!9m1!1b1!16s%2Fg%2F11fp9q6k44?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D",
  "ÓPTICA COACALCO | Zeiss Vision Expert": "https://www.google.com/maps/place/ÓPTICA+COACALCO+%7C+Zeiss+Vision+Expert/@19.6423025,-99.1004749,17z/data=!4m8!3m7!1s0x85d1f3b80506b147:0xd145a0d9c6b73906!8m2!3d19.6422975!4d-99.0979!9m1!1b1!16s%2Fg%2F11fdxs05ww?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D",
  "Visualia Roma Norte": "https://www.google.com/maps/place/Visualia+Roma+Norte/@19.4147364,-99.1658812,17z/data=!3m1!4b1!4m6!3m5!1s0x85d1ffa5b36a6099:0x6864377a61698d9e!8m2!3d19.4147364!4d-99.1633063!16s%2Fg%2F11fqtmjn3f?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D",
  "Óptica Okulux suc Galerias Constituyentes": "https://www.google.com/maps/place/Óptica+Okulux+suc+Galerías+Constituyentes/@20.5847931,-100.3849207,17z/data=!3m1!4b1!4m6!3m5!1s0x85d344cd9ccc8bbd:0xee0031d9df852f8c!8m2!3d20.5847931!4d-100.3823458!16s%2Fg%2F1ptvvbydn?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D"
};

// 4. Función principal
async function actualizarURLs() {
  console.log('\n🔄 ACTUALIZANDO URLs DE GOOGLE MAPS...\n');

  try {
    const snapshot = await db.collection('opticas').get();
    let actualizadas = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const nombre = data.nombreComercial;

      // Buscar si tenemos URL correcta para esta óptica
      const urlCorrecta = urlsCorrectas[nombre];

      if (urlCorrecta) {
        // Actualizar el documento
        await db.collection('opticas').doc(doc.id).update({
          urlGoogleMaps: urlCorrecta,
          resenasGoogle: {
            ...data.resenasGoogle,
            urlPerfil: urlCorrecta
          }
        });

        console.log(`✅ ${nombre}`);
        console.log(`   URL actualizada correctamente\n`);
        actualizadas++;
      } else {
        console.log(`️  ${nombre} - No se encontró URL en la lista`);
      }
    }

    console.log(`\n✅ ¡${actualizadas} ópticas actualizadas exitosamente!\n`);
    console.log(' Prueba ahora:');
    console.log('   - Ve a cualquier ficha de óptica');
    console.log('   - Haz clic en "Google Maps" → Debería abrir la ficha real');
    console.log('   - Haz clic en "Ver todas en Google" → Debería abrir las reseñas\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ ERROR al actualizar URLs:', error);
    process.exit(1);
  }
}

// Ejecutar
actualizarURLs();
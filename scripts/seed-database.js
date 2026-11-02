/**
 * SCRIPT DE SEEDING - Base de Datos Completa
 * Ejecutar con: node scripts/seed-database.js
 */

// Importación modular moderna de Firebase Admin
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// 1. Leer el archivo JSON de la Service Account
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
let serviceAccount;

try {
  const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
  serviceAccount = JSON.parse(fileContent);
  console.log('✅ Service Account cargado correctamente');
  console.log('   Project ID:', serviceAccount.project_id);
} catch (error) {
  console.error('❌ Error al leer serviceAccountKey.json:', error.message);
  console.error('   Asegúrate de que el archivo esté en la raíz del proyecto');
  process.exit(1);
}

// 2. Inicializar Firebase Admin
try {
  initializeApp({
    credential: cert(serviceAccount)
  });
  console.log('✅ Firebase Admin inicializado correctamente\n');
} catch (error) {
  console.error('❌ Error al inicializar Firebase Admin:', error.message);
  process.exit(1);
}

const db = getFirestore();

// 3. Datos completos a insertar
const data = {
  especialidades: {
    items: [
      "Examen de la vista gratis", "Entrega en 1 hora", "Graduaciones altas",
      "Lentes de contacto", "Lentes de sol", "Armazones de marca",
      "Lentes para niños", "Lentes deportivos", "Filtro de luz azul",
      "Lentes progresivos", "Atención a domicilio", "Reparación de armazones"
    ]
  },
  seguros: {
    items: ["AUNA", "GNP Seguros", "MetLife", "AXA", "Seguros Monterrey", "Zurich", "Allianz"]
  },
  estados: {
    items: [
      "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
      "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
      "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
      "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
      "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
      "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
    ]
  },
  planes: {
    items: [
      {
        id: "free", nombre: "Gratis", precioMensual: 0, precioAnual: 0,
        descripcion: "Ficha básica para comenzar", icono: "MapPin", ahorroAnual: "",
        caracteristicas: ["3 fotos", "Información básica", "Horarios de atención"]
      },
      {
        id: "premium", nombre: "Premium", precioMensual: 199, precioAnual: 1990,
        descripcion: "Para ópticas que quieren crecer", icono: "Star", ahorroAnual: "2 meses gratis",
        caracteristicas: ["8 fotos", "Badge verificado", "Reseñas Google", "Botones de navegación", "Estadísticas", "Reportes mensuales"]
      },
      {
        id: "premium_plus", nombre: "Premium+", precioMensual: 599, precioAnual: 5391,
        descripcion: "Máxima visibilidad y herramientas B2B", icono: "Crown", ahorroAnual: "3 meses gratis",
        caracteristicas: ["12 fotos", "Video promocional", "Reseñas nativas", "Producto destacado", "SEO optimizado", "Gestión de contenido", "Acceso B2B", "Soporte prioritario"]
      }
    ]
  },
  faq: {
    items: [
      {
        categoria: "General",
        preguntas: [
          { pregunta: "¿Qué es La Óptica Cerca de mí?", respuesta: "Es el primer directorio inteligente de ópticas en México que conecta pacientes con ópticas verificadas." },
          { pregunta: "¿Es gratis registrarse?", respuesta: "Sí, el plan Gratis te permite tener una ficha básica sin costo." },
          { pregunta: "¿Cómo cambio de plan?", respuesta: "Desde tu dashboard, en la sección Plan y facturación." }
        ]
      },
      {
        categoria: "Planes y precios",
        preguntas: [
          { pregunta: "¿Cuáles son los planes disponibles?", respuesta: "Gratis, Premium ($199/mes) y Premium+ ($599/mes)." },
          { pregunta: "¿Puedo cancelar en cualquier momento?", respuesta: "Sí, tu plan se mantendrá activo hasta el final del período pagado." }
        ]
      },
      {
        categoria: "Ficha de óptica",
        preguntas: [
          { pregunta: "¿Qué información aparece en mi ficha pública?", respuesta: "Nombre, dirección, horarios, especialidades, fotos y más." },
          { pregunta: "¿Cómo subo fotos de mi óptica?", respuesta: "Desde el dashboard, en la sección Galería." }
        ]
      },
      {
        categoria: "Pagos y facturación",
        preguntas: [
          { pregunta: "¿Qué métodos de pago aceptan?", respuesta: "Tarjeta de crédito/débito y transferencia bancaria." },
          { pregunta: "¿Recibo factura?", respuesta: "Sí, automáticamente al confirmar tu pago." }
        ]
      },
      {
        categoria: "Soporte técnico",
        preguntas: [
          { pregunta: "¿Cómo contacto a soporte?", respuesta: "Por WhatsApp al 55 1234 5678 o email a soporte@laopticacercademi.com" },
          { pregunta: "¿Cuál es el horario de atención?", respuesta: "Lunes a Viernes de 9:00 a 18:00 hrs." }
        ]
      }
    ]
  },
  recursos: {
    items: [
      { titulo: "Guía de inicio rápido", descripcion: "Aprende a configurar tu ficha en 5 minutos", tipo: "articulo", url: "/ayuda/guia-inicio", icono: "FileText" },
      { titulo: "Video: Cómo subir fotos", descripcion: "Tutorial paso a paso para tu galería", tipo: "video", url: "https://youtube.com/watch?v=ejemplo", icono: "Video" },
      { titulo: "Tips para atraer más clientes", descripcion: "Estrategias probadas para ópticas independientes", tipo: "articulo", url: "/ayuda/tips-clientes", icono: "Lightbulb" }
    ]
  },
  soporte: {
    email: "soporte@laopticacercademi.com",
    whatsapp: "5512345678",
    telefono: "55 1234 5678",
    horarioAtencion: "Lunes a Viernes de 9:00 a 18:00 hrs"
  },
  home: {
    hero: {
      titulo: "Encuentra la óptica perfecta cerca de ti",
      subtitulo: "El primer directorio inteligente de ópticas en México. Compara, elige y agenda con confianza.",
      textoBoton: "Ver directorio",
      urlBoton: "/opticas"
    },
    badges: [
      { titulo: "Examen de la vista gratis", descripcion: "En ópticas participantes", icono: "Eye" },
      { titulo: "Entrega en 1 hora", descripcion: "Servicio express disponible", icono: "Clock" },
      { titulo: "Ópticas verificadas", descripcion: "Información confiable y actualizada", icono: "ShieldCheck" },
      { titulo: "Reseñas reales", descripcion: "Opiniones de pacientes reales", icono: "Star" }
    ],
    destacadas: []
  }
};

// 4. Función principal de ejecución
async function seedDatabase() {
  console.log('\n🌱 INICIANDO SEEDING DE BASE DE DATOS...\n');

  try {
    for (const [collectionName, collectionData] of Object.entries(data)) {
      console.log(`📁 Creando colección: ${collectionName}...`);
      
      const docRef = db.collection('config').doc(collectionName);
      await docRef.set(collectionData);
      
      const itemCount = collectionData.items ? collectionData.items.length : 'N/A';
      console.log(`   ✅ ${collectionName} creado (${itemCount} elementos)\n`);
    }

    console.log('✅ ¡BASE DE DATOS SEMBRADA EXITOSAMENTE!\n');
    console.log('📊 Resumen:');
    console.log('   - Colecciones creadas: 8');
    console.log('   - Especialidades: 12');
    console.log('   - Seguros: 7');
    console.log('   - Estados: 32');
    console.log('   - Planes: 3');
    console.log('   - FAQ: 5 categorías, 11 preguntas');
    console.log('   - Recursos: 3');
    console.log('   - Soporte: 4 campos');
    console.log('   - Home: Hero, 4 badges, 0 destacadas');
    console.log('\n🎉 ¡Listo para usar en tu Panel de Admin!\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ ERROR al sembrar la base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar
seedDatabase();
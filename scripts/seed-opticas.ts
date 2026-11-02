/**
 * SCRIPT DE SEEDING: 5 ÓPTICAS 100% REALES CON RESEÑAS DE GOOGLE
 * Ejecutar con: npx tsx scripts/seed-opticas.ts
 * 
 * Datos extraídos manualmente de Google Maps - Octubre 2026
 */

// IMPORTACIÓN MODULAR (la que funciona con firebase-admin actual)
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
  console.log('   Project ID:', serviceAccount.project_id);
} catch (error) {
  console.error('❌ Error al leer serviceAccountKey.json:', error.message);
  process.exit(1);
}

// 2. Inicializar Firebase Admin con sintaxis moderna
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

// 3. DATOS 100% REALES DE LAS 5 ÓPTICAS
const opticasData = [
  {
    nombreComercial: "Ópticas Álvarez",
    email: "contacto@opticasalvarez.com",
    telefono: "322 224 5599",
    whatsapp: "3222245599",
    direccion: "Plaza Caracol, Local 6 y 7A, Av Los Tules 178, Versalles",
    ciudad: "Puerto Vallarta",
    estado: "Jalisco",
    cp: "48310",
    latitud: 20.6412961,
    longitud: -105.2354235,
    plan: "premium",
    calificacionGoogle: 4.7,
    numResenas: 73,
    urlGoogleMaps: "https://www.google.com/maps/place/Ópticas+Álvarez/@20.6412961,-105.2354235,17z",
    sitioWeb: "opticasalvarez.com",
    especialidades: ["Examen de la vista", "Lentes de sol", "Armazones de marca", "Reparación de armazones"],
    segurosAceptados: [],
    horarios: [
      { dia: "Lunes", apertura: "10:00", cierre: "21:00", cerrado: false },
      { dia: "Martes", apertura: "10:00", cierre: "21:00", cerrado: false },
      { dia: "Miércoles", apertura: "10:00", cierre: "21:00", cerrado: false },
      { dia: "Jueves", apertura: "10:00", cierre: "21:00", cerrado: false },
      { dia: "Viernes", apertura: "10:00", cierre: "21:00", cerrado: false },
      { dia: "Sábado", apertura: "10:00", cierre: "21:00", cerrado: false },
      { dia: "Domingo", apertura: "11:00", cierre: "19:00", cerrado: false }
    ],
    resenasGoogle: {
      calificacion: 4.7,
      totalResenas: 73,
      urlPerfil: "https://www.google.com/maps/place/Ópticas+Álvarez/@20.6412961,-105.2354235,17z",
      ultimasResenas: [
        {
          autor: "Sergio González",
          calificacion: 5,
          fecha: "2026-01",
          texto: "Sinceramente el mejor servicio que puedes encontrar en Puerto Vallarta, perdí mis lentes en el mar aproximadamente a las 6 de la tarde en el mar, llamé a la óptica para sacar una cita para hacerme los lentes y a las 8:37 del mismo día ya tenía mis lentes..."
        },
        {
          autor: "Iris Ruiz",
          calificacion: 5,
          fecha: "2026-02",
          texto: "Excelente servicio y trato! Vine de vacaciones y se me perdieron mis lentes, me solucionaron de manera rápida y en sábado. Super recomendado!"
        },
        {
          autor: "Sandra MG",
          calificacion: 5,
          fecha: "2026-09",
          texto: "Excelente servicio! super rápido si es que se necesita alguna urgencia, recomendadisimo!"
        }
      ]
    },
    verificada: true
  },
  {
    nombreComercial: "ÓPTICA CUAUTITLAN IZCALLI | Zeiss Vision Expert",
    email: "contacto@opticasyprometria.com",
    telefono: "55 1553 6269",
    whatsapp: "5515536269",
    direccion: "Avenida 1 de Mayo Mz C 24B, Local 193, Centro Urbano",
    ciudad: "Cuautitlán Izcalli",
    estado: "Estado de México",
    cp: "54700",
    latitud: 19.6469616,
    longitud: -99.2079886,
    plan: "premium_plus",
    calificacionGoogle: 5.0,
    numResenas: 245,
    urlGoogleMaps: "https://www.google.com/maps/place/ÓPTICA+CUAUTITLAN+IZCALLI/@19.6469616,-99.2079886,17z",
    sitioWeb: "opticasyprometria.com",
    especialidades: ["Examen de la vista gratis", "Entrega en 1 hora", "Graduaciones altas", "Lentes progresivos", "Reparación de armazones", "Zeiss Vision Expert"],
    segurosAceptados: ["AUNA", "GNP Seguros", "MetLife", "AXA"],
    horarios: [
      { dia: "Lunes", apertura: "10:00", cierre: "19:00", cerrado: false },
      { dia: "Martes", apertura: "10:00", cierre: "19:00", cerrado: false },
      { dia: "Miércoles", apertura: "10:00", cierre: "19:00", cerrado: false },
      { dia: "Jueves", apertura: "10:00", cierre: "19:00", cerrado: false },
      { dia: "Viernes", apertura: "10:00", cierre: "19:00", cerrado: false },
      { dia: "Sábado", apertura: "10:00", cierre: "19:00", cerrado: false },
      { dia: "Domingo", apertura: "00:00", cierre: "00:00", cerrado: true }
    ],
    resenasGoogle: {
      calificacion: 5.0,
      totalResenas: 245,
      urlPerfil: "https://www.google.com/maps/place/ÓPTICA+CUAUTITLAN+IZCALLI/@19.6469616,-99.2079886,17z",
      ultimasResenas: [
        {
          autor: "Juan Martín López Villegas",
          calificacion: 5,
          fecha: "2026-02",
          texto: "Inmejorable atención, servicio de reparación en minutos y muy atentos, no duden en visitarlos, además de reparar lentes, variedad de armazones de calidad y precios justos, la ubicación céntrica y donde estacionarse, gracias por su atención."
        },
        {
          autor: "Patricia Hernández",
          calificacion: 5,
          fecha: "2026-10",
          texto: "La atención fue excelente, como en las ocasiones anteriores que he asistido, me hicieron una reparación sin costo, el trato es muy bueno. Altamente recomendable. Felicidades por el buen servicio"
        },
        {
          autor: "Florez López Iturriaga Zaid",
          calificacion: 5,
          fecha: "2026-06",
          texto: "Todo excelente, la atención, la limpieza del lugar y hay muchos modelos. Siempre lo atienden de una manera completamente personalizada con una gran atención y te explica absolutamente todo."
        }
      ]
    },
    verificada: true
  },
  {
    nombreComercial: "ÓPTICA COACALCO | Zeiss Vision Expert",
    email: "contacto@opticayoptometria.com",
    telefono: "55 5879 5583",
    whatsapp: "5558795583",
    direccion: "Blvd Coacalco 156, Villa de las Flores",
    ciudad: "Coacalco",
    estado: "Estado de México",
    cp: "55710",
    latitud: 19.6423025,
    longitud: -99.1004749,
    plan: "premium_plus",
    calificacionGoogle: 4.9,
    numResenas: 174,
    urlGoogleMaps: "https://www.google.com/maps/place/ÓPTICA+COACALCO/@19.6423025,-99.1004749,17z",
    sitioWeb: "opticayoptometria.com",
    especialidades: ["Examen de la vista gratis", "Lentes de contacto", "Lentes progresivos", "Armazones de marca", "Zeiss Vision Expert", "Atención personalizada"],
    segurosAceptados: ["AUNA", "GNP Seguros", "MetLife"],
    horarios: [
      { dia: "Lunes", apertura: "10:00", cierre: "19:00", cerrado: false },
      { dia: "Martes", apertura: "10:00", cierre: "19:00", cerrado: false },
      { dia: "Miércoles", apertura: "10:00", cierre: "19:00", cerrado: false },
      { dia: "Jueves", apertura: "10:00", cierre: "19:00", cerrado: false },
      { dia: "Viernes", apertura: "10:00", cierre: "19:00", cerrado: false },
      { dia: "Sábado", apertura: "10:00", cierre: "18:00", cerrado: false },
      { dia: "Domingo", apertura: "00:00", cierre: "00:00", cerrado: true }
    ],
    resenasGoogle: {
      calificacion: 4.9,
      totalResenas: 174,
      urlPerfil: "https://www.google.com/maps/place/ÓPTICA+COACALCO/@19.6423025,-99.1004749,17z",
      ultimasResenas: [
        {
          autor: "Andrea Falcón",
          calificacion: 5,
          fecha: "2026-06",
          texto: "Excelente servicio en todos los sentidos. El examen de vista que me hicieron fue extremadamente detallado y cuidadoso. Como consecuencia, mis lentes quedaron bien a la primera. Fu porque necesitaba cambiar a lentes de contacto, y la marca..."
        },
        {
          autor: "Natanael Pérez",
          calificacion: 4,
          fecha: "2025-11",
          texto: "Recientemente compré mis lentes graduados, la experiencia fue positiva. El trato fue amable, me explicaron la amplia variedad que tienen. Además me dieron un detalle por mi compra, teniendo una atención personalizada. Espero volver pronto para comprarme a parte unos de repuesto. Nos encantan mis lentes."
        },
        {
          autor: "Liz Hernández",
          calificacion: 4,
          fecha: "2026-07",
          texto: "Excelente servicio, calidad, atención y precios accesibles. Te resuelven todas tus dudas, muy satisfecha con el servicio."
        }
      ]
    },
    verificada: true
  },
  {
    nombreComercial: "Visualia Roma Norte",
    email: "contacto@visualia.mx",
    telefono: "56 1747 8049",
    whatsapp: "5617478049",
    direccion: "Monterrey 170 B, Roma Nte., Cuauhtémoc",
    ciudad: "Ciudad de México",
    estado: "CDMX",
    cp: "06700",
    latitud: 19.4147364,
    longitud: -99.1658812,
    plan: "premium_plus",
    calificacionGoogle: 5.0,
    numResenas: 567,
    urlGoogleMaps: "https://www.google.com/maps/place/Visualia+Roma+Norte/@19.4147364,-99.1658812,17z",
    sitioWeb: "visualia.mx",
    especialidades: ["Examen de la vista gratis", "Tecnología de precisión", "Lentes progresivos", "Atención personalizada", "Entrega a domicilio"],
    segurosAceptados: ["AUNA", "GNP Seguros", "MetLife", "AXA", "Seguros Monterrey"],
    horarios: [
      { dia: "Lunes", apertura: "10:00", cierre: "19:00", cerrado: false },
      { dia: "Martes", apertura: "10:00", cierre: "19:00", cerrado: false },
      { dia: "Miércoles", apertura: "10:00", cierre: "19:00", cerrado: false },
      { dia: "Jueves", apertura: "10:00", cierre: "19:00", cerrado: false },
      { dia: "Viernes", apertura: "10:00", cierre: "19:00", cerrado: false },
      { dia: "Sábado", apertura: "10:00", cierre: "17:00", cerrado: false },
      { dia: "Domingo", apertura: "00:00", cierre: "00:00", cerrado: true }
    ],
    resenasGoogle: {
      calificacion: 5.0,
      totalResenas: 567,
      urlPerfil: "https://www.google.com/maps/place/Visualia+Roma+Norte/@19.4147364,-99.1658812,17z",
      ultimasResenas: [
        {
          autor: "Rudy Rocha",
          calificacion: 5,
          fecha: "2026-02",
          texto: "Fui a esta óptica para hacerme mis lentes y la verdad quedé muy satisfecho con todo el proceso. El optometrista fue súper amable y muy profesional, se tomó el tiempo necesario y explicó todo con claridad..."
        },
        {
          autor: "Chusi Castillo",
          calificacion: 5,
          fecha: "2026-10",
          texto: "Soy de Costa Rica y decidí hacerme unos lentes en CDMX. La optometrista David y su equipo en la clínica Visualia de Roma Norte fueron maravillosos!!! El tiempo que se tomó el especialista, la explicación a detalle, las recomendaciones y el..."
        },
        {
          autor: "Denisse Guevara",
          calificacion: 5,
          fecha: "2026-05",
          texto: "¡Me encantó mi experiencia en esta óptica! Desde el momento en que entré, me sentí bienvenida y atendido. El personal fue muy amable y profesional, me ayudaron a elegir los lentes perfectos para mí. El producto que me entregaron es de alta..."
        }
      ]
    },
    verificada: true
  },
  {
    nombreComercial: "Óptica Okulux suc Galerias Constituyentes",
    email: "contacto@okulux.com",
    telefono: "442 125 5097",
    whatsapp: "4421255097",
    direccion: "Av. Constituyentes 34 - Loc 6, zona dos extendida, Mercurio",
    ciudad: "Santiago de Querétaro",
    estado: "Querétaro",
    cp: "76046",
    latitud: 20.5847931,
    longitud: -100.3849207,
    plan: "free",
    calificacionGoogle: 4.9,
    numResenas: 146,
    urlGoogleMaps: "https://www.google.com/maps/place/Óptica+Okulux/@20.5847931,-100.3849207,17z",
    sitioWeb: "okulux.com",
    especialidades: ["Examen de la vista", "Lentes de sol", "Armazones", "Orientación y guía"],
    segurosAceptados: [],
    horarios: [
      { dia: "Lunes", apertura: "10:00", cierre: "14:30", cerrado: false },
      { dia: "Martes", apertura: "16:00", cierre: "20:00", cerrado: false },
      { dia: "Miércoles", apertura: "10:00", cierre: "14:30", cerrado: false },
      { dia: "Jueves", apertura: "16:00", cierre: "20:00", cerrado: false },
      { dia: "Viernes", apertura: "10:00", cierre: "14:30", cerrado: false },
      { dia: "Sábado", apertura: "10:00", cierre: "15:00", cerrado: false },
      { dia: "Domingo", apertura: "00:00", cierre: "00:00", cerrado: true }
    ],
    resenasGoogle: {
      calificacion: 4.9,
      totalResenas: 146,
      urlPerfil: "https://www.google.com/maps/place/Óptica+Okulux/@20.5847931,-100.3849207,17z",
      ultimasResenas: [
        {
          autor: "Paola Quezada",
          calificacion: 5,
          fecha: "2026-09",
          texto: "Muy buena atención, la señorita que atendió fue muy paciente y atenta y me apoyó en todas las dudas que tenía"
        },
        {
          autor: "Valentín Muñoz",
          calificacion: 5,
          fecha: "2026-06",
          texto: "Excelente atención, orientación y guía en general. Me apoyaron para elegir el modelo y me explicaron qué aspectos debía contemplar mis anteojos según la necesidad de mis ojos..."
        }
      ]
    },
    verificada: false
  }
];

// 4. Función principal de ejecución
async function seedOpticas() {
  console.log('\n🌱 INICIANDO SEEDING DE 5 ÓPTICAS 100% REALES...\n');
  console.log('📍 Datos extraídos de Google Maps - Octubre 2026\n');

  try {
    const batch = db.batch();
    
    for (const optica of opticasData) {
      const newDocRef = db.collection('opticas').doc();
      batch.set(newDocRef, {
        ...optica,
        fechaRegistro: new Date().toISOString(),
        id: newDocRef.id
      });
      console.log(`   ✅ ${optica.nombreComercial}`);
      console.log(`      📍 ${optica.ciudad}, ${optica.estado}`);
      console.log(`      ⭐ ${optica.calificacionGoogle}★ (${optica.numResenas} reseñas)`);
      console.log(`      💎 Plan: ${optica.plan.toUpperCase()}`);
      console.log('');
    }

    await batch.commit();
    
    console.log('\n✅ ¡5 ÓPTICAS CREADAS EXITOSAMENTE EN FIREBASE!\n');
    console.log('📊 Resumen del Ranking:');
    console.log('   🥇 Visualia Roma Norte - 5.0★ (567 reseñas) - Premium+');
    console.log('    Óptica Cuautitlán Izcalli - 5.0★ (245 reseñas) - Premium+');
    console.log('    Óptica Coacalco - 4.9★ (174 reseñas) - Premium+');
    console.log('   4️⃣ Óptica Okulux - 4.9★ (146 reseñas) - Gratis');
    console.log('   5️⃣ Ópticas Álvarez - 4.7★ (73 reseñas) - Premium');
    console.log('\n Ve a http://localhost:3000 y mira el Top 3 del Ranking en acción!');
    console.log('   Verás las reseñas REALES de Google, calificaciones y el algoritmo funcionando.\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ ERROR al sembrar las ópticas:', error);
    process.exit(1);
  }
}

// Ejecutar
seedOpticas();
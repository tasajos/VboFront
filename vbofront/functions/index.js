/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.enviarNotificacion = functions.https.onCall(async (data, context) => {
    if (!data || !data.titulo || !data.tipo || !data.ciudad) {
        throw new functions.https.HttpsError('invalid-argument', 'Faltan datos requeridos');
    }

    const db = admin.database();
    const tokensSnapshot = await db.ref('deviceTokens').once('value');
    const tokensData = tokensSnapshot.val();

    if (!tokensData) {
        console.log("No hay tokens disponibles para enviar notificaciones.");
        return { success: false, message: "No hay tokens disponibles para enviar notificaciones." };
    }

    // Extrae los tokens desde los datos obtenidos
    const tokens = Object.values(tokensData).map(item => item.token);

    const payload = {
        notification: {
            title: data.titulo,
            body: `${data.tipo} en ${data.ciudad}`,
            imageUrl: data.imagen || '',  // La imagen ahora es opcional
        },
        data: {
            estado: data.estado,
            tipo: data.tipo,
            ciudad: data.ciudad,
        },
    };

    try {
        const response = await admin.messaging().sendToDevice(tokens, payload);
        const tokensToRemove = [];

        response.results.forEach((result, index) => {
            const error = result.error;
            if (error) {
                console.error('Error al enviar a', tokens[index], error);
                // Si hay algún error con un token en particular, lo podemos eliminar de la base de datos
                if (error.code === 'messaging/invalid-registration-token' ||
                    error.code === 'messaging/registration-token-not-registered') {
                    tokensToRemove.push(tokens[index]);
                }
            }
        });

        // Elimina los tokens inválidos de la base de datos
        tokensToRemove.forEach((token) => {
            const keyToDelete = Object.keys(tokensData).find(key => tokensData[key].token === token);
            if (keyToDelete) {
                db.ref(`deviceTokens/${keyToDelete}`).remove();
            }
        });

        console.log("Notificación enviada con éxito:", response);
        return { success: true };
    } catch (error) {
        console.error("Error al enviar la notificación:", error);
        throw new functions.https.HttpsError('internal', 'Error al enviar la notificación: ' + error.message);
    }
});

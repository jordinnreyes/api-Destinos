const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken'); // Usamos la librería JWT
const dynamodb = new AWS.DynamoDB.DocumentClient();

const DESTINOS_TABLE = process.env.DESTINOS_TABLE;

exports.handler = async (event) => {
    try {
        // Obtener el token del encabezado Authorization
        const token = event.headers.Authorization.split(' ')[1]; // "Bearer <token>"

        // Verificar el token utilizando el microservicio Usuario
        const authPayload = await verifyToken(token);

        if (!authPayload) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: 'Token inválido o expirado' })
            };
        }

        // Procesar la solicitud para eliminar el destino
        const data = JSON.parse(event.body);

        if (!data.id_destino || !data.ciudad) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'El ID del destino y la ciudad son obligatorios' })
            };
        }

        const params = {
            TableName: DESTINOS_TABLE,
            Key: {
                id_destino: data.id_destino,
                ciudad: data.ciudad
            }
        };

        await dynamodb.delete(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Destino eliminado con éxito' })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Ocurrió un error al eliminar el destino' })
        };
    }
};

// Función para verificar el token JWT en el microservicio Usuario
async function verifyToken(token) {
    try {
        const secret = process.env.JWT_SECRET; // Asegúrate de que esta clave esté configurada en tus variables de entorno
        const payload = jwt.verify(token, secret); // Verifica el token
        return payload; // Devuelve los datos del payload si el token es válido
    } catch (error) {
        console.error('Token inválido o expirado', error);
        return null; // Si el token es inválido o expirado
    }
}

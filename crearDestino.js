const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken'); // Usamos la librería JWT
const dynamodb = new AWS.DynamoDB.DocumentClient();
const uuid = require('uuid'); // Generar IDs únicos

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

        // Procesar la solicitud del destino
        const data = JSON.parse(event.body);
        const item = {
            id_destino: uuid.v4(),
            ciudad: data.ciudad,
            pais: data.pais,
            descripcion: data.descripcion,
            popularidad: data.popularidad
        };

        // Guardar el destino en DynamoDB
        await dynamodb.put({
            TableName: DESTINOS_TABLE,
            Item: item
        }).promise();

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Destino creado con éxito', destino: item })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Ocurrió un error al crear el destino' })
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

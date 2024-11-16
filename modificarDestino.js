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

        // Procesar la solicitud del destino
        const data = JSON.parse(event.body);

        if (!data.id_destino) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'El ID del destino es obligatorio' })
            };
        }

        const params = {
            TableName: DESTINOS_TABLE,
            Key: {
                id_destino: data.id_destino,
                ciudad: data.ciudad
            },
            UpdateExpression: `SET 
                #pais = :pais,
                descripcion = :descripcion,
                popularidad = :popularidad`,
            ExpressionAttributeNames: {
                "#pais": "pais"
            },
            ExpressionAttributeValues: {
                ":pais": data.pais,
                ":descripcion": data.descripcion,
                ":popularidad": data.popularidad
            },
            ReturnValues: "ALL_NEW"
        };

        const result = await dynamodb.update(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Destino modificado con éxito', destino: result.Attributes })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Ocurrió un error al modificar el destino' })
        };
    }
};


async function verifyToken(token) {
    try {
        const secret = process.env.JWT_SECRET; 
        const payload = jwt.verify(token, secret); 
        return payload; 
    } catch (error) {
        console.error('Token inválido o expirado', error);
        return null; 
    }
}

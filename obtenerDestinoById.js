const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const DESTINOS_TABLE = process.env.DESTINOS_TABLE;

exports.handler = async (event) => {
    try {
        // Obtener el id_destino de los parámetros de la solicitud
        const { id_destino } = event.pathParameters;

        if (!id_destino) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'El id_destino es requerido' }),
            };
        }

        // Parámetros de consulta
        const params = {
            TableName: DESTINOS_TABLE,
            Key: {
                id_destino: id_destino, // Clave primaria
            },
        };

        // Obtener el destino desde DynamoDB
        const result = await dynamodb.get(params).promise();

        // Verificar si se encontró el destino
        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'Destino no encontrado' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Destino obtenido con éxito',
                destino: result.Item,
            }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Ocurrió un error al obtener el destino' }),
        };
    }
};

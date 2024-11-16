const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const DESTINOS_TABLE = process.env.DESTINOS_TABLE;

exports.handler = async (event) => {
    try {
        // Parámetros de escaneo de la tabla
        const params = {
            TableName: DESTINOS_TABLE,
        };

        // Realizar el escaneo para obtener todos los destinos
        const result = await dynamodb.scan(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Destinos obtenidos con éxito',
                destinos: result.Items,
            }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Ocurrió un error al obtener los destinos' }),
        };
    }
};

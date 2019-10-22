import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import * as HapiSwagger from 'hapi-swagger';
import { registerController } from './decorators';
import { UserController } from './controllers/UserController';
import { ItemController } from './controllers/ItemController';

const init = async (): Promise<void> => {

    const server = new Hapi.Server({
        port: 3000,
        host: 'localhost',
    });

    const swaggerOptions = {
        info: {
            title: 'Test API Documentation',
            version: '1.0',
        },
    };

    await server.register([
        Inert,
        Vision,
        HapiSwagger
    ]);

    await registerController(server, [
        UserController,
        ItemController
    ]);

    await server.start();
    console.info('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.error(err);
    process.exit(1);
});

init();

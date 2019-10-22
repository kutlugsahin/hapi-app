import Hapi from '@hapi/hapi';
import { registerController } from './decorators';
import { UserController } from './controllers/UserController';

const init = async (): Promise<void> => {

    const server = new Hapi.Server({
        port: 3000,
        host: 'localhost',
    });

    server.route(registerController(UserController));

    await server.start();
    console.info('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.error(err);
    process.exit(1);
});

init();

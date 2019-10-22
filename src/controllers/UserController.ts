import { Lifecycle, Request } from '@hapi/hapi';
import { Controller, Get, All } from '../decorators';

@Controller('/user')
export class UserController {

    @Get('/{id}')
    public users(request: Request): Lifecycle.ReturnValue {
        return {
            id: request.params.id,
            body: request.payload,
        };
    }
}

import { Lifecycle, Request } from '@hapi/hapi';
import { Controller, Post, Get } from '../decorators';

@Controller('/user')
export class UserController {

    @Get()
    @Post('/{id}')
    public users(request: Request): Lifecycle.ReturnValue {
        return {
            id: request.params.id,
            body: request.payload,
        };
    }
}

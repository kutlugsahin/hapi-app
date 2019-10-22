import { Lifecycle, Request } from '@hapi/hapi';
import { Controller, Get, All } from '../decorators';

@Controller('/item')
export class ItemController {

    @All('/{id}')
    public item(request: Request): Lifecycle.ReturnValue {
        return {
            itemId: request.params.id,
        };
    }
}

import { Lifecycle, Request } from '@hapi/hapi';
import { Controller, Get, All } from '../decorators';

@Controller('/item')

export class ItemController {

    @All('/{id}/{a?}')
    public async item(request: Request): Promise<Lifecycle.ReturnValue> {
        
        await new Promise(r => setTimeout(r, 1000));

        return {
            itemId: request.params.id,
            a: request.params.a,
        };
    }
}

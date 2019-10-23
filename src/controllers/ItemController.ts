import { Lifecycle, Request } from '@hapi/hapi';
import { Controller, Get, All, Validate } from '../decorators';
import Joi from '@hapi/joi';

@Controller('/item')

export class ItemController {

    @Validate({
        params: {
            id: Joi.number().required(),
            a: Joi.string().optional()
        },

    })
    @All('/{id}/{a?}')
    public async item(request: Request): Promise<Lifecycle.ReturnValue> {
        
        // await new Promise(r => setTimeout(r, 1000));

        return {
            itemId: request.params.id,
            a: request.params.a,
        };
    }
}

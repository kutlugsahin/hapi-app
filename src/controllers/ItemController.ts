import { Lifecycle, Request } from '@hapi/hapi';
import { Controller, Get, All } from '../decorators';
import Joi = require('@hapi/joi');

@Controller('/item')

export class ItemController {

    @All('/{id}/{a?}')
    public item(request: Request): Lifecycle.ReturnValue {
        return {
            itemId: request.params.id,
            a: request.params.a,
        };
    }
}

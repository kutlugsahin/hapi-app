import { Lifecycle, ServerRoute, Util, Server, RouteOptionsValidate, RouteOptions, ValidationObject } from '@hapi/hapi';
import Joi from '@hapi/joi';
import { tags } from 'joi';

const path = Symbol('path');
const methodInfoMap = Symbol('methodInfoMap');

type MethodDecorator = (target: Object, name: string, descriptor: TypedPropertyDescriptor<Lifecycle.Method>) => void;

type Class = { new(): object };

interface RouteInfo {
    path?: string;
    method: Util.HTTP_METHODS | '*';
}

interface MethodInfo {
    name: string;
    routes: RouteInfo[];
    validation?: RouteOptionsValidate;
    method: Lifecycle.Method;
}

interface ControllerType extends Object{
    [methodInfoMap]: Map<string, MethodInfo>;
    [path]: string;
}

export function Controller(controllerPath: string) {
    return (target: Class): void => {
        Object.defineProperty(target.prototype, path, {
            value: controllerPath,
            writable: false,
            enumerable: false,
        });
    };
}

function getMethodInfo(target: object, name: string, method: Lifecycle.Method): MethodInfo {
    const controller = target as ControllerType;

    if (!controller[methodInfoMap]) {
        controller[methodInfoMap] = new Map();
    }

    if (!controller[methodInfoMap].has(name)) {
        controller[methodInfoMap].set(name, {
            name,
            routes: [],
            method,
        });
    }

    return controller[methodInfoMap].get(name)!;
}

export function Validate(validationObject: RouteOptionsValidate): MethodDecorator {
    return (target, name, descriptor): void => {
        const methodInfo = getMethodInfo(target, name, descriptor.value!);
        methodInfo.validation = validationObject;
    }
}

function createAction(path: string | undefined, method?: Util.HTTP_METHODS): MethodDecorator {
    return (target, name, descriptor): void => {
        const methodInfo = getMethodInfo(target, name, descriptor.value!);
        methodInfo.routes.push({
            path,
            method: method || '*',
        })
    };
}

export const Get = (path?: string): MethodDecorator => createAction(path, "GET");
export const Post = (path?: string): MethodDecorator => createAction(path, "POST");
export const Put = (path?: string): MethodDecorator => createAction(path, "PUT");
export const Delete = (path?: string): MethodDecorator => createAction(path, "DELETE");
export const Patch = (path?: string): MethodDecorator => createAction(path, "PATCH");
export const Options = (path?: string): MethodDecorator => createAction(path, "OPTIONS");
export const All = (path?: string): MethodDecorator => createAction(path);

export async function registerController(server: Server, ControllerClass: Class | Class[]): Promise<void> {

    const classes = Array.isArray(ControllerClass) ? ControllerClass : [ControllerClass];

    for (const contollerClass of classes) {
        const instance = new contollerClass() as ControllerType;

        const controllerPath = instance[path];

        const serverRoutes: ServerRoute[] = [...instance[methodInfoMap].values()].map((methodInfo: MethodInfo): ServerRoute => {
            const paths = methodInfo.routes.filter(p => p.path);
            if (methodInfo.routes.filter(p => p.path).length !== 1) {
                console.warn(`define only one route path for a method: ${contollerClass.prototype.name} ${methodInfo.name}`);
            }

            const path = controllerPath + paths[0].path!;
                        
            return {
                path,
                method: methodInfo.routes.map(r => r.method || '*'),
                options: {
                    handler: methodInfo.method,
                    validate: methodInfo.validation,
                    tags: ['api'],
                    response: {
                        
                    }
                },

            }
        });

        await server.register({
            plugin: {
                name: instance.constructor.name,
                register: async (server): Promise<void> => {
                    server.route(serverRoutes);
                },
            },
        })
    }
}

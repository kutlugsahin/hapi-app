import { ServerRoute, Lifecycle, Util, ResponseToolkit, Request } from '@hapi/hapi';

const path = Symbol('path');
const routes = Symbol('routes');

type Method1 = (request: Request, h: ResponseToolkit, err: Error) => Lifecycle.ReturnValue;
type Method2 = (request: Request, h: ResponseToolkit) => Lifecycle.ReturnValue;
type Method3 = (request: Request) => Lifecycle.ReturnValue;
type Method4 = () => Lifecycle.ReturnValue;

type Method = Method1 | Method2 | Method3 | Method4;

type MethodDecorator = (target: Object, name: string, descriptor: TypedPropertyDescriptor<Method>) => void;

type Class = { new(): object };

interface ControllerClassType {
    new(): ControllerType;
}

interface ControllerType extends Object{
    [routes]: Map<string, ServerRoute>;
    [path]: string;
}

export function Controller(controllerPath: string) {
    // tslint:disable-next-line:ban-types
    return (target: Class): void => {
        Object.defineProperty(target.prototype, path, {
            value: controllerPath,
            writable: false,
            enumerable: false,
        });
    };
}

function createAction(path: string | undefined, method: Util.HTTP_METHODS_PARTIAL | Util.HTTP_METHODS_PARTIAL[]): MethodDecorator {
    return (target, name, descriptor): void => {
        const controller = target as ControllerType;

        if (!controller[routes]) {
            controller[routes] = new Map();
        }

        let serverRoute = controller[routes].get(name);

        if (!serverRoute) {
            serverRoute = {
                handler: descriptor.value,
                method: [],
                path: '/',
            };

            controller[routes].set(name, serverRoute);
        }

        if (path) {
            serverRoute.path = path;
        }

        serverRoute.method = Array.isArray(method) ? [...serverRoute.method, ...method] : [...serverRoute.method, method];
    };
}

export const Get = (path?: string): MethodDecorator => createAction(path, "GET");
export const Post = (path?: string): MethodDecorator => createAction(path, "POST");
export const Put = (path?: string): MethodDecorator => createAction(path, "PUT");
export const Delete = (path?: string): MethodDecorator => createAction(path, "DELETE");
export const Patch = (path?: string): MethodDecorator => createAction(path, "PATCH");
export const Options = (path?: string): MethodDecorator => createAction(path, "OPTIONS");

export function registerController(ControllerClass: Class): ServerRoute[] {

    const instance = new ControllerClass() as ControllerType;

    const controllerPath = instance[path];

    return [...instance[routes].values()].map(r => ({
        ...r,
        path: `${controllerPath}${r.path}`
    }))
}

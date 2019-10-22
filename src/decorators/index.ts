import { Lifecycle, ServerRoute, Util, Server } from '@hapi/hapi';

const path = Symbol('path');
const routes = Symbol('routes');

type MethodDecorator = (target: Object, name: string, descriptor: TypedPropertyDescriptor<Lifecycle.Method>) => void;

type Class = { new(): object };

interface ControllerType extends Object{
    [routes]: Map<string, ServerRoute>;
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

function createAction(path: string | undefined, method?: Util.HTTP_METHODS_PARTIAL | Util.HTTP_METHODS_PARTIAL[]): MethodDecorator {
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

        if (method) {
            serverRoute.method = Array.isArray(method) ? [...serverRoute.method, ...method] : [...serverRoute.method, method];
        } else {
            serverRoute.method = '*';
        }
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

        const serverRoutes: ServerRoute[] = [...instance[routes].values()].map(r => ({
            ...r,
            path: `${controllerPath}${r.path}`
        }))

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

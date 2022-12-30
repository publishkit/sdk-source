
interface IPlugin {
    id: string;
    options: ObjectAny;
    deps: string[] | Function;
    css: string[] | Function;

    new(app: any, options?: ObjectAny): IPlugin

    init(): Promise<boolean>
    code(): Promise<void>
    ui(): Promise<void>
}
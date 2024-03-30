export class Sync {
    create(modelname: string, sampleObject: any): void;
    insert(modelname: string, object: any): void;
    update(modelname: string, filter: any, object: any): void;
    delete(modelname: string, filter: any): void;
}
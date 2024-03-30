export class Metrics {
    constructor(loglevel: number);
    get(modelname: string, filter: any, options: any): void;
    getOne(modelname: string, filter: any): void;
    create(modelname: string, sampleObject: any): void;
    insert(modelname: string, object: any): void;
    update(modelname: string, filter: any, object: any): void;
    delete(modelname: string, filter: any): void;
}
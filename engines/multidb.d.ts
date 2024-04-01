export class MultiDbORM {
    db: any;
    dbType: string;
    reqMade: number;
    lastQLatency: any;
    loglevel: number;
    sync: import('../sync').Sync;
    metrics: import('./metrics').Metrics;

    constructor(db: any);

    async connect(): Promise<void>;

    setdb(db: any): void;

    getdb(): any;

    async get(modelname: string, filter: Record<string, any>): Promise<any>;

    async getOne(modelname: string, filter: Record<string, any>): Promise<any>;

    async create(modelname: string, object: Record<string, any>): Promise<any>;

    async insert(modelname: string, object: Record<string, any>): Promise<any>;

    async update(modelname: string, filter: Record<string, any>, object: Record<string, any>): Promise<any>;

    async delete(modelname: string, filter: Record<string, any>): Promise<any>;
}

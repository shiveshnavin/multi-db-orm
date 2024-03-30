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

    async get(modelname: string, filter: Record<string, any>): Promise<void>;

    async getOne(modelname: string, filter: Record<string, any>): Promise<void>;

    async create(modelname: string, object: Record<string, any>): Promise<void>;

    async insert(modelname: string, object: Record<string, any>): Promise<void>;

    async update(modelname: string, filter: Record<string, any>, object: Record<string, any>): Promise<void>;

    async delete(modelname: string, filter: Record<string, any>): Promise<void>;
}

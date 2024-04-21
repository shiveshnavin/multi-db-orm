export class MultiDbORM {
    db: any;
    dbType: string;
    reqMade: number;
    lastQLatency: any;
    loglevel: number;
    sync: import('../sync').Sync;
    metrics: import('./metrics').Metrics;

    constructor(db: any);

    connect(): Promise<void>;

    setdb(db: any): void;

    getdb(): any;

    get(modelname: string, filter?: Record<string, any>, options?: {
        apply?: {
            field: string,
            sort: string,
            ineq: {
                op: '>=' | '<=' | '=' | '>' | '<',
                value: string | number | boolean
            }
        },
        sort?: { field: string, order: 'asc' | 'desc' }[]
        limit?: number,
        offset?: number
    }): Promise<any>;

    getOne(modelname: string, filter: Record<string, any>): Promise<any[]>;

    create(modelname: string, object: Record<string, any>): Promise<any>;

    insert(modelname: string, object: Record<string, any>): Promise<any>;

    update(modelname: string, filter: Record<string, any>, object: Record<string, any>): Promise<any>;

    delete(modelname: string, filter?: Record<string, any>): Promise<any>;
}

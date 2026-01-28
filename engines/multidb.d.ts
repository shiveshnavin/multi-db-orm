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

    get<T = any>(modelname: string, filter?: Record<string, any>, options?: {
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
    }): Promise<T[]>;

    getOne<T = any>(modelname: string, filter: Record<string, any>): Promise<T>;

    create<T = any>(modelname: string, object: Record<string, any>): Promise<T>;

    insert<T = any>(modelname: string, object: Record<string, any>): Promise<T>;

    update<T = any>(modelname: string, filter: Record<string, any>, object: Record<string, any>): Promise<T>;

    delete<T = any>(modelname: string, filter?: Record<string, any>): Promise<T>;
}

import { MultiDbORM } from './multidb';

declare module 'mysql' {
    import { EventEmitter } from 'events';

    export interface ConnectionConfig {
        host: string;
        port: number;
        user: string;
        password: string;
        database?: string;
    }

    export class Connection extends EventEmitter {
        constructor(config: ConnectionConfig);
        connect(): void;
        end(): void;
        query(query: string, callback: (error: Error | null, results: any, fields: any) => void): void;
    }
}

export class MySQLDB extends MultiDbORM {
    db: typeof import('mysql')
    mysql: typeof import('mysql');
    connection: import('mysql').Connection;

    constructor(credentials: {
        host: string;
        port: string;
        username: string;
        password: string;
        database: string;
        connectionLimit?: Number;
        connectTimeout?: Number;
        acquireTimeout?: Number;
        timeout?: Number;
    });

    run(query: string): Promise<any[]>;

    closePool(): void;
}

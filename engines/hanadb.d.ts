import { MultiDbORM } from './multidb';

export type HanaDBConfig = {
    host: string;
    port: string;
    username: string;
    password: string;
    database?: string;
    connectionLimit?: Number;
    connectTimeout?: Number;
    acquireTimeout?: Number;
    timeout?: Number;
}

export class HanaDB extends MultiDbORM {
    declare db: typeof import('@sap/hana-client')
    connection: any;

    constructor(credentials: HanaDBConfig);

    run(query: string): Promise<any[]>;

    closePool(): void;
}

import { MultiDbORM } from './multidb';

export type MySQLDBConfig = {
    host: string;
    port: string;
    username: string;
    password: string;
    database: string;
    connectionLimit?: Number;
    connectTimeout?: Number;
    acquireTimeout?: Number;
    timeout?: Number;
}

export class MySQLDB extends MultiDbORM {
    db: typeof import('mysql')
    mysql: typeof import('mysql');
    connection: import('mysql').Connection;

    constructor(credentials: MySQLDBConfig);

    run(query: string): Promise<any[]>;

    closePool(): void;
}

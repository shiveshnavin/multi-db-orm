import { MultiDbORM } from './multidb';

export interface OracleDBConfig {
    username: string;
    password: string;
    net_service_name: string;
    wallet_dir: string;
    connection_pool_name?: string;
    wallet_password?: string;
    lib_dir?: string;
}

export declare class OracleDB extends MultiDbORM {
    db: typeof import('oracledb')
    connection_pool_name: string;
    schema: string;
    pool_creation: Promise<any>;

    constructor(config: OracleDBConfig);

    connect(): Promise<void>;

    run(query: string): Promise<any>;
}

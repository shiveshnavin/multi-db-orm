import MongoClient from 'mongodb/lib/mongo_client';
import { MultiDbORM } from './multidb';

export declare class MongoDB extends MultiDbORM {
    mongodbname: string;
    dbc: typeof import('mongodb');
    db: typeof import('mongodb');
    client: MongoClient;
    url: string;

    constructor(secureUrl: string, mongodbname: string);

    _close(): Promise<void>;

    _connect(): Promise<void>;

    run(query: string): Promise<any>;
}

import MongoClient from 'mongodb/lib/mongo_client';
import { MultiDbORM, MultiDbORMOptions } from './MultiDbORM';

export declare class MongoDB extends MultiDbORM {
    mongodbname: string;
    dbc: typeof import('mongodb');
    db: typeof import('mongodb');
    client: MongoClient;
    url: string;

    constructor(secureUrl: string, mongodbname: string);

    async _close(): Promise<void>;

    async _connect(): Promise<void>;

    async run(query: string): Promise<any>;
}

import { MultiDbORM } from './multidb';

export declare class SQLiteDB extends MultiDbORM {
    sqlite3: typeof import('sqlite3');
    db: typeof import('sqlite3')

    constructor(filepath?: string);

    run(query: string): Promise<any>;

}

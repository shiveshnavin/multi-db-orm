import { MultiDbORM, MultiDbORMOptions } from './MultiDbORM';

export declare class SQLiteDB extends MultiDbORM {
    sqlite3: typeof import('sqlite3');
    db: typeof import('sqlite3')

    constructor(filepath?: string);

    async run(query: string): Promise<any>;

}

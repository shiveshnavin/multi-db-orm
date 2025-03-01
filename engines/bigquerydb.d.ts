import { MultiDbORM } from './multidb';

interface ServiceAccount {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
}

export declare class BigQueryDB extends MultiDbORM {
    bq: any;
    serviceAccount: ServiceAccount;

    constructor(serviceAccountObj: ServiceAccount, datasetname?: string);

    run(query: string): Promise<any>;

    get(modelname: string, filter: any, options?: any): Promise<any>;

    getOne(modelname: string, filter: any, id?: string, options?: any): Promise<any>;

    create(modelname: string, sampleObject: any): Promise<any>;

    insert(modelname: string, object: any, id?: string): Promise<any>;

    update(modelname: string, filter: any, object: any, id?: string): Promise<any>;

    delete(modelname: string, filter: any, id?: string): Promise<any>;
}

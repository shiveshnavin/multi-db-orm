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

export declare class FireStoreDB extends MultiDbORM {
    admin: any; // Replace 'any' with actual Firebase Admin library types
    serviceAccount: ServiceAccount;

    constructor(serviceAccount: ServiceAccount, appname?: string);

    run(query: string): Promise<any>;

    attachOptions(modelref: any, options: any): any;

    _get(modelname: string, filter: any, options?: any): Promise<any>;

    get(modelname: string, filter: any, options?: any): Promise<any>;

    getOne(modelname: string, filter: any, id?: string, options?: any): Promise<any>;

    create(modelname: string, sampleObject: any): Promise<any>;

    insert(modelname: string, object: any, id?: string): Promise<any>;

    update(modelname: string, filter: any, object: any, id?: string): Promise<any>;

    delete(modelname: string, filter: any, id?: string): Promise<any>;
}

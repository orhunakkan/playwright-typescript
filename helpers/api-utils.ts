// @ts-ignore
import * as util from './util';

export class APIUtils {

    constructor() {

    }

    async getToken(username: any, password: any) {
        const access_token = await util.oauth_request(username, password);
        console.log(access_token);
    }
}

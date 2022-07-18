import axios, { AxiosStatic } from "axios";

export const GET = 'GET'
export const POST = 'POST'

export class RequestService {
    private readonly baseUrl: string
    private readonly requester: AxiosStatic

    constructor(baseUrl: string = '') {
        this.baseUrl = baseUrl;
        this.requester = axios
    }

    private genUrl(path: string) {
        const url = `${this.baseUrl}/${path}`
        return url.endsWith('/')? url.substring(0, url.length - 1): url;
    }

    public POST({path = '', body = {}}): Promise<any> {
        return this.requester.post(this.genUrl(path), body)
    }

    public GET({path = ''}): Promise<any> {
        return this.requester.get(this.genUrl(path))
    }
}
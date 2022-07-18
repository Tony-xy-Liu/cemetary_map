import { RequestService } from "./requests"

// no api
export class ApiService {
    private readonly requester: RequestService

    constructor() {
        // threading through server due to CORS security
        this.requester = new RequestService('api/v1')
    }
}

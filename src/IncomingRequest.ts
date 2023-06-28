import { LoadRequirement } from "./LoadRequirement";

class IncomingRequest {
    loadRequirements: LoadRequirement;
    name: string;

    constructor(name: string, loadRequirements: LoadRequirement) {
        this.name = name;
        this.loadRequirements = loadRequirements;
    }
}

export { IncomingRequest }
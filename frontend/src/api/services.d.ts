import type { ClientService } from "@feathersjs/feathers";
import type { Pipeline } from "@/types";

export interface ServiceTypes {
    '/api/v1/pipelines': ClientService<Pipeline>,
}

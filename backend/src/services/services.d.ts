import type { PipelinesService } from "./pipelines/pipelines.service.ts";

export interface ServiceTypes {
    '/api/v1/pipelines': PipelinesService,
}

import { ILoadOptionsFunctions, IExecuteFunctions, INodePropertyOptions, NodeOperationError } from 'n8n-workflow';
import { OrqApiResponse, OrqRequestBody, OrqCredentials, OrqDeploymentListResponse, OrqDeployment } from './types';
import { ERROR_MESSAGES } from './constants';
import { Orq } from "@orq-ai/node";

export class OrqApiService {
	private static async getOrqClient(context: ILoadOptionsFunctions | IExecuteFunctions): Promise<Orq> {
		const credentials = await context.getCredentials('orqApi') as OrqCredentials;
		return new Orq({
			apiKey: credentials.apiKey,
		});
	}

	static async getDeploymentKeys(context: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		try {
			const orq = await this.getOrqClient(context);
			const response = await orq.deployments.list() as OrqDeploymentListResponse;
			
			const deployments = response.data || [];
			
			return deployments.map((deployment: OrqDeployment) => ({
				name: deployment.description || deployment.key,
				value: deployment.key,
			}));
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			throw new NodeOperationError(context.getNode(), ERROR_MESSAGES.FETCH_DEPLOYMENTS_FAILED(errorMessage));
		}
	}

	static async invokeDeployment(
		context: IExecuteFunctions, 
		body: OrqRequestBody
	): Promise<OrqApiResponse> {
		try {
			const orq = await this.getOrqClient(context);
			
			const result = await orq.deployments.invoke({
				key: body.key,
				messages: body.messages as any,
				context: body.context,
				inputs: body.inputs,
			});
			
			return result as OrqApiResponse;
		} catch (error: unknown) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			throw new NodeOperationError(context.getNode(), ERROR_MESSAGES.DEPLOYMENT_INVOKE_FAILED(errorMessage));
		}
	}

}
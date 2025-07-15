import { ILoadOptionsFunctions, IExecuteFunctions, INodePropertyOptions, NodeOperationError } from 'n8n-workflow';
import { OrqApiResponse, OrqDeployment, OrqCredentials, OrqRequestBody, OrqDeploymentListResponse } from './types';
import { DEFAULT_BASE_URL, DEPLOYMENTS_LIST_ENDPOINT, DEPLOYMENT_INVOKE_ENDPOINT, REQUEST_TIMEOUT, ERROR_MESSAGES } from './constants';

export class OrqApiService {
	static async getDeploymentKeys(context: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		const credentials = await context.getCredentials('orqApi') as OrqCredentials;
		const baseUrl = credentials.baseUrl || DEFAULT_BASE_URL;
		
		try {
			const response = await context.helpers.requestWithAuthentication.call(context, 'orqApi', {
				method: 'GET',
				url: `${baseUrl}${DEPLOYMENTS_LIST_ENDPOINT}`,
				json: true,
			}) as OrqDeploymentListResponse;

			const deployments = (response.data || response) as OrqDeployment[];
			
			return deployments.map((deployment: OrqDeployment) => ({
				name: deployment.name || deployment.key,
				value: deployment.key,
			}));
		} catch (error: any) {
			throw new NodeOperationError(context.getNode(), ERROR_MESSAGES.FETCH_DEPLOYMENTS_FAILED(error.message || 'Unknown error'));
		}
	}

	static async invokeDeployment(
		context: IExecuteFunctions, 
		body: OrqRequestBody,
		credentials: OrqCredentials
	): Promise<OrqApiResponse> {
		const baseUrl = credentials.baseUrl || DEFAULT_BASE_URL;
		
		return await context.helpers.requestWithAuthentication.call(context, 'orqApi', {
			method: 'POST',
			url: `${baseUrl}${DEPLOYMENT_INVOKE_ENDPOINT}`,
			body,
			json: true,
			timeout: REQUEST_TIMEOUT,
		});
	}
}
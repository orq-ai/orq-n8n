import { ILoadOptionsFunctions, IExecuteFunctions, INodePropertyOptions, NodeOperationError } from 'n8n-workflow';
import { OrqApiResponse, OrqDeployment, OrqCredentials, OrqRequestBody, OrqDeploymentListResponse, OrqDeploymentConfig, OrqFixedCollectionContext, OrqContextProperty } from './types';
import { DEFAULT_BASE_URL, DEPLOYMENTS_LIST_ENDPOINT, DEPLOYMENT_INVOKE_ENDPOINT, DEPLOYMENT_CONFIG_ENDPOINT, REQUEST_TIMEOUT, ERROR_MESSAGES } from './constants';

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

	static async getDeploymentConfig(context: ILoadOptionsFunctions, deploymentKey: string, context_dictionary: OrqFixedCollectionContext): Promise<OrqDeploymentConfig> {
		const credentials = await context.getCredentials('orqApi') as OrqCredentials;
		const baseUrl = credentials.baseUrl || DEFAULT_BASE_URL;
		
		// Convert fixedCollection to object format
		let contextData: Record<string, string> = {};
		if (context_dictionary?.contextProperty?.length) {
			context_dictionary.contextProperty.forEach((item: OrqContextProperty) => {
				if (item.key) {
					contextData[item.key] = item.value || '';
				}
			});
		}
		
		try {
			const requestBody = {
				key: deploymentKey,
				context: contextData,
			};
			
			
			const response = await context.helpers.requestWithAuthentication.call(context, 'orqApi', {
				method: 'POST',
				url: `${baseUrl}${DEPLOYMENT_CONFIG_ENDPOINT}/get_config`,
				body: requestBody,
				json: true,
			}) as OrqDeploymentConfig;

			return response;
		} catch (error: any) {
			throw new NodeOperationError(context.getNode(), `Failed to fetch config for deployment "${deploymentKey}": ${error.message || 'Unknown error'}`);
		}
	}

	static async getInputKeysFromConfig(context: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
		try {
			const deploymentKey = context.getNodeParameter('deploymentKey') as string;
			let context_dictionary: OrqFixedCollectionContext;
			
			try {
				context_dictionary = context.getNodeParameter('context') as OrqFixedCollectionContext;
				// Ensure we have a valid structure
				if (!context_dictionary || typeof context_dictionary !== 'object') {
					context_dictionary = { contextProperty: [] };
				}
			} catch (error) {
				// If context parameter is not found or empty, use empty object
				context_dictionary = { contextProperty: [] };
			}
			
			if (!deploymentKey) {
				return [{
					name: 'No Deployment Key Selected',
					value: '',
				}];
			}

			const config = await this.getDeploymentConfig(context, deploymentKey, context_dictionary);
			const variables = this.extractVariablesFromMessages(config.messages || []);
			
			if (variables.length === 0) {
				return [{
					name: 'No Variables Found In System Messages',
					value: '',
				}];
			}
			
			return variables.map((variable: string) => ({
				name: variable,
				value: variable,
			}));
		} catch (error: any) {
			return [{
				name: `Error: ${error.message}`,
				value: '',
			}];
		}
	}


	private static extractVariablesFromMessages(messages: any[]): string[] {
		const variables = new Set<string>();
		
		for (const message of messages) {
			if (message.role === 'system' && message.content) {
				// Extract variables in {{}} format
				const matches = message.content.match(/\{\{([^}]+)\}\}/g);
				if (matches) {
					matches.forEach((match: string) => {
						const variable = match.replace(/[{}]/g, '').trim();
						if (variable) {
							variables.add(variable);
						}
					});
				}
			}
		}
		
		return Array.from(variables);
	}
}
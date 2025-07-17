import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import {
	OrqFixedCollectionMessages,
	OrqFixedCollectionInputs,
	OrqCredentials,
} from './types';

import { allProperties } from './node-properties';
import { OrqApiService } from './api-service';
import { MessageBuilder, InputsBuilder, RequestBodyBuilder } from './builders';
import { Validators } from './validators';

export class OrqDeployment implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Orq Deployment',
		name: 'orqDeployment',
		icon: 'file:orq.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{"Invoke: " + $parameter["deploymentKey"]}}',
		description: 'Invoke Orq AI deployment',
		defaults: {
			name: 'Orq Deployment',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'orqApi',
				required: true,
			},
		],
		properties: allProperties,
	};

	methods = {
		loadOptions: {
			async getDeploymentKeys(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return OrqApiService.getDeploymentKeys(this);
			},
			async getInputKeysFromConfig(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return OrqApiService.getInputKeysFromConfig(this);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			// Get required parameters
			const deploymentKey = this.getNodeParameter('deploymentKey', i) as string;
			const messagesData = this.getNodeParameter('messages', i) as OrqFixedCollectionMessages;

			// Get context and inputs
			// uncomment for CONTEXT USE
			// const context = this.getNodeParameter('context', i) as OrqFixedCollectionContext;
			// const contextObj = ContextBuilder.buildContext(context, this.getNode());

			const inputs = this.getNodeParameter('inputs', i) as OrqFixedCollectionInputs;

			// Build
			const messages = MessageBuilder.buildMessages(messagesData);
			const inputsObj = InputsBuilder.buildInputs(inputs, this.getNode());

			// Validate required fields
			Validators.validateDeploymentKey(deploymentKey, this.getNode());
			Validators.validateMessages(messages, this.getNode());
			
			// Build request body
			// uncomment for CONTEXT USE
			// const body = RequestBodyBuilder.build(deploymentKey, messages, contextObj, inputsObj);
			const body = RequestBodyBuilder.build(deploymentKey, messages, inputsObj);
			try {
				// Get credentials
				const credentials = await this.getCredentials('orqApi') as OrqCredentials;
				Validators.validateCredentials(credentials, this.getNode());

				// Make the API request
				const response = await OrqApiService.invokeDeployment(this, body, credentials);

				returnData.push({ json: response });
			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({ 
						json: { 
							error: error.message || 'Request failed',
							statusCode: error.response?.status || error.statusCode || 'Unknown',
							details: error.response?.data || error.description || undefined
						} 
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error.message || 'Request failed', {
					description: error.response?.data?.message || error.description
				});
			}
		}

		return [returnData];
	}
}
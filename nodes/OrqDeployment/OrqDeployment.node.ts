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
	OrqFixedCollectionContext,
	OrqCredentials,
} from './types';

import { allProperties } from './node-properties';
import { OrqApiService } from './api-service';
import { MessageBuilder, InputsBuilder, ContextBuilder, RequestBodyBuilder } from './builders';
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
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const deploymentKey = this.getNodeParameter('deploymentKey', i) as string;
			const messagesData = this.getNodeParameter('messages', i) as OrqFixedCollectionMessages;

			const context = this.getNodeParameter('context', i) as OrqFixedCollectionContext;
			const contextObj = ContextBuilder.buildContext(context, this.getNode());

			const inputs = this.getNodeParameter('inputs', i) as OrqFixedCollectionInputs;

			const messages = MessageBuilder.buildMessages(messagesData);
			const inputsObj = InputsBuilder.buildInputs(inputs, this.getNode());

			Validators.validateDeploymentKey(deploymentKey, this.getNode());
			Validators.validateMessages(messages, this.getNode());

			const body = RequestBodyBuilder.build(deploymentKey, messages, contextObj, inputsObj);
			try {
				const credentials = (await this.getCredentials('orqApi')) as OrqCredentials;
				Validators.validateCredentials(credentials, this.getNode());

				const response = await OrqApiService.invokeDeployment(this, body);
				const responseData = {
					id: response.id,
					created: response.created,
					object: response.object,
					model: response.model,
					provider: response.provider,
					isFinal: response.isFinal,
					integrationId: response.integrationId,
					finalized: response.finalized,
					systemFingerprint: response.systemFingerprint,
					retrievals: response.retrievals,
					providerResponse: response.providerResponse,
					choices: response.choices,
				};
				returnData.push({ json: responseData });
			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message || 'Request failed',
							statusCode: error.response?.status || error.statusCode || 'Unknown',
							details: error.response?.data || error.description || undefined,
						},
					});
					continue;
				}

				throw new NodeOperationError(this.getNode(), error.message || 'Request failed', {
					description: `${error.response?.data?.message || error.description}`,
				});
			}
		}

		return [returnData];
	}
}

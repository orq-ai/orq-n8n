import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';

import { knowledgeBaseSearchProperties } from './node-properties';
import { KnowledgeBaseService } from './knowledge-base-service';
import { RequestBuilder } from './request-builder';
import { InputValidator } from './validators';
import { OrqError } from './errors';

export class OrqKnowledgeBaseSearch implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Orq Knowledge Base Search',
		name: 'orqKnowledgeBaseSearch',
		icon: 'file:orq.svg',
		group: ['transform'],
		version: 1,
		description: 'Search content in an Orq.ai knowledge base',
		defaults: {
			name: 'Orq Knowledge Base Search',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'orqApi',
				required: true,
			},
		],
		properties: knowledgeBaseSearchProperties,
	};

	methods = {
		loadOptions: {
			async getKnowledgeBases(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return KnowledgeBaseService.getKnowledgeBaseOptions(this);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			let knowledgeBaseId = '';
			let searchRequest: any = {};

			try {
				// Get and validate knowledge base ID
				knowledgeBaseId = InputValidator.validateKnowledgeBaseId(
					this.getNode(),
					this.getNodeParameter('knowledgeBase', itemIndex),
				);

				// Build the search request with all validations
				searchRequest = RequestBuilder.buildSearchRequest(this, itemIndex);

				// Execute the search
				const response = await KnowledgeBaseService.searchKnowledgeBase(
					this,
					knowledgeBaseId,
					searchRequest,
				);

				// Include request body in output for debugging
				const outputData = {
					...response,
					// _debug: {
					// 	request: searchRequest,
					// 	knowledgeBaseId: knowledgeBaseId,
					// },
				};

				returnData.push({
					json: outputData as any,
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					const errorResponse = OrqKnowledgeBaseSearch.buildErrorResponse(error);
					
					// Include debug info in error response
					const errorOutput = {
						...errorResponse,
						// _debug: {
						// 	request: searchRequest,
						// 	knowledgeBaseId: knowledgeBaseId,
						// },
					};
					
					returnData.push({
						json: errorOutput,
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}

	private static buildErrorResponse(error: any): any {
		const response: any = {
			error: error.message,
		};

		if (error instanceof OrqError) {
			response.errorCode = error.code;
			if (error.statusCode) {
				response.statusCode = error.statusCode;
			}
			if (error.details) {
				response.details = error.details;
			}
		}

		return response;
	}
}

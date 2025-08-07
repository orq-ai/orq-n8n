import { IExecuteFunctions } from 'n8n-workflow';
import { IOrqKnowledgeBaseSearchRequest } from './types';
import { InputValidator } from './validators';
import { FilterBuilder } from './filter-builder';

export class RequestBuilder {
	static buildSearchRequest(
		context: IExecuteFunctions,
		itemIndex: number,
	): IOrqKnowledgeBaseSearchRequest {
		const query = context.getNodeParameter('query', itemIndex) as string;
		const additionalOptions = context.getNodeParameter('additionalOptions', itemIndex, {}) as any;

		const request: IOrqKnowledgeBaseSearchRequest = {
			query: InputValidator.validateQuery(context.getNode(), query),
		};

		// Add optional parameters if provided
		if (additionalOptions.top_k !== undefined) {
			request.top_k = InputValidator.validateTopK(context.getNode(), additionalOptions.top_k);
		}

		if (additionalOptions.threshold !== undefined && additionalOptions.threshold !== null && additionalOptions.threshold !== '') {
			request.threshold = InputValidator.validateThreshold(
				context.getNode(),
				additionalOptions.threshold,
			);
		}

		// Handle metadata filtering
		const metadataFilterType = context.getNodeParameter(
			'metadataFilterType',
			itemIndex,
			'none',
		) as string;

		const filter = FilterBuilder.buildFilter(context, metadataFilterType, itemIndex);
		if (filter) {
			request.filter_by = filter;
		}

		return request;
	}
}

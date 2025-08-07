import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestOptions,
	INodePropertyOptions,
} from 'n8n-workflow';
import { API_ENDPOINTS } from './constants';
import { ApiError } from './errors';
import {
	IOrqKnowledgeBase,
	IOrqKnowledgeBaseSearchRequest,
	IOrqKnowledgeBaseSearchResponse,
	IOrqKnowledgeBaseListResponse,
	IOrqKnowledgeBaseApiResponse,
} from './types';
import { InputValidator } from './validators';

export class KnowledgeBaseService {
	private static readonly DEFAULT_TIMEOUT = 30000;

	static async getKnowledgeBases(
		context: ILoadOptionsFunctions | IExecuteFunctions,
	): Promise<IOrqKnowledgeBase[]> {
		const options: IHttpRequestOptions = {
			method: 'GET',
			url: `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.KNOWLEDGE_BASES}`,
			json: true,
			timeout: this.DEFAULT_TIMEOUT,
		};

		try {
			const response = await context.helpers.requestWithAuthentication.call(
				context,
				'orqApi',
				options,
			);

			return this.parseKnowledgeBasesResponse(response);
		} catch (error) {
			if (error.statusCode) {
				throw new ApiError(
					context.getNode(),
					this.getErrorMessage('fetch knowledge bases', error),
					error.statusCode,
					error.responseBody,
				);
			}
			throw error;
		}
	}

	static async getKnowledgeBaseOptions(
		context: ILoadOptionsFunctions,
	): Promise<INodePropertyOptions[]> {
		try {
			const knowledgeBases = await this.getKnowledgeBases(context);
			return knowledgeBases.map((kb) => ({
				name: kb.name || kb.id,
				value: kb.id,
				description: kb.description,
			}));
		} catch (error) {
			return [];
		}
	}

	static async searchKnowledgeBase(
		context: IExecuteFunctions,
		knowledgeId: string,
		searchRequest: IOrqKnowledgeBaseSearchRequest,
	): Promise<IOrqKnowledgeBaseSearchResponse> {
		const validatedId = InputValidator.validateKnowledgeBaseId(context.getNode(), knowledgeId);
		const validatedRequest = InputValidator.validateSearchRequest(context.getNode(), searchRequest);

		const endpoint = API_ENDPOINTS.KNOWLEDGE_BASE_SEARCH.replace('{knowledge_id}', validatedId);
		const options: IHttpRequestOptions = {
			method: 'POST',
			url: `${API_ENDPOINTS.BASE_URL}${endpoint}`,
			body: validatedRequest,
			json: true,
			timeout: this.DEFAULT_TIMEOUT,
		};

		try {
			const response = await context.helpers.requestWithAuthentication.call(
				context,
				'orqApi',
				options,
			);

			return this.validateSearchResponse(response);
		} catch (error) {
			if (error.statusCode) {
				throw new ApiError(
					context.getNode(),
					this.getErrorMessage('search knowledge base', error),
					error.statusCode,
					error.responseBody,
				);
			}
			throw error;
		}
	}

	private static parseKnowledgeBasesResponse(response: any): IOrqKnowledgeBase[] {
		if (!response) return [];

		if (this.isOrqApiResponse(response)) {
			const apiResponse = response as IOrqKnowledgeBaseListResponse;
			return apiResponse.data.map(this.mapApiResponseToKnowledgeBase);
		}
		if (Array.isArray(response)) {
			return response;
		}

		return [];
	}

	private static isOrqApiResponse(response: any): response is IOrqKnowledgeBaseListResponse {
		return (
			response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)
		);
	}

	private static mapApiResponseToKnowledgeBase(
		kb: IOrqKnowledgeBaseApiResponse,
	): IOrqKnowledgeBase {
		return {
			id: kb._id || '',
			name: kb.key || kb._id || 'Unnamed Knowledge Base',
			description: kb.description || undefined,
		};
	}

	private static validateSearchResponse(response: any): IOrqKnowledgeBaseSearchResponse {
		if (!response || typeof response !== 'object') {
			throw new Error('Invalid response format from Orq API');
		}
		return response as IOrqKnowledgeBaseSearchResponse;
	}

	private static getErrorMessage(operation: string, error: any): string {
		const baseMessage = `Failed to ${operation}`;

		if (error.statusCode === 401) {
			return `${baseMessage}: Invalid API key or unauthorized access`;
		}
		if (error.statusCode === 404) {
			return `${baseMessage}: Resource not found`;
		}
		if (error.statusCode === 400) {
			return `${baseMessage}: Invalid request - ${error.message}`;
		}
		if (error.statusCode >= 500) {
			return `${baseMessage}: Orq API server error`;
		}

		return `${baseMessage}: ${error.message}`;
	}
}

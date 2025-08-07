import { INode } from 'n8n-workflow';
import { ValidationError } from './errors';
import { IOrqKnowledgeBaseSearchRequest } from './types';
import { SEARCH_CONFIG } from './constants';

export class InputValidator {
	private constructor() {}

	static validateKnowledgeBaseId(node: INode, knowledgeBase: any): string {
		if (!knowledgeBase || typeof knowledgeBase !== 'string' || !knowledgeBase.trim()) {
			throw new ValidationError(node, 'Knowledge base ID is required', 'knowledgeBase');
		}
		return knowledgeBase.trim();
	}

	static validateQuery(node: INode, query: any): string {
		if (!query || typeof query !== 'string') {
			throw new ValidationError(node, 'Query is required and must be a string', 'query');
		}

		const trimmedQuery = query.trim();
		if (!trimmedQuery) {
			throw new ValidationError(node, 'Query cannot be empty or whitespace only', 'query');
		}

		if (trimmedQuery.length > SEARCH_CONFIG.MAX_QUERY_LENGTH) {
			throw new ValidationError(
				node,
				`Query is too long. Maximum length is ${SEARCH_CONFIG.MAX_QUERY_LENGTH} characters`,
				'query',
			);
		}

		return trimmedQuery;
	}

	static validateTopK(node: INode, topK: any): number | undefined {
		if (topK === undefined || topK === null || topK === '') {
			return undefined;
		}

		const value = parseInt(topK, 10);
		if (isNaN(value) || value < SEARCH_CONFIG.MIN_TOP_K || value > SEARCH_CONFIG.MAX_TOP_K) {
			throw new ValidationError(
				node,
				`Chunk limit (top_k) must be an integer between ${SEARCH_CONFIG.MIN_TOP_K} and ${SEARCH_CONFIG.MAX_TOP_K}`,
				'top_k',
			);
		}

		return value;
	}

	static validateThreshold(node: INode, threshold: any): number | undefined {
		if (threshold === undefined || threshold === null || threshold === '') {
			return undefined;
		}

		const value = parseFloat(threshold);
		if (
			isNaN(value) ||
			value < SEARCH_CONFIG.MIN_THRESHOLD ||
			value > SEARCH_CONFIG.MAX_THRESHOLD
		) {
			throw new ValidationError(
				node,
				`Threshold must be a number between ${SEARCH_CONFIG.MIN_THRESHOLD} and ${SEARCH_CONFIG.MAX_THRESHOLD}`,
				'threshold',
			);
		}

		return value;
	}

	static validateSearchRequest(
		node: INode,
		request: IOrqKnowledgeBaseSearchRequest,
	): IOrqKnowledgeBaseSearchRequest {
		const validated: IOrqKnowledgeBaseSearchRequest = {
			query: this.validateQuery(node, request.query),
		};

		if (request.top_k !== undefined) {
			validated.top_k = this.validateTopK(node, request.top_k);
		}

		if (request.threshold !== undefined) {
			validated.threshold = this.validateThreshold(node, request.threshold);
		}

		if (request.filter_by !== undefined) {
			validated.filter_by = request.filter_by;
		}

		return validated;
	}

	static parseArrayValue(value: string): (string | number)[] {
		return value.split(',').map((v: string) => {
			const trimmed = v.trim();
			const num = Number(trimmed);
			return isNaN(num) ? trimmed : num;
		});
	}

	static parseValue(value: any): string | number {
		if (typeof value === 'number') return value;
		if (typeof value === 'string') {
			const num = Number(value);
			return isNaN(num) ? value : num;
		}
		return String(value);
	}
}

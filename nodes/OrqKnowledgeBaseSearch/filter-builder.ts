import { IExecuteFunctions } from 'n8n-workflow';
import { SearchFilter, SearchFilterRecord, AndFilter, OrFilter } from './types';
import { InputValidator } from './validators';
import { ValidationError } from './errors';

export class FilterBuilder {
	private constructor() {}

	static buildFilter(
		context: IExecuteFunctions,
		metadataFilterType: string,
		itemIndex: number,
	): SearchFilter | undefined {
		if (metadataFilterType === 'none' || !metadataFilterType) {
			return undefined;
		}

		if (metadataFilterType === 'and') {
			return this.buildLogicalFilter(context, itemIndex, 'and');
		} else if (metadataFilterType === 'or') {
			return this.buildLogicalFilter(context, itemIndex, 'or');
		} else if (metadataFilterType === 'custom') {
			return this.buildCustomFilter(context, itemIndex);
		} else {
			return undefined;
		}
	}


	private static buildLogicalFilter(
		context: IExecuteFunctions,
		itemIndex: number,
		type: 'and' | 'or',
	): AndFilter | OrFilter | undefined {
		const paramName = type === 'and' ? 'andFilters' : 'orFilters';
		const filters = context.getNodeParameter(paramName, itemIndex, {}) as any;

		if (!filters.condition || filters.condition.length === 0) {
			return undefined;
		}

		const conditions: SearchFilterRecord[] = [];

		for (const conditionItem of filters.condition) {
			if (!conditionItem.field || conditionItem.value === '') continue;

			const operator = conditionItem.operator || 'eq';
			const field = conditionItem.field;
			const value = conditionItem.value;

			conditions.push({
				[field]: this.createFilterValue(operator, value),
			});
		}

		if (conditions.length === 0) return undefined;

		return type === 'and' ? { and: conditions } : { or: conditions };
	}

	private static buildCustomFilter(
		context: IExecuteFunctions,
		itemIndex: number,
	): SearchFilter | undefined {
		const customFilter = context.getNodeParameter('customFilter', itemIndex, '{}') as string;

		try {
			const parsed = JSON.parse(customFilter);
			return Object.keys(parsed).length > 0 ? parsed : undefined;
		} catch (error) {
			throw new ValidationError(
				context.getNode(),
				'Invalid JSON in custom filter. Please provide valid JSON.',
				'customFilter',
			);
		}
	}

	private static createFilterValue(operator: string, value: any): any {
		if (operator === 'in' || operator === 'nin') {
			const arrayValues = InputValidator.parseArrayValue(value);
			return { [operator]: arrayValues };
		} else if (operator === 'gt' || operator === 'gte' || operator === 'lt' || operator === 'lte') {
			// For numeric comparison operators, ensure the value is a number
			const numValue = typeof value === 'string' ? parseFloat(value) : value;
			if (isNaN(numValue)) {
				throw new Error(`Value for ${operator} operator must be a number, got: ${value}`);
			}
			return { [operator]: numValue };
		} else {
			// For eq, ne, and other operators, parse normally
			const parsedValue = InputValidator.parseValue(value);
			return { [operator]: parsedValue };
		}
	}
}

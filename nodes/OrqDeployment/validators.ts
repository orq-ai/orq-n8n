import { NodeOperationError } from 'n8n-workflow';
import { INode } from 'n8n-workflow';
import { KEY_VALIDATION_REGEX, ERROR_MESSAGES, MESSAGE_LENGTH_LIMIT } from './constants';
import { OrqInputMessage } from './types';

export class Validators {
	static validateDeploymentKey(deploymentKey: string, node: INode): void {
		if (!deploymentKey || deploymentKey.trim() === '') {
			throw new NodeOperationError(node, ERROR_MESSAGES.DEPLOYMENT_KEY_REQUIRED);
		}
	}

	static validateMessages(messages: OrqInputMessage[], node: INode): void {
		if (messages.length === 0) {
			throw new NodeOperationError(node, ERROR_MESSAGES.MESSAGE_REQUIRED);
		}

		const totalMessageLength = messages.reduce((sum, msg) => sum + msg.content.length, 0);
		if (totalMessageLength > MESSAGE_LENGTH_LIMIT) {
			throw new NodeOperationError(node, ERROR_MESSAGES.MESSAGE_TOO_LONG);
		}
	}

	static validateKey(key: string, type: 'context' | 'input', node: INode): void {
		if (!KEY_VALIDATION_REGEX.test(key)) {
			const errorMessage = type === 'context' 
				? ERROR_MESSAGES.INVALID_CONTEXT_KEY(key)
				: ERROR_MESSAGES.INVALID_INPUT_KEY(key);
			throw new NodeOperationError(node, errorMessage);
		}
	}

	static validateCredentials(credentials: any, node: INode): void {
		if (!credentials) {
			throw new NodeOperationError(node, ERROR_MESSAGES.NO_CREDENTIALS);
		}
	}
}
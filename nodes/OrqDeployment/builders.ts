import { 
	OrqInputMessage, 
	OrqMessageProperty, 
	OrqContextProperty, 
	OrqInputProperty,
	OrqFixedCollectionMessages,
	OrqFixedCollectionContext,
	OrqFixedCollectionInputs,
	OrqRequestBody
} from './types';
import { Validators } from './validators';
import { INode } from 'n8n-workflow';

export class MessageBuilder {
	static buildMessages(messagesData: OrqFixedCollectionMessages): OrqInputMessage[] {
		const messages: OrqInputMessage[] = [];
		
		if (messagesData?.messageProperty?.length) {
			messagesData.messageProperty.forEach((item: OrqMessageProperty) => {
				if (item.message && item.role) {
					messages.push({
						role: item.role,
						content: item.message
					});
				}
			});
		}
		
		return messages;
	}
}

export class ContextBuilder {
	static buildContext(context: OrqFixedCollectionContext, node: INode): Record<string, string> | undefined {
		if (!context?.contextProperty?.length) {
			return undefined;
		}

		const contextObj: Record<string, string> = {};
		
		context.contextProperty.forEach((item: OrqContextProperty) => {
			const key = item.key?.trim();
			const value = item.value?.trim();
			
			if (key && value !== undefined) {
				Validators.validateKey(key, 'context', node);
				contextObj[key] = value;
			}
		});
		
		return Object.keys(contextObj).length > 0 ? contextObj : undefined;
	}
}

export class InputsBuilder {
	static buildInputs(inputs: OrqFixedCollectionInputs, node: INode): Record<string, string> | undefined {
		if (!inputs?.inputProperty?.length) {
			return undefined;
		}

		const inputsObj: Record<string, string> = {};
		
		inputs.inputProperty.forEach((item: OrqInputProperty) => {
			const key = item.key?.trim();
			const value = item.value?.trim();
			
			if (key && value !== undefined) {
				Validators.validateKey(key, 'input', node);
				inputsObj[key] = value;
			}
		});
		
		return Object.keys(inputsObj).length > 0 ? inputsObj : undefined;
	}
}

export class RequestBodyBuilder {
	static build(
		deploymentKey: string,
		messages: OrqInputMessage[],
		context?: Record<string, string>,
		inputs?: Record<string, string>
	): OrqRequestBody {
		const body: OrqRequestBody = {
			key: deploymentKey,
			messages: messages,
		};

		if (context) {
			body.context = context;
		}

		if (inputs) {
			body.inputs = inputs;
		}

		return body;
	}
}
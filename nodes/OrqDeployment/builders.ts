import { 
	OrqInputMessage, 
	OrqContextProperty, 
	OrqInputProperty,
	OrqFixedCollectionMessages,
	OrqFixedCollectionContext,
	OrqFixedCollectionInputs,
	OrqRequestBody,
	OrqContentItem
} from './types';
import { Validators } from './validators';
import { INode } from 'n8n-workflow';

export class MessageBuilder {
	static buildMessages(messagesData: OrqFixedCollectionMessages): OrqInputMessage[] {
		const messages: OrqInputMessage[] = [];
		
		if (messagesData?.messageProperty?.length) {
			for (const item of messagesData.messageProperty) {
				if (!item.role) continue;
				
				const message: OrqInputMessage = {
					role: item.role,
					content: ''
				};
				
				// Handle content based on role and content type
				if (item.role === 'user' && item.contentType && item.contentType !== 'text') {
					// User role with multimodal content
					const contentItems: OrqContentItem[] = [];
					
					// Add optional text content for images if provided
					if (item.contentType === 'image' && item.message && item.message.trim() !== '') {
						contentItems.push({
							type: 'text',
							text: item.message.trim()
						});
					}
					
					switch (item.contentType) {
						case 'image':
							if (item.imageSource === 'base64' && item.imageData) {
								contentItems.push({
									type: 'image_url',
									image_url: {
										url: item.imageData
									}
								});
							} else if (item.imageSource === 'url' && item.imageUrl) {
								contentItems.push({
									type: 'image_url',
									image_url: {
										url: item.imageUrl
									}
								});
							} else if (!item.imageSource && item.imageUrl) {
								// Backward compatibility
								contentItems.push({
									type: 'image_url',
									image_url: {
										url: item.imageUrl
									}
								});
							}
							break;
						
						// Audio support commented out for now
						// case 'input_audio':
						// 	if (item.audioData && item.audioFormat) {
						// 		contentItems.push({
						// 			type: 'input_audio',
						// 			input_audio: {
						// 				data: item.audioData,
						// 				format: item.audioFormat
						// 			}
						// 		});
						// 	}
						// 	break;
						
						// File support commented out for now
						// case 'file':
						// 	if (item.fileData && item.fileName) {
						// 		contentItems.push({
						// 			type: 'file',
						// 			file: {
						// 				file_data: item.fileData,
						// 				filename: item.fileName
						// 			}
						// 		});
						// 	}
						// 	break;
					}
					
					if (contentItems.length > 0) {
						message.content = contentItems;
					} else {
						continue; // Skip if no content
					}
				} else {
					// Non-user roles or text-only content
					if (!item.message || item.message.trim() === '') continue;
					message.content = item.message.trim();
				}
				
				
				messages.push(message);
			}
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
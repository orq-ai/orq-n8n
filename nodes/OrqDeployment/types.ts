export interface OrqDeployment {
	name?: string;
	key: string;
	description?: string;
	created_at?: string;
	updated_at?: string;
	status?: string;
}

export interface OrqInputMessage {
	role: 'user' | 'system' | 'assistant';
	content: string;
}

export interface OrqContextProperty {
	key: string;
	value: string;
}

export interface OrqInputProperty {
	key: string;
	value: string;
}

export interface OrqMessageProperty {
	role: 'user' | 'system' | 'assistant';
	message: string;
}

export interface OrqFixedCollectionMessages {
	messageProperty: OrqMessageProperty[];
}

export interface OrqFixedCollectionInputs {
	inputProperty: OrqInputProperty[];
}

export interface OrqFixedCollectionContext {
	contextProperty: OrqContextProperty[];
}

export interface OrqRequestBody {
	key: string;
	messages: OrqInputMessage[];
	context?: Record<string, string>;
	inputs?: Record<string, string>;
}

export interface OrqMessage {
	role: string;
	content: string;
	type?: string;
}

export interface OrqChoice {
	index: number;
	finish_reason: string;
	message: OrqMessage;
}

export interface OrqChatHistoryItem {
	role: string;
	message: string;
}

export interface OrqMeta {
	api_version?: {
		version: string;
	};
	billed_units?: {
		input_tokens: number;
		output_tokens: number;
	};
	tokens?: {
		input_tokens: number;
		output_tokens: number;
	};
}

export interface OrqProviderResponse {
	response_id: string;
	text: string;
	generation_id: string;
	chat_history: OrqChatHistoryItem[];
	finish_reason: string;
	meta?: OrqMeta;
}

export interface OrqApiResponse {
	id: string;
	created: string;
	object: string;
	model?: string;
	provider?: string;
	is_final?: boolean;
	finalized?: string;
	choices: OrqChoice[];
	provider_response?: OrqProviderResponse;
	[key: string]: string | number | boolean | object | undefined;
}

export interface OrqDeploymentListResponse {
	data?: OrqDeployment[];
	[key: string]: string | number | boolean | object | undefined;
}

export interface OrqCredentials {
	baseUrl?: string;
	apiKey: string;
}

export interface OrqDeploymentConfig {
	id: string;
	key: string;
	name?: string;
	messages?: OrqInputMessage[];
	[key: string]: string | number | boolean | object | undefined;
}
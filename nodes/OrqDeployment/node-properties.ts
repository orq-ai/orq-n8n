import { INodeProperties } from 'n8n-workflow';

export const deploymentKeyProperty: INodeProperties = {
	// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
	displayName: 'Deployment Key',
	name: 'deploymentKey',
	type: 'options',
	required: true,
	default: '',
	description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	typeOptions: {
		loadOptionsMethod: 'getDeploymentKeys',
	},
	options: [],
};

export const messagesProperty: INodeProperties = {
	displayName: 'Messages',
	name: 'messages',
	type: 'fixedCollection',
	default: {},
	typeOptions: {
		multipleValues: true,
	},
	options: [
		{
			displayName: 'Message Property',
			name: 'messageProperty',
			// eslint-disable-next-line n8n-nodes-base/node-param-fixed-collection-type-unsorted-items
			values: [
				{
					displayName: 'Role',
					name: 'role',
					type: 'options',
					default: 'user',
					description: 'The role of the messages author',
					required: true,
					options: [
						{ name: 'Assistant', value: 'assistant' },
						{ name: 'System', value: 'system' },
						{ name: 'User', value: 'user' },
					]
				},
				// Audio Data field commented out
				// {
				// 	displayName: 'Audio Data',
				// 	name: 'audioData',
				// 	type: 'string',
				// 	default: '',
				// 	description: 'Base64 encoded audio data',
				// 	required: true,
				// 	displayOptions: {
				// 		show: {
				// 			role: ['user'],
				// 			contentType: ['input_audio'],
				// 		},
				// 	},
				// },
				// Audio Format field commented out
				// {
				// 	displayName: 'Audio Format',
				// 	name: 'audioFormat',
				// 	type: 'options',
				// 	default: 'wav',
				// 	required: true,
				// 	options: [
				// 		{ name: 'WAV', value: 'wav' },
				// 		{ name: 'MP3', value: 'mp3' },
				// 	],
				// 	displayOptions: {
				// 		show: {
				// 			role: ['user'],
				// 			contentType: ['input_audio'],
				// 		},
				// 	},
				// },
				{
					displayName: 'Content Type',
					name: 'contentType',
					type: 'options',
					default: 'text',
					description: 'Type of content to send',
					options: [
						{ name: 'Text', value: 'text' },
						{ name: 'Image', value: 'image' },
						// Audio and File support commented out for now
						// { name: 'Audio', value: 'input_audio' },
						// { name: 'File', value: 'file' },
					],
					displayOptions: {
						show: {
							role: ['user'],
						},
					},
				},
				// File Data field commented out
				// {
				// 	displayName: 'File Data',
				// 	name: 'fileData',
				// 	type: 'string',
				// 	default: '',
				// 	description: 'Base64 encoded file data',
				// 	placeholder: 'Enter base64 encoded file data...',
				// 	required: true,
				// 	typeOptions: {
				// 		rows: 4,
				// 	},
				// 	displayOptions: {
				// 		show: {
				// 			role: ['user'],
				// 			contentType: ['file'],
				// 		},
				// 	},
				// },
				// File Name field commented out
				// {
				// 	displayName: 'File Name',
				// 	name: 'fileName',
				// 	type: 'string',
				// 	default: '',
				// 	description: 'Name of the file including extension',
				// 	placeholder: 'document.pdf',
				// 	required: true,
				// 	displayOptions: {
				// 		show: {
				// 			role: ['user'],
				// 			contentType: ['file'],
				// 		},
				// 	},
				// },
				{
					displayName: 'Image Source',
					name: 'imageSource',
					type: 'options',
					default: 'url',
					description: 'How to provide the image',
					options: [
						{ name: 'Image URL', value: 'url' },
						{ name: 'Base64 Data URI', value: 'base64' },
					],
					displayOptions: {
						show: {
							role: ['user'],
							contentType: ['image'],
						},
					},
				},
				{
					displayName: 'Image URL',
					name: 'imageUrl',
					type: 'string',
					default: '',
					description: 'URL of the image',
					placeholder: 'https://example.com/image.png',
					required: true,
					displayOptions: {
						show: {
							role: ['user'],
							contentType: ['image'],
							imageSource: ['url'],
						},
					},
				},
				{
					displayName: 'Base64 Data URI',
					name: 'imageData',
					type: 'string',
					default: '',
					description: 'Base64 encoded image data',
					placeholder: 'data:image/png;base64,iVBORw0...',
					required: true,
					typeOptions: {
						rows: 4,
					},
					displayOptions: {
						show: {
							role: ['user'],
							contentType: ['image'],
							imageSource: ['base64'],
						},
					},
				},
				{
					displayName: 'Message',
					name: 'message',
					type: 'string',
					default: '',
					description: 'The text message to send',
					placeholder: 'Enter your message...',
					required: true,
					typeOptions: {
						rows: 3,
					},
					displayOptions: {
						show: {
							role: ['system', 'assistant'],
						},
					},
				},
				{
					displayName: 'Message (Optional)',
					name: 'message',
					type: 'string',
					default: '',
					description: 'Optional text to accompany the image',
					placeholder: 'Describe what you want to do with this image...',
					typeOptions: {
						rows: 2,
					},
					displayOptions: {
						show: {
							role: ['user'],
							contentType: ['image'],
						},
					},
					hint: 'Some models require text with images while others work with images alone. Check your model documentation.',
				},
				{
					displayName: 'Message',
					name: 'message',
					type: 'string',
					default: '',
					description: 'The text message to send',
					placeholder: 'Enter your message...',
					typeOptions: {
						rows: 3,
					},
					displayOptions: {
						show: {
							role: ['user'],
							contentType: ['text'],
						},
					},
				}
			]
		}
	]
};

export const contextProperty: INodeProperties = {
	displayName: 'Context',
	name: 'context',
	type: 'fixedCollection',
	description: 'Context key-value pairs. <a href="https://docs.orq.ai/docs/deployment-routing" target="_blank">Learn more about deployment routing</a>.',
	default: {},
	typeOptions: {
		multipleValues: true,
	},
	options: [
		{
			displayName: 'Context Property',
			name: 'contextProperty',
			values: [
				{
					displayName: 'Key',
					name: 'key',
					type: 'string',
					description: 'Context key',
					default: '',
					placeholder: 'e.g. environment',
				},
				{
					displayName: 'Value',
					name: 'value',
					type: 'string',
					description: 'Context value',
					default: '',
					placeholder: 'e.g. production',
				}
			]
		}
	]
};

export const inputsProperty: INodeProperties = {
	displayName: 'Inputs',
	name: 'inputs',
	type: 'fixedCollection',
	description: 'Input key-value pairs. Add one for each variable found in the deployment messages.',
	default: {},
	typeOptions: {
		multipleValues: true,
		maxValue: 10,
	},
	options: [
		{
			displayName: 'Input Property',
			name: 'inputProperty',
			values: [
				{
					displayName: 'Key',
					name: 'key',
					type: 'string',
					description: 'Input key',
					default: '',
					placeholder: 'key...',
				},
				{
					displayName: 'Value',
					name: 'value',
					type: 'string',
					description: 'Input value',
					default: '',
					placeholder: 'value...',
					typeOptions: {
						rows: 1,
					},
				}
			]
		}
	]
};

export const allProperties: INodeProperties[] = [
	deploymentKeyProperty,
	contextProperty,
	inputsProperty,
	messagesProperty,
];
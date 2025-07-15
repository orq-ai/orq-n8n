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
	displayOptions: {
		show: {
			operation: ['deployment'],
		},
	},
};

export const messagesProperty: INodeProperties = {
	displayName: 'Messages',
	name: 'messages',
	type: 'fixedCollection',
	default: {},
	typeOptions: {
		multipleValues: true,
	},
	displayOptions: {
		show: {
			operation: ['deployment'],
		},
	},
	options: [
		{
			displayName: 'Message Property',
			name: 'messageProperty',
			values: [
				{
					displayName: 'Role',
					name: 'role',
					type: 'options',
					default: 'user',
					description: 'The role of the messages author',
					required: true,
					options: [
						{
							name: 'User',
							value: 'user',
						},
						{
							name: 'System',
							value: 'system',
						},
						{
							name: 'Assistant',
							value: 'assistant',
						},
					]
				},
				{
					displayName: 'Message',
					name: 'message',
					type: 'string',
					required: true,
					default: '',
					description: 'The message to send to the deployment',
					placeholder: 'Enter your message...',
					typeOptions: {
						rows: 3,
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
	description: 'Context key-value pairs',
	default: {},
	typeOptions: {
		multipleValues: true,
	},
	displayOptions: {
		show: {
			operation: ['deployment'],
		},
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
					placeholder: 'key...',
					typeOptions: {
						rows: 1,
					},
				},
				{
					displayName: 'Value',
					name: 'value',
					type: 'string',
					description: 'Context value',
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

export const inputsProperty: INodeProperties = {
	displayName: 'Inputs',
	name: 'inputs',
	type: 'fixedCollection',
	description: 'Input key-value pairs',
	default: {},
	typeOptions: {
		multipleValues: true,
	},
	displayOptions: {
		show: {
			operation: ['deployment'],
		},
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
					typeOptions: {
						rows: 1,
					},
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

export const operationProperty: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	required: true,
	default: 'deployment',
	noDataExpression: true,
	options: [
		{
			name: 'Deployment Invoke',
			value: 'deployment',
			action: 'Invoke an orq deployment',
		},
	],
};

export const allProperties: INodeProperties[] = [
	operationProperty,
	deploymentKeyProperty,
	messagesProperty,
	inputsProperty,
	contextProperty,
];
# n8n-nodes-orq

This is an n8n community node that lets you use Orq.ai deployments in your n8n workflows.

[Orq.ai](https://orq.ai) is a platform for building and deploying AI applications with advanced prompt management and deployment capabilities.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### npm

```bash
npm install n8n-nodes-orq
```

## Configuration

1. Get your API key from [Orq.ai](https://orq.ai)
2. In n8n, add credentials for Orq API:
   - Go to Credentials > New
   - Select "Orq API"
   - Enter your API key
   - (Optional) Change the base URL if using a custom deployment

## Operations

### Deployment Invoke
Invoke an Orq deployment with messages and inputs.

#### Parameters:
- **Response Format**: Choose how to format the response
  - Full Response: Complete API response
  - Messages Only: Just the conversation messages
  - Last Message Only: Only the assistant's response
  
- **Deployment Key**: Select from your available deployments

- **Messages**: Add conversation messages
  - Role: user, system, or assistant
  - Message: The message content

- **Inputs**: Provide values for variables in your deployment
  - Automatically detects {{variables}} from your deployment configuration

## Usage Example

1. Create a deployment in Orq.ai with a prompt like:
   ```
   You are a helpful assistant. The user's name is {{userName}}.
   ```

2. In n8n:
   - Add the Orq Deployment node
   - Select your deployment
   - Add a user message
   - Set the input value for `userName`
   - Execute to get AI responses

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Orq.ai Documentation](https://docs.orq.ai)
* [GitHub Repository](https://github.com/orq-ai/orq-n8n)
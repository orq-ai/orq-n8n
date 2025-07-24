# n8n-nodes-orq

This is an n8n community node that lets you use Orq.ai deployments in your n8n workflows.

[Orq.ai](https://orq.ai) is a unified platform for building and deploying AI applications with advanced prompt management, model routing, and deployment capabilities.

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

## Features

### Deployment Invoke
Invoke an Orq deployment with messages, context, and inputs.

#### Parameters:

- **Deployment Key**: Select from your available deployments

- **Context**: Set key-value pairs for deployment routing
  - Use for environment-based routing (e.g., `environment: production`)
  - [Learn more about deployment routing](https://docs.orq.ai/docs/deployment-routing)

- **Inputs**: Provide values for prompt variables
  - Add key-value pairs for each `{{variable}}` in your deployment

- **Messages**: Add conversation messages with support for:
  - **Roles**: User, System, or Assistant
  - **Content Types** (User role only):
    - Text: Plain text messages
    - Image: URLs or Base64-encoded images
  - **Optional text**: Add descriptions with images for models that support it

## Usage Examples

### Basic Text Conversation

1. Create a deployment in Orq.ai:
   ```
   You are a helpful assistant specialized in {{specialty}}.
   ```

2. In n8n:
   - Add the Orq Deployment node
   - Select your deployment
   - Add an input: `specialty: "data analysis"`
   - Add a user message: "How do I analyze sales data?"
   - Execute to get AI response

### Image Analysis

1. Configure for vision models:
   - Add a user message
   - Set Content Type to "Image"
   - Choose Image URL or Base64 Data URI
   - Optionally add text description
   - Execute to analyze the image

### Environment-based Routing

1. Use context for deployment routing:
   - Add context: `environment: "production"`
   - Add context: `model_type: "fast"`
   - Orq will route to the appropriate model based on your configuration

## Supported Models

Works with any model configured in your Orq deployment, including:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- And many more

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Orq.ai Documentation](https://docs.orq.ai)
* [Orq.ai Deployment Routing](https://docs.orq.ai/docs/deployment-routing)
* [GitHub Repository](https://github.com/orq-ai/orq-n8n)

## License

[MIT](https://github.com/orq-ai/orq-n8n/blob/main/LICENSE.md)
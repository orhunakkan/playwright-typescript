# Playwright Typescript Framework

## Environment Configuration

This framework supports multiple environments through dotenv configuration.

### Available Environments

- **QA**: Default environment (https://practice.cydeo.com)
- **Staging**: Staging environment (https://staging.practice.cydeo.com)
- **Production**: Production environment (https://prod.practice.cydeo.com)

### Setting Up Environment Variables

1. Create a `.env` file in the root directory (see `.env.example` for required variables)
2. Set the `ENVIRONMENT` variable to one of: `qa`, `staging`, or `prod`

### Running Tests Against Different Environments

```bash
# Run tests against QA environment (default)
npm run test:qa

# Run tests against Staging environment
npm run test:staging

# Run tests against Production environment
npm run test:prod
```

### Custom Environment Variables

You can access any environment variable in your tests or utilities using:

```typescript
import { EnvConfig } from '../utilities/env-config';

const myVariable = EnvConfig.get('MY_CUSTOM_VARIABLE', 'default value');
```
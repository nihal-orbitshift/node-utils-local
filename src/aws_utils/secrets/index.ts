import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager';
import {IContext} from "../../context/index.js";

export const getSecretValue = async ({ context, secretName }: { context: IContext, secretName: string }) => {
  if (!secretName) {
    throw new Error('No secretName provided');
  }
  const client = new SecretsManagerClient();
  try {
    const response = await client.send(
        new GetSecretValueCommand({
          SecretId: secretName
        })
    );

    if (response.SecretString) {
      const secret: any = JSON.parse(response.SecretString);
      return secret;
    }
    return {};
  } catch (error) {
    context.logger.error(
        `Failed to fetch AWS Secrets for: ${secretName} with error: ${error}`
    );
    throw error;
  }
};

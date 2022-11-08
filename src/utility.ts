import axios from 'axios';
import * as dotenv from 'dotenv';

export interface OAuth {
  code: string;
  clientId: string;
  secretId: string;
  redirectUri?: string;
}

export function throwExpression(errorMessage: string): never {
  throw new Error(errorMessage);
}

export function setup() {
  dotenv.config();
}

export const getOauthAccessToken = async (param: OAuth, tokenUri: string) => {
  console.log(param);

  const response = await axios.post(tokenUri,
    {
      code: param.code,
      client_id: param.clientId,
      client_secret: param.secretId,
    },
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return response;
};
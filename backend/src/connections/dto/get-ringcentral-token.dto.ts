export class GetRingcentralTokenDto {
  grant_type?: string;
  code: string;
  redirect_uri?: string;
  access_token_ttl?: string;
  refresh_token_ttl?: string;
  code_verifier?: string;
}

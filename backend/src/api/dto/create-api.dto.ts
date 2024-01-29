export class CreateAPIDto {
  username: string;
  password: string;
  createdAt: string | Date;
  token?: string;
  expiresAt?: string | Date;
  type?: 'lifetime' | 'temp';
}

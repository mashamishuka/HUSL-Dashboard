export class CreateUserDto {
  websiteKey?: string;
  name: string;
  email?: string;
  company?: string;
  profilePicture?: string;
  nftId?: string;
  team?: string;
  foundersCard?: string;
  wallet?: string;
  password: string;
  productUrl?: string;
  business?: string[];
  permissions?: string[];
  role?: 'admin' | 'user' | 'member';
}

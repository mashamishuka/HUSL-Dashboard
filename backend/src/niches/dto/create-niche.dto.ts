export class CreateNicheDto {
  name: string;
  tagCopy: {
    key: string;
    value: string;
  }[];
  products: string[];
  productMockups?: {
    productId: string;
    mockups?: string[];
  }[];
  createdBy: string;
}

export interface CompanyResponseV2 {
  id: string;
  companyName: string;
  companyAddress: string;
  companyDescription: string;
  createdInfo: {
    by: string;
    at: Date;
  };
  updatedInfo: {
    by: string;
    at: Date;
  };
}

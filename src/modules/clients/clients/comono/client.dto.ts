export interface ComonoAddressRequest {
  accountCategory: 'individual' | 'corporate';
  customerName: string;
  popularName: string;
  phoneNumber?: string;
  customerImage?: string;
  address: string;
  nearestBusstop?: string;
  majorlandmark: string;
  additionalInfo?: string;
  state: string;
  lga: string;
}

export interface ComonoAddressRequestResponse {
  status: 'Ok' | 'Pending';
  requestId: string;
  message: string;
}

export interface ComonoAddressRequestData {
  status: string;
  requestId: string;
  requestStatus: string;
  requestDetails: any;
  verificationDetails: {
    dateCompleted: string;
    addressExists: boolean;
    customerKnown: boolean;
    customerResides: boolean;
  };
}

export interface StateObject {
  stateCode: string;
  stateName: string;
}

export interface LgaObject {
  stateCode: string;
  lgaCode: string;
  lgaName: string;
}

export interface ComonoDigitalAddressData {
  workitemId: string;
  verificationStatus: 'PASS' | 'POSITIVE' | 'NEGATIVE';
  verificationDetails: any;
  requestDetails: any;
}

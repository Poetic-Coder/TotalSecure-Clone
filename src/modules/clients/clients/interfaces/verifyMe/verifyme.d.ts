

export type VerificationStatus = "EXACT_MATCH" | "NO_MATCH" | "PARTIAL_MATCH" | "TRANSPOSED_MATCH";

export interface OAuthResponse {
    accessToken: string;
    expiresIn: number;
}

export interface IdResponse {
    id: number;
    status: {
        state: string;
        status: string;
    };
}

export interface DriverLicenceResponse extends IdResponse {
    summary: {
        driver_license_check: {
            status: VerificationStatus;
        }
    };
    drivers_license: {
        issued_date: string;
        expiry_date: string;
        birth_date: string;
    };
}

export interface VotersCardResponse extends IdResponse {
    summary: {
        voters_card_check: {
            status: VerificationStatus;
        }
    };
}

export interface VNinResponse extends IdResponse {
    summary: {
        v_nin_check: {
            status: VerificationStatus;
        }
    };
}

export interface BvnResponse extends IdResponse {
    summary: {
        bvn_match_check: {
            status: VerificationStatus;
        }
    };
}

export interface NationalPassportResponse extends IdResponse {
    summary: {
        passport_check: {
            status: VerificationStatus;
        }
    };
    passport: {
        expiryDate: string;
    };
}

export interface PhysicalAddressResponse {
    id: number;
    customerReference: string;
    status: {
        status: string;
        subStatus: string;
        state: string;
    }
}

export interface FaceMatchResponse {
    status: {
        status: string;
        state: string;
    }
}

export interface CacResponse extends IdResponse {
  summary: {
    cac_check: string;
  };
  cac: {
    rcNumber: string;
    companyName: string;
    companyType: string;
    registrationDate: string;
    branchAddress: string;
    companyEmail: string;
    city: string;
    headOfficeAddress: string;
    lga: string;
    affiliates: string;
    state: string;
    status: string;
  }
}
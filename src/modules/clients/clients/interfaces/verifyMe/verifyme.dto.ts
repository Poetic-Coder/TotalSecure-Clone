
export interface PhysicalAddress {
    userId: string;
    street: string;
    lga: string;
    state: string;
    city: string;
    landmark: string;
    firstName: string;
    lastName: string;
    phone: string;
}

export interface DriverLicence {
    idNumber: string;
    firstName: string;
    lastName: string;
    phone?: string;
}

export interface VotersCard extends DriverLicence {
    dob: string;  // Date of birth in the format YYYY-MM-DD
}

export interface NationalPassport extends DriverLicence {
    dob?: string;  // Date of birth in the format YYYY-MM-DD
    phone: string
}

export type VNin = DriverLicence
export type BvnDto = DriverLicence


export interface FaceMatchDto {
    idType: "bvn" | "nin" | "drivers-license";
    idNumber: string;
    photoUrl: string;
}


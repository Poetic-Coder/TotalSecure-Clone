import { BadRequestException } from '@nestjs/common';
import { APP_ENV } from '@common/interfaces';
import { IdKycMapType } from '@api/kyc/interfaces/kyc';
import { VerifyMeClient } from '@modules/clients/clients/verifyMe/verifyMe';
import { YouVerifyService } from '@modules/clients/clients/youVerify/youVerify';
import { CountryCode } from '@modules/clients/clients/interfaces/youVerify/youVerify.dto';
import { AgentWithProfile } from '@api/user/repositories/agent.repository';


interface VerificationData {
  idNumber: string;
  firstName: string;
  lastName: string;
  dob?: Date;
  phone: string;
  selfie?: string;
}

export const verifyIdentification = async (
  NODE_ENV: APP_ENV,
  KYC_PROVIDER: string,
  idType: string,
  verifyMeClient: VerifyMeClient,
  youVerify: YouVerifyService,
  dataV: VerificationData
) => {

  const youVerifyMapToFns: IdKycMapType = {
    DRIVERS_LICENSE: () => {
      if (NODE_ENV === 'development') {
        dataV.firstName = 'John';
        dataV.lastName = 'Doe';
        dataV.idNumber = 'AAA00000AA00';
        dataV.selfie = "https://cdn.youverify.co/1655466566309-lLSfNTlhElMTtbXW-QE-q.jpg";
      }
      return youVerify.verifyDriverLicense(dataV);
    },
    INTERNATIONAL_PASSPORT: () => {
      if (NODE_ENV === 'development') {
        dataV.firstName = 'Sarah';
        dataV.lastName = 'Doe';
        dataV.idNumber = 'A11111111';
        dataV.selfie = "https://cdn.youverify.co/1655466566309-lLSfNTlhElMTtbXW-QE-q.jpg";
      }
      return youVerify.verifyIntPassport(dataV);
    },
    VOTERS_CARD: () => {
      if (!dataV.dob) {
        throw new BadRequestException("Date of birth is required for voter's card verification");
      }
      if (NODE_ENV === 'development') {
        dataV.firstName = 'John';
        dataV.lastName = 'Doe';
        dataV.idNumber = '00A0A0A000000000000';
        dataV.dob = new Date('1988-04-04');
        dataV.selfie = "https://cdn.youverify.co/1655466566309-lLSfNTlhElMTtbXW-QE-q.jpg";
      }
      return youVerify.verifyVotersCard({
        ...dataV,
        dob: dataV.dob.toISOString().substring(0, 10)
      });
    },
     NATIONAL_ID: () => {
      if (NODE_ENV === 'development') {
        dataV.firstName = 'Sarah';
        dataV.lastName = 'Doe';
        dataV.idNumber = '11111111111';
        dataV.selfie = "https://cdn.youverify.co/1655466566309-lLSfNTlhElMTtbXW-QE-q.jpg";
      }
      return youVerify.verifyNIN(dataV);
    },
  };

  const verifyMeMapToFns: IdKycMapType = {
    DRIVERS_LICENSE: () => {
      if (NODE_ENV === 'development') {
        dataV.firstName = 'Dillon';
        dataV.lastName = 'Bunch';
        dataV.idNumber = '63184876213';
      }
      return verifyMeClient.verifyDriverLicense(dataV);
    },
    INTERNATIONAL_PASSPORT: () => {
      if (NODE_ENV === 'development') {
        dataV.firstName = 'John';
        dataV.lastName = 'Doe';
        dataV.idNumber = 'A10000001';
      }
      return verifyMeClient.verifyPassport({
        idNumber: dataV.idNumber,
        firstName: dataV.firstName,
        lastName: dataV.lastName,
        phone: dataV.phone,
      });
    },
    VOTERS_CARD: () => {
      if (!dataV.dob) {
        throw new BadRequestException("Date of birth is required for voter's card verification");
      }
      if (NODE_ENV === 'development') {
        dataV.firstName = 'DOE';
        dataV.lastName = 'JOHN';
        dataV.idNumber = '90F5DB8799296145513';
        dataV.dob = new Date('2022-04-22');
      }
      return verifyMeClient.verifyVoterCard({
        idNumber: dataV.idNumber,
        firstName: dataV.firstName,
        lastName: dataV.lastName,
        dob: dataV.dob.toISOString().substring(0, 10),
        phone: dataV.phone,
      });
    },
    NATIONAL_ID: () => {
      if (NODE_ENV === 'development') {
        dataV.firstName = 'Bunch';
        dataV.lastName = 'Dillon';
        dataV.idNumber = '63184876213';
      }
      return verifyMeClient.verifyNin(dataV);
    },
  };
    const verificationService = KYC_PROVIDER === 'VERIFYME' ? verifyMeMapToFns : youVerifyMapToFns;
  return await verificationService[idType]();
};

export const verifyCacRegistration = async (
  NODE_ENV: APP_ENV,
  KYC_PROVIDER: string,
  regNumber: string,
  youVerifyService: YouVerifyService,
  verifyMeClient: VerifyMeClient,
) => {
  const youVerifyMap = {
    CAC: () => {
      if (NODE_ENV === 'development') {
        return {
          verified: true,
          data: {
            name: 'Tech Innovations Ltd.',
            headOfficeAddress: '5 Admiralty Road, Lekki Phase 1',
            state: 'Lagos',
            city: 'Lagos',
            lga: 'Eti-Osa',
            keyPersonnel: ['John Doe', 'Jane Smith'],
          },
        };
      }
      return youVerifyService.KYBCheck({
        registrationNumber: regNumber,
        countryCode : CountryCode.NG
      });
    },
  };

  const verifyMeMap = {
    CAC: () => {
      if (NODE_ENV === 'development') {
        return {
          verified: true,
          data: {
            name: 'Alpha Systems Nigeria',
            headOfficeAddress: '12 Bourdillon Avenue, Ikoyi',
            state: 'Lagos',
          },
        };
      }
      return verifyMeClient.verifyCac(regNumber);
    },
  };

  const serviceMap = KYC_PROVIDER === 'VERIFYME' ? verifyMeMap : youVerifyMap;
  return await serviceMap['CAC']();
};


export const BvnVerification = async (
  NODE_ENV: APP_ENV,
  KYC_PROVIDER: string,
  bvn: string,
  user: AgentWithProfile,
  youVerifyService: YouVerifyService,
  verifyMeClient: VerifyMeClient,
) => {
  const youVerifyMap = {
    BVN: async () => {
      if (NODE_ENV === 'development') {
        return {
          verified: true,
          data: {
            idNumber: '11111111111',
            firstName: 'John',
            lastName: 'Doe',
          },
        };
      }
      return youVerifyService.verifyBvnRegistration(bvn);
    },
  };

  const verifyMeMap = {
    BVN: async () => {
      if (NODE_ENV === 'development') {
        return {
          verified: true,
          data: {
            idNumber: '95888168924',
            firstName: 'Bunch',
            lastName: 'Dillon',
          },
        };
      }
      return verifyMeClient.verifyBvn({
        idNumber: bvn,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        phone: user.phone,
      });
    },
  };

  const serviceMap = {
    YOUVERIFY: youVerifyMap,
    VERIFYME: verifyMeMap,
  };

  const provider = serviceMap[KYC_PROVIDER];
  if (!provider?.BVN) {
    throw new BadRequestException(`Unsupported KYC provider: ${KYC_PROVIDER}`);
  }

  return await provider.BVN();
};


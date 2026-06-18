import { IdentificationCardType } from "@prisma/client";

export type IdKycMapType = {
  [key in IdentificationCardType]: () => Promise<{ verified: boolean, data: any }>;
}
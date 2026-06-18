import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { AnyUser } from '@common/interfaces';
import { AccountType } from '@common/enums';


export interface ValidatedApiKey {
    user: AnyUser;
    accountType: AccountType;
}

@Injectable()
export class ApiKeyService {
    constructor(private readonly prisma: PrismaService) {}

    async validateKey(key: string): Promise<ValidatedApiKey | null> {
        const apiKey = await this.prisma.apiKey.findUnique({
            where: { key },
            include: {
                staff: true,
                agent: true,
                customer: true,
            },
        });

        if (!apiKey || !apiKey.active) {
            return null;
        }

        if (apiKey.staff) {
            return { user: apiKey.staff, accountType: AccountType.STAFF };
        }
        if (apiKey.agent) {
            return { user: apiKey.agent, accountType: AccountType.AGENT };
        }
        if (apiKey.customer) {
            return { user: apiKey.customer, accountType: AccountType.CUSTOMER };
        }
        
        return null;
    }
}
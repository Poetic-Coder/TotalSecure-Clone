import { Inject, Injectable, BadRequestException, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { OTP_EXPIRY } from '@common/constants';
import {  FlightOfferSearchRequestDto, FlightOffersPriceDto, FlightOrderDto, } from '../interfaces/amadeus/amadeus.dto';

@Injectable()
export class AmadeusClient {
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache;
    private readonly logger = new Logger(AmadeusClient.name);

    private tokenKey:string;
    private baseUrl: string;

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get('AMADEUS_BASE_URL');
        this.tokenKey = this.configService.get('AMADEUS_TOKEN_KEY')
    }

    async getToken() {
        this.logger.debug('Getting Amadeus token...');
        const token = await this.cacheManager.get<string>(this.tokenKey);

        if (token) {
            this.logger.debug('Using cached token');
            return token;
        }

        this.logger.debug('No cached token, requesting new one...');
        const { access_token } = await this.requestNewToken();
        await this.setToken(access_token); //amadaeus test access token lasts for 30mins
        return access_token;
    }

    async setToken(token: string) {
        return this.cacheManager.set(this.tokenKey, token, OTP_EXPIRY);
    }

    async requestNewToken() {
        const client_id = this.configService.get('AMADEUS_CLIENT_ID');
        const client_secret = this.configService.get('AMADEUS_CLIENT_SECRET');

        if (!client_id) {
            this.logger.error('Client ID is missing!');
            throw new BadRequestException('AMADEUS_CLIENT_ID is not configured');
        }

        if (!client_secret) {
            this.logger.error('Client Secret is missing!');
            throw new BadRequestException('AMADEUS_CLIENT_SECRET is not configured');
        }

        const response = await axios.post(
            `${this.baseUrl}/v1/security/oauth2/token`,
            new URLSearchParams({
                grant_type: 'client_credentials',
                client_id,
                client_secret,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        if (response.status === 200) {
            return response.data;
        }
        return {
            access_token: response.data?.access_token,
        };
    }

    async getLocationByKeyword(keyword: string) {
        const token = await this.getToken();

        try {
            const response = await axios.get(
                `${this.baseUrl}/v1/reference-data/locations`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        keyword,
                        subType: 'AIRPORT,CITY',
                    },
                }
            );

            return response.data.data;
        } catch (error) {
            this.logger.error(`Error fetching location by keyword: ${error.message}`);
            throw new BadRequestException(
                error.response?.data || 'Failed to fetch location'
            );
        }
    }

    async getLocationById(locationId: string) {
        if (!locationId) {
            throw new BadRequestException('Location ID is required');
        }

        const token = await this.getToken();

        try {
            const response = await axios.get(
                `${this.baseUrl}/v1/reference-data/locations/${locationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("*****this is the response for airport by iD ********", response.data)

            return response.data;
        } catch (error) {
            this.logger.error(
                `Error fetching location by ID ${locationId}: ${error.message}`
            );

            throw new BadRequestException(
                error.response?.data || 'Failed to fetch location by ID',
            );
        }
    }

    /**
     * The Amadeus Airport Routes API helps you find all destinations served by a given airport. Provide the IATA code of a departure airport and the API will retrieve a list of all nonstop destination cities along with their names and IATA codes.
     * @param departureAirportCode 
     * @param arrivalCountryCode?
     * @param max? 
     * @returns 
     */
    async getDirectDestinations(
        departureAirportCode: string,
        arrivalCountryCode?: string,
        max?: number,
    ) {
        if (!departureAirportCode) {
            throw new BadRequestException('departureAirportCode is required');
        }

        const token = await this.getToken();

        try {
            const response = await axios.get(
                `${this.baseUrl}/v1/airport/direct-destinations`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        departureAirportCode,
                        arrivalCountryCode,
                        max,
                    },
                }
            );
            this.logger.debug('Received direct-destination response from Amadeus');
            return response.data.data;

        } catch (error) {
            this.logger.error(
                `Error fetching direct destinations: ${error.message}`
            );

            throw new BadRequestException(
                error.response?.data || 'Failed to fetch direct destinations'
            );
        }
    }

    /**
     * Search flight offers using GET method
     * @param queryString - URL query parameters as string
     * Example: "originLocationCode=SYD&destinationLocationCode=BKK&departureDate=2025-12-20&adults=2&max=5"
     */
    async searchFlightOffersGET(queryString: string) {
        const token = await this.getToken();

        try {
        const response = await axios.get(
            `${this.baseUrl}/v2/shopping/flight-offers?${queryString}`,
            {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            }
        );

        this.logger.debug('Flight offers fetched from Amadeus (GET method)');
        return response.data;
        } catch (error) {
        this.logger.error(`Error fetching flight offers: ${error.message}`);
        throw new BadRequestException(
            error.response?.data || 'Failed to fetch flight offers'
        );
        }
    }

    /**
     * 
     * this endpoints only get all the list of destinations served by the saudia airline
     */

    async getAirlineDestinations(
        max?: number,
        arrivalCountryCode?: string,
    ) {
        const airlineCode = 'SV';

        const token = await this.getToken();

        console.log("this is the token =====>>", token)

        try {
            const response = await axios.get(
                `${this.baseUrl}/v1/airline/destinations`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/vnd.amadeus+json',
                    },
                    params: {
                        airlineCode,
                        max,
                        arrivalCountryCode,
                    },
                },
            );

            this.logger.debug(
                `Received destinations for airline ${airlineCode} from Amadeus`,
            );

            return response.data.data;
        } catch (error) {
            this.logger.error(
                `Error fetching destinations for airline ${airlineCode}: ${error.message}`,
            );

            throw new BadRequestException(
                error.response?.data || 'Failed to fetch airline destinations',
            );
        }
    } 

    /**
     * This API forms the first step in the flight booking flow. Once a flight is chosen, confirm the real-time price using Flight Offers Price and book the flight with Flight Create Orders.
     */
    async searchFlightOffers(body: FlightOfferSearchRequestDto) {
        const token = await this.getToken();

        console.log("body =======>", body)
        try {
            const response = await axios.post(
                `${this.baseUrl}/v2/shopping/flight-offers`,
                body,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/vnd.amadeus+json',
                    },
                },
            );

            this.logger.debug('Flight offers fetched from Amadeus');
            return response.data;
        } catch (error) {
            this.logger.error(`Error fetching flight offers: ${error.message}`);
            throw new BadRequestException(error.response?.data || 'Failed to fetch flight offers');
        }
    }

    /**
     * https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-price
     * This Flight Price API forms the second step in the flight booking flow. It is used to confirm the price of flights returned by Flight Offers Search before booking with Flight Create Orders.
     * the DTo contains essential information from the flight search api
     */
    async confirmFlightPriceOffer(body: FlightOffersPriceDto) {
        const token = await this.getToken();

        try {
            const response = await axios.post(
                `${this.baseUrl}/v1/shopping/flight-offers/pricing`,
                body,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/vnd.amadeus+json',
                    },
                },
            );

            this.logger.debug('Flight price confirmation from Amadeus');
            return response.data;
        } catch (error) {
            this.logger.error(`Error fetching flight offers: ${error.message}`);
            throw new BadRequestException(error.response?.data || 'Failed to fetch flight offers');
        }
    }

    /**
     * https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-price
     * The Flight Create Orders API performs the final booking for a chosen flight. The API provides a unique booking ID and reservation details once the reservation is completed. This API is the final step in the flight booking flow. Use it after completing a flight search with Flight Offers Search and confirming real-time price and availability with Flight Offers Price.
     */
    async createFlightOrders(body: FlightOrderDto) {
        const token = await this.getToken();

        try {
            const response = await axios.post(
                `${this.baseUrl}/v1/booking/flight-orders`,
                body,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/vnd.amadeus+json',
                    },
                },
            );

            this.logger.debug('Flight booking from Amadeus');
            return response.data;
        } catch (error) {
            this.logger.error(`Error fetching flight order: ${error.message}`);
            throw new BadRequestException(error.response?.data || 'Failed to fetch flight offers');
        }
    }

    /**
     * The Flight Order Management API makes it easy to consult and manage flight reservations
     * Using the booking ID provided by the Flight Create Orders API, Flight Order Management checks the latest status of a reservation, shows post-booking modifications like ticket information or form of payment and lets you cancel reservations. 
     */

    async getFlightOrder(flightOrderId: string) {
        const token = await this.getToken();

        try {
            const response = await axios.get(
                `${this.baseUrl}/v1/booking/flight-orders/${flightOrderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/vnd.amadeus+json',
                    },
                },
            );

            this.logger.debug('Flight booking from Amadeus');
            return response.data;
        } catch (error) {
            this.logger.error(`Error fetching flight order: ${error.message}`);
            throw new BadRequestException(error.response?.data || 'Failed to fetch flight offers');
        }
    }

    async cancelFlightOrder(flightOrderId: string) {
        const token = await this.getToken();

        try {
            const response = await axios.delete(
                `${this.baseUrl}/v1/booking/flight-orders/${flightOrderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/vnd.amadeus+json',
                    },
                },
            );

            this.logger.debug('cancel flight booking order booking from Amadeus');
            return response.data;
        } catch (error) {
            this.logger.error(`Error fetching flight order: ${error.message}`);
            throw new BadRequestException(error.response?.data || 'Failed to fetch flight offers');
        }
    }

    /**
     * SeatMap Display API allows you to get information to display airplane cabin plan from a Flight Offer in order for the traveler to be able to choose his seat during the flight booking flow 
     */

    async getSeatMap(flightOrderId: string) {
        const token = await this.getToken();

        try {
            const response = await axios.get(
                `${this.baseUrl}/v1/shopping/seatmaps?flight-orderId=${flightOrderId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/vnd.amadeus+json',
                    },
                },
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Error fetching flight order: ${error.message}`);
            throw new BadRequestException(error.response?.data || 'Failed to fetch flight offers');
        }
    }

}


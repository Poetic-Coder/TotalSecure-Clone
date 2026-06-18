export type OkHiAddressCollectedEvent = {
  event_type: string;
  event_id: string;
  api_version: string;
  event_timestamp: number;
  data: {
    usage_types: string[];
    user: {
      id: string;
      first_name: string;
      last_name: string;
      phone: string;
      email: string;
    };
    metadata: {
      org_id: string;
      app_id: string;
      branch_id: string;
      user_id: string;
      app_user_id: string;
    };
    location: {
      ward: string;
      formatted_address: string;
      post_code: string;
      street_name: string;
      property_number: string;
      neighborhood: string;
      district: string;
      lga: string;
      city: string;
      state: string;
      country: string;
      country_code: string;
      geo_point: {
        lat: number;
        lon: number;
      };
      user_id: string;
      directions: string;
      id: string;
      url: string;
      plus_code: string;
      address_line_1: string;
      usage_types: string[];
    };
  };
};

export type AddressVerificationCompletedEvent = {
  event_type: "address_verification.completed";
  event_id: string;
  api_version: "v3";
  event_timestamp: number;
  data: {
    address_verification: {
      id: string;
      status: "verified" | "not_at_address" | "unknown"
      status_description: string;
      verification_method: "digital" | "manual" | string;
      verification_provider: "OkHi" | string;
      mode: "continuous" | "one_time" | string;
      location_id: string;
    };
    metadata: {
      org_id: string;
      user_id: string;
      app_user_id: string;
      app_id: string;
      branch_id: string;
    };
  };
};

export type OkHiEvent = {
   event_type: string, data: any
}
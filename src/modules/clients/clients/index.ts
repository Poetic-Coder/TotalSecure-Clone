import { DynamicObject } from '@common/interfaces';
import { joinUrls } from '@common/utils/urls';
import { BadRequestException, Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import * as https from 'https';
import * as crypto from 'crypto';

export type RequestOption = {
  path?: string;
  headers?: DynamicObject;
  body?: DynamicObject;
  query?: DynamicObject;
  params?: DynamicObject;
  data?: string;
};

/**
 * BaseApiClient
 *
 * @description Base class for all api clients, provides basic methods for api calls
 *
 * @example
 *
 * class UserApiClient extends BaseApiClient {
 *  constructor(baseUrl: string, baseHeaders: DynamicObject) {
 *   super(baseUrl, baseHeaders);
 *  }
 *
 *  public async getUser(id: string) {
 *   return this.get<User>(`/users/${id}`, {
 *    params: {
 *     id: 12,
 *    },
 *    query: {
 *     name: 'John'
 *    }
 *   });
 *  }
 * }
 *
 * const userApiClient = new UserApiClient('http://localhost:3000', {
 *    x: 'y'
 * });
 *
 * const user = await userApiClient.getUser('12');
 *
 */
export class BaseApiClient {
  private _baseUrl: string;
  private _baseHeaders: DynamicObject;
  private readonly _logger = new Logger(BaseApiClient.name);
  private axios: AxiosInstance;

  constructor(baseUrl: string, baseHeaders: DynamicObject) {
    this.axios = axios.create({
      headers: baseHeaders,
      httpsAgent: new https.Agent({
        // allow legacy server
        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
      }),
    });
    this.setBaseUrl(baseUrl);
    this.setBaseHeaders({
      'Content-Type': 'application/json',
      ...baseHeaders,
    });
  }

  /**
   *
   * @returns Base url of the api client
   */
  public getBaseUrl() {
    return this._baseUrl;
  }

  /**
   *
   * @param baseUrl Base url of the api client
   *
   * @description Set base url of the api client
   *
   * @example
   *
   * const userApiClient = new UserApiClient('http://localhost:3000', {
   *   x: 'y'
   * });
   *
   * userApiClient.setBaseUrl('http://localhost:3001');
   *
   * const user = await userApiClient.getUser('12');
   */
  public setBaseUrl(baseUrl: string) {
    // Make sure the base url ends with a slash
    if (!baseUrl.endsWith('/')) {
      baseUrl = `${baseUrl}/`;
    }
    this._baseUrl = baseUrl;
  }

  /**
   *
   * @returns Base headers of the api client
   */
  public getBaseHeaders() {
    return this._baseHeaders;
  }

  /**
   *
   * @param baseHeaders Base headers of the api client
   *
   * @description Set base headers of the api client
   */
  public setBaseHeaders(baseHeaders: DynamicObject) {
    this._baseHeaders = baseHeaders;
  }

  /**
   *
   * @param path the endpoint of the api
   * @param context an object containing params or query
   * @returns the url of the api call
   */
  public buildUrl(
    path: string,
    context: Pick<RequestOption, 'params' | 'query'>,
  ) {
    let url = joinUrls(this.getBaseUrl(), path);

    if (context.params) {
      Object.keys(context.params).forEach((key) => {
        url = url.replace(`{${key}}`, context.params[key]);
      });
    }

    if (context.query) {
      const qUrl = new URL(url);
      Object.keys(context.query).forEach((key) => {
        qUrl.searchParams.append(key, context.query[key]);
      });
      url = qUrl.toString();
    }

    return url;
  }

  /**
   *
   * @param context an object containing headers
   * @returns the headers of the api call
   */
  public async buildHeaders(context: Pick<RequestOption, 'headers' | 'path'>) {
    return {
      ...this.getBaseHeaders(),
      ...context.headers,
    };
  }

  public async resolveResult<T>(response: AxiosResponse<T>) {
    return {
      result: response.data,
      status: response.status,
      success: response.status >= 200 && response.status < 300,
    };
  }

  public handleAxiosError(context: RequestOption, url: string) {
    return (error: AxiosError<any>) => {
      this._logger.error('Error on API call');
      this._logger.error('API Request URL', url);
      this._logger.error('API Request context', context);
      this._logger.error('API Error response', error);
      if (error.response) {
        return error.response;
      }
    };
  }

  public logInput(context: RequestOption, url: string, extra?: any) {
    this._logger.log(`API Request URL ${url}`);
    this._logger.log('API Request context');
    this._logger.log({context});
    this._logger.log('API Request additional');
    this._logger.log(extra)
  }

  public logResponse(response: AxiosResponse<any>) {
    this._logger.log(`API Response URL: ${response.config.url}`);
    this._logger.log(`API Response status: ${response.status}`);
    this._logger.log('API Response data');
    this._logger.log(response.data);
    this._logger.log(response.statusText);
  }

  public addPath(path: string, context: RequestOption) {
    context.path = path;
  }

  public async get<T>(path: string, context: RequestOption = {}) {
    this.addPath(path, context);

    const url = this.buildUrl(path, context);
    const headers = await this.buildHeaders(context);

    this.logInput(context, url, headers);

    const response = await this.axios
      .get(url, {
        headers: {
          ...headers,
        },
      })
      .then((data) => {
        return data;
      })
      .catch(this.handleAxiosError(context, url));

    if (!response) {
      throw new BadRequestException('API not responding correctly');
    }

    this.logResponse(response);
    return this.resolveResult<T>(response);
  }

  public async post<T>(path: string, context: RequestOption) {
    this.addPath(path, context);

    const url = this.buildUrl(path, context);
    const headers = await this.buildHeaders(context);

    this.logInput(context, url, headers);

    const response = await this.axios
      .post<T>(url, context.data ? context.data : context.body, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      })
      .then((data) => data)
      .catch(this.handleAxiosError(context, url));

    if (!response) {
      throw new BadRequestException('API not responding correctly');
    }

    this.logResponse(response);
    return this.resolveResult<T>(response);
  }

  public async put<T>(path: string, context: RequestOption) {
    this.addPath(path, context);
    const url = this.buildUrl(path, context);
    const headers = await this.buildHeaders(context);
    const response = await axios
      .put(url, context.body, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      })
      .then((data) => {
        return data;
      })
      .catch(this.handleAxiosError(context, url));

    if (!response) {
      throw new BadRequestException('API not responding correctly');
    }

    return this.resolveResult<T>(response);
  }

  public async delete<T>(
    path: string,
    context: Omit<RequestOption, 'query' | 'body'>,
  ) {
    this.addPath(path, context);
    const url = this.buildUrl(path, context);
    const headers = await this.buildHeaders(context);
    const response = await axios
      .delete(url, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      })
      .then((data) => {
        return data;
      })
      .catch(this.handleAxiosError(context, url));

    if (!response) {
      throw new BadRequestException('API not responding correctly');
    }

    return this.resolveResult<T>(response);
  }

  public async patch<T>(path: string, context: RequestOption) {
    this.addPath(path, context);
    const url = this.buildUrl(path, context);
    const headers = await this.buildHeaders(context);
    const response = await axios
      .patch(url, context.body, {
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      })
      .then((data) => {
        return data;
      })
      .catch(this.handleAxiosError(context, url));

    if (!response) {
      throw new BadRequestException('API not responding correctly');
    }
    return this.resolveResult<T>(response);
  }

  public async upload<T>(
    path: string,
    file: File,
    context: Omit<RequestOption, 'query' | 'body'>,
  ) {
    this.addPath(path, context);
    const url = this.buildUrl(path, context);
    const formData = new FormData();
    formData.append('file', file);
    const headers = await this.buildHeaders(context);

    const response = await axios
      .post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...headers,
        },
      })
      .then((data) => {
        return data;
      })
      .catch(this.handleAxiosError(context, url));

    if (!response) {
      throw new BadRequestException('API not responding correctly');
    }

    return this.resolveResult<T>(response);
  }
}

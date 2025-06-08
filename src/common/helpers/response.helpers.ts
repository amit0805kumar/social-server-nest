export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
}

export const createResponse = <T>(
  data: T,
  message = 'Success',
  statusCode = 200,
): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    statusCode,
  };
};

export const createErrorResponse = (
  message = 'Something went wrong',
  statusCode = 500,
): ApiResponse => {
  return {
    success: false,
    message,
    statusCode,
  };
};

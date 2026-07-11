export class ApiResponse<T> {
  constructor(
    public statusCode: number,
    public data: T,
    public message: string = 'Success',
    public success: boolean = statusCode < 400
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = success;
  }
}

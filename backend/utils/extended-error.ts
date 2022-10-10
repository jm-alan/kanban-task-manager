export default class ExtendedError extends Error {
  errors: string[];
  status: number;
  constructor(title: string, errors: string[], status: number) {
    super(title);
    this.errors = errors;
    this.status = status;
  }
}

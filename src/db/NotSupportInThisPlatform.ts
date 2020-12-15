export class NotSupportInThisPlatform extends Error {
  constructor() {
    super("Not Support In This Platform");
  }
}


export interface Http {
  send():Promise<[string, Error | null]>;
}


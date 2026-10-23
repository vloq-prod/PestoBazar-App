export const OtpVerify = {
  getHash: async (): Promise<string[]> => [],
  getOtp: async (): Promise<boolean> => false,
  addListener: (_handler: (message: string) => void) => {
    return { remove: () => {} };
  },
  removeListener: () => {},
};

export default OtpVerify;

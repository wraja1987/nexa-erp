export const limiter = {
  async check(_key: string, _limit: number, _window: string): Promise<boolean> {
    return true;
  },
};

export default limiter;






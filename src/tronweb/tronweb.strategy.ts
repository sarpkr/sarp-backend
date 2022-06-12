import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { getAtronContract } from './tronweb.common';

export class TronwebNodeStrategy
  extends Server
  implements CustomTransportStrategy
{
  async listen(callback: () => void) {
    const contract = await getAtronContract();

    const claimHandler = this.messageHandlers.get('claim');
    const transferHandler = this.messageHandlers.get('transfer');

    // todo 처음 서비스 시작할때?
    contract.Claim().watch(async (err, event) => {
      await claimHandler(event);
    });
    contract.Transfer().watch(async (err, event) => {
      await transferHandler(event);
    });

    callback();
  }

  /**
   * This method is triggered on application shutdown.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  close() {
    //todo close?
  }
}

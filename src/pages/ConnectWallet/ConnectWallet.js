import { ConnectButton } from "web3uikit";
import { useMoralis } from "react-moralis";

function ConnectWallet() {
  const { isWeb3Enabled, account } = useMoralis();
  return (
    <div>
      <ConnectButton moralisAuth={false} />
    </div>
  );
}
// export { connected, acc };
export default ConnectWallet;

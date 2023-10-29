import Link from "next/link";
import { useListen } from "../hooks/useListen";
import { useMetamask } from "../hooks/useMetamask";
import { Loading } from "./Loading";
import Siwe from "./siwe";

export default function Wallet() {
  const BACKEND_ADDR = "http://localhost:8000";
  const {
    dispatch,
    state: { status, isMetamaskInstalled, wallet, balance },
  } = useMetamask();

  const showInstallMetamask =
    status !== "pageNotLoaded" && !isMetamaskInstalled;
  const showConnectButton =
    status !== "pageNotLoaded" && isMetamaskInstalled && !wallet;

  const isConnected = status !== "pageNotLoaded" && typeof wallet === "string";

  const handleDisconnect = () => {
    dispatch({ type: "disconnect" });
  };

  const handleAddUsdc = async () => {
    dispatch({ type: "loading" });

    await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: "0x4Dd942bAa75810a3C1E876e79d5cD35E09C97A76",
          symbol: "D2T",
          decimals: 18,
          image:
            "https://s2.coinmarketcap.com/static/img/coins/128x128/23210.png",
        },
      },
    });
    dispatch({ type: "idle" });
  };

  async function getInformation() {
    const res = await fetch(`${BACKEND_ADDR}/personal_information`, {
      credentials: "include",
    });
    window.alert(await res.text());
  }

  return (
    <>
      {wallet && balance && (
        <div className=" px-4 py-5 sm:px-6">
          <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
            <div className="ml-4 mt-4">
              <div className="flex items-center">
                <div className="ml-4">
                  <h3 className="text-lg font-medium leading-6 text-white">
                    Address: <span>{wallet}</span>
                  </h3>
                  <p className="text-sm text-white">
                    Balance:{" "}
                    <span>
                      {(parseInt(balance) / 1000000000000000000).toFixed(4)} ETH
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConnectButton && <Siwe status={status} dispatch={dispatch} />}

      {showInstallMetamask && (
        <Link
          href="https://metamask.io/"
          target="_blank"
          className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
        >
          Install Metamask
        </Link>
      )}

      {isConnected && (
        <>
          <div className="flex  w-full justify-center space-x-2">
            <button
              onClick={handleAddUsdc}
              className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
            >
              {status === "loading" ? <Loading /> : "Add Token"}
            </button>
            <button
              onClick={handleDisconnect}
              className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
            >
              Disconnect
            </button>
          </div>
          <div>
            <button
              onClick={getInformation}
              className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
            >
              Get session information
            </button>
          </div>
        </>
      )}
    </>
  );
}

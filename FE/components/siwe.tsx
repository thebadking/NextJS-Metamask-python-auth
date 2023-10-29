import React, { useEffect, useState } from "react";
import { BrowserProvider } from "ethers";
import { SiweMessage } from "siwe";
import { Loading } from "./Loading";

const Siwe = ({ status, dispatch }) => {
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const initProvider = new BrowserProvider(window.ethereum);
    setProvider(initProvider);
  }, []);

  async function createSiweMessage(address, statement) {
    const domain = window.location.host;
    const origin = window.location.origin;
    const BACKEND_ADDR = "http://localhost:8000";

    const res = await fetch(`${BACKEND_ADDR}/nonce`, {
      credentials: "include",
    });
    const jsonRes = await res.json();
    const nonce = jsonRes.nonce;

    const message = new SiweMessage({
      domain,
      address,
      statement,
      uri: origin,
      version: "1",
      chainId: "1",
      nonce: nonce,
    });

    return message.prepareMessage();
  }

  async function signInWithEthereum() {
    dispatch({ type: "loading" });

    if (!provider) {
      window.alert("Provider not initialized");
      dispatch({ type: "idle" }); // Reset to idle status if provider is not initialized
      return;
    }

    try {
      const signer = await provider.getSigner();
      const message = await createSiweMessage(
        await signer.getAddress(),
        "Sign in with Ethereum to the app."
      );
      const signature = await signer.signMessage(message);

      const BACKEND_ADDR = "http://localhost:8000";
      const res = await fetch(`${BACKEND_ADDR}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, signature }),
        credentials: "include",
      });

      const resText = await res.text();
      window.alert(resText);

      if (res.ok) {
        // Assuming successful response contains the wallet and balance
        const walletAddress = await signer.getAddress();
        const balance = await provider.getBalance(walletAddress);
        dispatch({
          type: "connect",
          wallet: walletAddress,
          balance: balance.toString(),
        });
      } else {
        // Handle unsuccessful verification here
        dispatch({ type: "error", error: "Unsuccessful verification" });
      }
    } catch (error) {
      window.alert(`An error occurred: ${error.message}`);
      dispatch({ type: "error", error: error.message });
    }
  }

  return (
    <button
      onClick={signInWithEthereum}
      className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
    >
      {status === "loading" ? <Loading /> : "Sign-in with Ethereum"}
    </button>
  );
};

export default Siwe;

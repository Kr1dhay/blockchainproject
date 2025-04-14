// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';

// Import deployed contract addresses
import contractAddresses from './contract-addresses.json';

// Import your contract ABIs
import AuthorizedMinters from './artifacts/AuthorizedMinters.json';
import LuxuryWatchNFT from './artifacts/LuxuryWatchNFT.json';
import StolenWatchesRegistry from './artifacts/StolenWatchesRegistry.json';
import ResellWatch from './artifacts/ResellWatch.json';

// We’re focusing on the LuxuryWatchNFT
const LUXURY_WATCH_NFT_ADDRESS = contractAddresses.LuxuryWatchNFT;
const AUTHORIZED_MINTERS_ADDRESS = contractAddresses.AuthorizedMinters;
const STOLEN_WATCHES_REGISTRY = contractAddresses.StolenWatchesRegistry;
const RESELL_WATCH = contractAddresses.ResellWatch;


function App() {
  const [account, setAccount] = useState(null);
  const [typeOfConnection, setTypeOfConnection] = useState(null);
  const [status, setStatus] = useState('');

  const [luxurywatchnft, setluxurywatchnft] = useState(null);
  const [authorisedminters, setauthorisedminters] = useState(null);
  const [stolenwatchesregistry, setstolenwatchesregistry] = useState(null);
  const [resellwatch, setresellwatch] = useState(null);
  const [contract, setContract] = useState(null);


  // ------------------
  //  1) ACCOUNT CHANGES LISTENER
  // ------------------
  useEffect(() => {
    if (!window.ethereum) return; // MetaMask not available?

    // Handler for when the user changes accounts in MetaMask
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // No account connected
        setAccount(null);
        setluxurywatchnft(null);
        setauthorisedminters(null);
        setstolenwatchesregistry(null);
        setresellwatch(null);
        setTypeOfConnection(null);
        setStatus('');
      } else {
        // If user switches accounts, reset everything back to defaults
        setAccount(null);
        setluxurywatchnft(null);
        setauthorisedminters(null);
        setstolenwatchesregistry(null);
        setresellwatch(null);
        setTypeOfConnection(null);
        setStatus('Account changed. Please reconnect.');
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    // Cleanup the listener when component unmounts
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  // ------------------
  //  2) CONNECT WALLET
  // ------------------
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      // Request user to select an account
      const [selectedAccount] = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(selectedAccount);

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Instantiate your contract
      const LuxuryWatchNFTInstance = new Contract(
        LUXURY_WATCH_NFT_ADDRESS,
        LuxuryWatchNFT.abi,
        signer
      );

      const AuthorizedMintersInstance = new Contract(
        AUTHORIZED_MINTERS_ADDRESS,
        AuthorizedMinters.abi,
        signer
      );
      const StolenWatchesRegistryInstance = new Contract(
        STOLEN_WATCHES_REGISTRY,
        StolenWatchesRegistry.abi,
        signer
      );

      const ResellWatchInstance = new Contract(
        RESELL_WATCH,
        ResellWatch.abi,
        signer
      );

      // Save contract instance in state
      setluxurywatchnft(LuxuryWatchNFTInstance);
      setauthorisedminters(AuthorizedMintersInstance);
      setstolenwatchesregistry(StolenWatchesRegistryInstance);
      setresellwatch(ResellWatchInstance);

      // Example custom function name: `contractOwner()`
      const ownerAddress = await LuxuryWatchNFTInstance.contractOwner();

      // Compare addresses; set ownership
      if (selectedAccount.toLowerCase() === ownerAddress.toLowerCase()) {
        typeOfConnection("Owner");
      } else if(await AuthorizedMintersInstance.isMinter(selectedAccount.toLowerCase())) {
        typeOfConnection("Minter");
      } else {
        typeOfConnection("User")
      }
      
      

      setStatus('Welcome! Please select a function');
    } catch (error) {
      console.error('Wallet connection error:', error);
      setStatus('Failed to connect wallet');
    }
  };

  // --------------------------------
  //  3) CONTRACT FUNCTION HANDLERS
  // --------------------------------
  // --- Owner functions ---
  const handleApproveMinter = async () => {
    try {
      setStatus('Approving minter...');
      const tx = await contract.approveMinter('0xMinterAddress');
      await tx.wait();
      setStatus('Minter approved!');
    } catch (error) {
      console.error('Approve minter error:', error);
      setStatus('Error approving minter');
    }
  };

  const handleRemoveMinter = async () => {
    try {
      setStatus('Removing minter...');
      const tx = await contract.removeMinter('0xMinterAddress');
      await tx.wait();
      setStatus('Minter removed!');
    } catch (error) {
      console.error('Remove minter error:', error);
      setStatus('Error removing minter');
    }
  };

  // --- User functions ---
  const handleRegisterStolen = async () => {
    try {
      setStatus('Registering stolen...');
      const tx = await contract.registerStolen(/* parameters if needed */);
      await tx.wait();
      setStatus('Stolen registered!');
    } catch (error) {
      console.error('Register stolen error:', error);
      setStatus('Error registering stolen');
    }
  };

  const handleRegisterUnstolen = async () => {
    try {
      setStatus('Registering unstolen...');
      const tx = await contract.registerUnstolen(/* parameters if needed */);
      await tx.wait();
      setStatus('Unstolen registered!');
    } catch (error) {
      console.error('Register unstolen error:', error);
      setStatus('Error registering unstolen');
    }
  };

  const handleApproveTransfer = async () => {
    try {
      setStatus('Approving transfer...');
      const tx = await contract.approveTransfer(/* parameters if needed */);
      await tx.wait();
      setStatus('Transfer approved!');
    } catch (error) {
      console.error('Approve transfer error:', error);
      setStatus('Error approving transfer');
    }
  };

  const handleBuy = async () => {
    try {
      setStatus('Buying...');
      const tx = await contract.buy(/* parameters if needed */);
      await tx.wait();
      setStatus('Purchase successful!');
    } catch (error) {
      console.error('Buy error:', error);
      setStatus('Error buying');
    }
  };

  const handleSell = async () => {
    try {
      setStatus('Selling...');
      const tx = await contract.sell(/* parameters if needed */);
      await tx.wait();
      setStatus('Sale successful!');
    } catch (error) {
      console.error('Sell error:', error);
      setStatus('Error selling');
    }
  };

  const handleMint = async () => {
    try {
      setStatus('Minting...');
      const tx = await contract.mint(/* parameters if needed */);
      await tx.wait();
      setStatus('Minted successfully!');
    } catch (error) {
      console.error('Mint error:', error);
      setStatus('Error minting');
    }
  };

  const handleBurn = async () => {
    try {
      setStatus('Burning...');
      const tx = await contract.burn(/* parameters if needed */);
      await tx.wait();
      setStatus('Burned successfully!');
    } catch (error) {
      console.error('Burn error:', error);
      setStatus('Error burning');
    }
  };

  // ------------------------
  //  4) RENDER THE UI
  // ------------------------
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Local dApp Frontend</h1>

      {/* If no account, show Connect button */}
      {!account ? (
        <div>
          <p>Please connect your MetaMask wallet to continue.</p>
          <button onClick={connectWallet} style={{ padding: '10px', fontSize: '16px' }}>
            Connect MetaMask
          </button>
        </div>
      ) : (
        <>
          <p>
            Wallet connected: <strong>{account}</strong>
          </p>
          <p>{status}</p>

          {/* If owner, show Owner Functions */}
          {(typeOfConnection == "Owner") && (
            <div style={{ marginTop: '20px' }}>
              <h2>Contract Owner Connected</h2>
              <button onClick={handleApproveMinter} style={{ marginRight: '10px' }}>
                Approve Minter
              </button>
              <button onClick={handleRemoveMinter}>Remove Minter</button>
            </div>
          )}

          {/* If user not owner, show User Functions */}
          {!(typeOfConnection == "Owner") && (
            <div style={{ marginTop: '20px' }}>
              <h2>User Functions</h2>
              <button onClick={handleRegisterStolen} style={{ marginRight: '10px', marginBottom: '10px' }}>
                Register Stolen
              </button>
              <button onClick={handleRegisterUnstolen} style={{ marginRight: '10px', marginBottom: '10px' }}>
                Register Unstolen
              </button>
              <button onClick={handleApproveTransfer} style={{ marginRight: '10px', marginBottom: '10px' }}>
                Approve Transfer
              </button>
              <button onClick={handleBuy} style={{ marginRight: '10px', marginBottom: '10px' }}>
                Buy
              </button>
              <button onClick={handleSell} style={{ marginRight: '10px', marginBottom: '10px' }}>
                Sell
              </button>
              <button onClick={handleMint} style={{ marginRight: '10px', marginBottom: '10px' }}>
                Mint
              </button>
              <button onClick={handleBurn} style={{ marginRight: '10px', marginBottom: '10px' }}>
                Burn
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;

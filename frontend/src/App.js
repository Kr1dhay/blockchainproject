// frontend/src/App.js
import React, { useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';

// Import deployed contract addresses
import contractAddresses from './contract-addresses.json';

// Import your contract ABIs
import AuthorizedMinters from './artifacts/AuthorizedMinters.json';
import LuxuryWatchNFT from './artifacts/LuxuryWatchNFT.json';
import StolenWatchesRegistry from './artifacts/StolenWatchesRegistry.json';
import ResellWatch from './artifacts/ResellWatch.json';

// We can store addresses in constants
const LUXURY_WATCH_NFT_ADDRESS = contractAddresses.LuxuryWatchNFT;
// If you need to use the others, you can
const AUTHORIZED_MINTERS_ADDRESS = contractAddresses.AuthorizedMinters;
const STOLEN_WATCHES_REGISTRY_ADDRESS = contractAddresses.StolenWatchesRegistry;
const RESELL_WATCH_ADDRESS = contractAddresses.ResellWatch;

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [status, setStatus] = useState('');

  // Connect to wallet and instantiate the LuxuryWatchNFT contract
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }
    try {
      // Request account access from MetaMask
      const [selectedAccount] = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      setAccount(selectedAccount);

      // Create an ethers BrowserProvider
      const provider = new BrowserProvider(window.ethereum);

      // getSigner() is async in v6
      const signer = await provider.getSigner();

      // Instantiate the LuxuryWatchNFT contract using its ABI and address
      const contractInstance = new Contract(
        LUXURY_WATCH_NFT_ADDRESS,
        LuxuryWatchNFT.abi,
        signer
      );
      setContract(contractInstance);

      // Check if the current account is the contract owner (assumes owner() is defined)
      const ownerAddress = await contractInstance.owner();
      if (ownerAddress && selectedAccount) {
        setIsOwner(selectedAccount.toLowerCase() === ownerAddress.toLowerCase());
      }

      setStatus('Wallet connected!');
    } catch (error) {
      console.error('Wallet connection error:', error);
      setStatus('Failed to connect wallet');
    }
  };

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
      const tx = await contract.buy(/* parameters if needed, e.g. { value: ethers.parseEther("0.1") } */);
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

  // --- Render the UI ---
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Local dApp Frontend</h1>

      {/* Connect Wallet Section */}
      {!account ? (
        <button onClick={connectWallet} style={{ padding: '10px', fontSize: '16px' }}>
          Connect MetaMask
        </button>
      ) : (
        <p>
          Wallet connected: <strong>{account}</strong>
        </p>
      )}
      <p>{status}</p>

      {/* Role-based UI rendering */}
      {account && isOwner && (
        <div style={{ marginTop: '20px' }}>
          <h2>Owner Functions</h2>
          <button onClick={handleApproveMinter} style={{ marginRight: '10px' }}>
            Approve Minter
          </button>
          <button onClick={handleRemoveMinter}>Remove Minter</button>
        </div>
      )}

      {account && !isOwner && (
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
    </div>
  );
}

export default App;

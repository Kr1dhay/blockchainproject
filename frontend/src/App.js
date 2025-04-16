// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract, parseEther, formatEther} from 'ethers';

// Import deployed contract addresses
import contractAddresses from './contract-addresses.json';

// Import your contract ABIs
import AuthorizedMinters from './artifacts/AuthorizedMinters.json';
import LuxuryWatchNFT from './artifacts/LuxuryWatchNFT.json';
import StolenWatchesRegistry from './artifacts/StolenWatchesRegistry.json';
import ResellWatch from './artifacts/ResellWatch.json';

// Addresses
const LUXURY_WATCH_NFT_ADDRESS = contractAddresses.LuxuryWatchNFT;
const AUTHORIZED_MINTERS_ADDRESS = contractAddresses.AuthorizedMinters;
const STOLEN_WATCHES_REGISTRY = contractAddresses.StolenWatchesRegistry;
const RESELL_WATCH = contractAddresses.ResellWatch;

function App() {
  const [account, setAccount] = useState(null);
  const [typeOfConnection, setTypeOfConnection] = useState(null);
  const [status, setStatus] = useState('');

  // Contract instances
  const [luxurywatchnft, setLuxuryWatchNFT] = useState(null);
  const [authorizedMinters, setAuthorizedMinters] = useState(null);
  const [stolenWatchesRegistry, setStolenWatchesRegistry] = useState(null);
  const [resellWatch, setResellWatch] = useState(null);

  // ------------------
  //  Form Fields for Owner
  // ------------------
  const [ownerFormAddress, setOwnerFormAddress] = useState('');
  const [ownerFormBrand, setOwnerFormBrand] = useState('');
  const [ownerFormLocation, setOwnerFormLocation] = useState('');
  const [ownerFormNumber, setOwnerFormNumber] = useState('');

  // ------------------
  //  Form Fields for Mint (Minter)
  // ------------------
  const [mintTo, setMintTo] = useState('');
  const [mintSerialID, setMintSerialID] = useState('');
  const [mintURI, setMintURI] = useState('');

  // ------------------
  //  Shared Serial ID for All User Functions
  // ------------------
  const [userSerialID, setUserSerialID] = useState('');

  // ------------------
  //  Fields Specific to listWatch
  // ------------------
  const [listPriceETH, setListPriceETH] = useState('');
  const [listBuyer, setListBuyer] = useState('');

  // ------------------
  //  1) ACCOUNT CHANGES LISTENER
  // ------------------
  useEffect(() => {
    if (!window.ethereum) return; // MetaMask not available?

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        // No account connected
        setAccount(null);
        setLuxuryWatchNFT(null);
        setAuthorizedMinters(null);
        setStolenWatchesRegistry(null);
        setResellWatch(null);
        setTypeOfConnection(null);
        setStatus('');
      } else {
        // If user switches accounts, reset everything
        setAccount(null);
        setLuxuryWatchNFT(null);
        setAuthorizedMinters(null);
        setStolenWatchesRegistry(null);
        setResellWatch(null);
        setTypeOfConnection(null);
        setStatus('Account changed. Please reconnect.');
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    // Cleanup on unmount
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

      // Request account access
      const [selectedAccount] = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setAccount(selectedAccount);

      // Create a provider & signer
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Instantiate contracts
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

      // Save contract instances
      setLuxuryWatchNFT(LuxuryWatchNFTInstance);
      setAuthorizedMinters(AuthorizedMintersInstance);
      setStolenWatchesRegistry(StolenWatchesRegistryInstance);
      setResellWatch(ResellWatchInstance);

      // Check role
      const ownerAddress = await LuxuryWatchNFTInstance.contractOwner();
      if (selectedAccount.toLowerCase() === ownerAddress.toLowerCase()) {
        setTypeOfConnection("Owner");
      } else if (await AuthorizedMintersInstance.isMinter(selectedAccount.toLowerCase())) {
        setTypeOfConnection("Minter");
      } else {
        setTypeOfConnection("User");
      }

      setStatus('Welcome! Please select a function');
    } catch (error) {
      console.error('Wallet connection error:', error);
      setStatus('Failed to connect wallet');
    }
  };

  // -------------------------
  //  3) OWNER-ONLY FUNCTIONS
  // -------------------------
  const handleApproveMinter = async () => {
    if (!ownerFormAddress || !ownerFormBrand || !ownerFormLocation || ownerFormNumber === '') {
      setStatus('Please fill in all fields for Approve Minter');
      return;
    }
    const numericVal = parseInt(ownerFormNumber, 10);
    if (isNaN(numericVal) || numericVal < 0 || numericVal > 10000) {
      setStatus('Number must be between 0 and 10000');
      return;
    }

    try {
      setStatus('Approving minter...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await authorizedMinters.addMinter(ownerFormAddress, ownerFormBrand, ownerFormLocation, numericVal);
      setStatus(`Minter approved! Address: ${ownerFormAddress}`);
      // Clear fields
      setOwnerFormAddress('');
      setOwnerFormBrand('');
      setOwnerFormLocation('');
      setOwnerFormNumber('');
    } catch (error) {
      console.error('Approve minter error:', error);
      setStatus('Error approving minter');
    }
  };

  const handleRemoveMinter = async () => {
    if (!ownerFormAddress) {
      setStatus('Please enter the address to remove');
      return;
    }
    try {
      setStatus('Removing minter...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await authorizedMinters.removeMinter(ownerFormAddress);
      setStatus(`Minter removed! Address: ${ownerFormAddress}`);

      // Clear fields
      setOwnerFormAddress('');
      setOwnerFormBrand('');
      setOwnerFormLocation('');
      setOwnerFormNumber('');
    } catch (error) {
      console.error('Remove minter error:', error);
      setStatus('Error removing minter');
    }
  };

  // ------------------------------------
  //  4) MINTER & USER FUNCTIONS
  // ------------------------------------

  // MINT (for Minter)
  // function mint(address to, string memory serialID, string memory uri) external isMinter
  const handleMint = async () => {
    // Basic validation
    if (!mintTo || !mintSerialID || !mintURI) {
      setStatus('Please fill in address, serialID, and uri for mint');
      return;
    }
    try {
      setStatus('Minting...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await luxurywatchnft.mint(mintTo, mintSerialID, mintURI);
      setStatus(`Minted successfully! to=${mintTo}, id=${mintSerialID}`);

      // Clear fields
      setMintTo('');
      setMintSerialID('');
      setMintURI('');
    } catch (error) {
      console.error('Mint error:', error);
      setStatus('Error minting');
    }
  };
  // ------------------------------------
  //  5) USER-ONLY FUNCTIONS
  // ------------------------------------
  // All user functions require a serialID
  // plus listWatch needs 2 more fields: uint256 _priceETH, address _buyer

  const handleMinterOfToken = async () => {
    if (!userSerialID) {
      setStatus('Please enter a serialID first');
      return;
    }
    try {
      setStatus(`Getting minter of token: ${userSerialID}...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const minterAddress = await luxurywatchnft.minterOfToken(userSerialID);
      setStatus(`Minter: ${minterAddress}`);
    } catch (error) {
      console.error(error);
      setStatus('Error getting minter of token');
    }
    
    setListPriceETH('');
    setListBuyer('');

  };

  const handleOwnerOfToken = async () => {
    if (!userSerialID) {
      setStatus('Please enter a serialID first');
      return;
    }
    try {
      setStatus(`Getting owner of token: ${userSerialID}...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const ownerAddress = await luxurywatchnft.ownerOfToken(userSerialID);
      setStatus(`Owner: ${ownerAddress}`);

    } catch (error) {
      console.error(error);
      setStatus('Error getting owner of token');
    }

    
    setListPriceETH('');
    setListBuyer('');
  };

  const handleBurn = async () => {
    if (!userSerialID) {
      setStatus('Please enter a serialID first');
      return;
    }
    try {
      setStatus(`Burning token...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await luxurywatchnft.burn(userSerialID);
      setStatus(`Token burned: ${userSerialID}`);
    } catch (error) {
      console.error(error);
      setStatus('Error burning token');
    }

    
    setListPriceETH('');
    setListBuyer('');
  };

  const handleApproveListingToken = async () => {
    if (!userSerialID) {
      setStatus('Please enter a serialID first');
      return;
    }
    try {
      setStatus(`Approving listing token...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await luxurywatchnft.approveListingToken(userSerialID);
      setStatus(`Listing token approved: ${userSerialID}`);
    } catch (error) {
      console.error(error);
      setStatus('Error approving listing token');
    }

    
    setListPriceETH('');
    setListBuyer('');
  };
  const handleFlagAsStolen = async () => {
    if (!userSerialID) {
      setStatus('Please enter a serialID first');
      return;
    }
    try {
      setStatus(`Flagging as stolen...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await stolenWatchesRegistry.flagAsStolen(userSerialID);
      setStatus(`Flagged as stolen: ${userSerialID}`);
    } catch (error) {
      console.error(error);
      setStatus('Error flagging as stolen');
    }

    
    setListPriceETH('');
    setListBuyer('');
  };

  const handleUnflagAsStolen = async () => {
    if (!userSerialID) {
      setStatus('Please enter a serialID first');
      return;
    }
    try {
      setStatus(`Unflagging as stolen...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await stolenWatchesRegistry.unflagAsStolen(userSerialID);
      setStatus(`Unflagged as stolen: ${userSerialID}`);
    } catch (error) {
      console.error(error);
      setStatus('Error unflagging as stolen');
    }

    
    setListPriceETH('');
    setListBuyer('');
  };

  const handleIsStolen = async () => {
    if (!userSerialID) {
      setStatus('Please enter a serialID first');
      return;
    }
    try {
      setStatus(`Checking if stolen: ${userSerialID}...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const isStolen = await stolenWatchesRegistry.isStolen(userSerialID);
      setStatus(`Token ${userSerialID} is ${isStolen ? 'stolen' : 'not stolen'}`);
    } catch (error) {
      console.error(error);
      setStatus('Error checking stolen status');
    }
    
    setListPriceETH('');
    setListBuyer('');
  };

  const handleCancelListing = async () => {
    if (!userSerialID) {
      setStatus('Please enter a serialID first');
      return;
    }
    try {
      setStatus(`Canceling listing...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await resellWatch.cancelListing(userSerialID);
      setStatus(`Listing canceled: ${userSerialID}`);
    } catch (error) {
      console.error(error);
      setStatus('Error canceling listing');
    }

    
    setListPriceETH('');
    setListBuyer('');
  };

  const handleBuyWatch = async () => {
    if (!userSerialID) {
      setStatus('Please enter a serialID first');
      return;
    }
  
    try {
      setStatus(`Buying watch ${userSerialID}...`);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      const buyWatchETH = formatEther(await resellWatch.getListingPriceandComission(userSerialID));
      const buyWatchWEI = parseEther(buyWatchETH.toString());
      
      const tx = await resellWatch.buyWatch(userSerialID, { value: buyWatchWEI });
      await tx.wait();
  
      setStatus(`Successfully purchased watch with ${buyWatchETH} ETH!`);
    } catch (error) {
      console.error('Buy watch error:', error);
      setStatus('Error buying watch');
    }
  };

  const handleGetWatchPrice = async () => {
    if (!userSerialID) {
      setStatus('Please enter a serialID first');
      return;
    }
    try {
      setStatus(`Getting watch price...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const price = await resellWatch.getListingPriceandComission(userSerialID);
      const priceETH = formatEther(price);
      setStatus(`Price: ${priceETH} ETH (Including commission)`);
    } catch (error) {
      console.error(error);
      setStatus('Error getting watch price');
    }

    
    setListPriceETH('');
    setListBuyer('');
  }
  // -----------------------------------------------------
  

  // listWatch needs: string memory serialID, uint256 _priceETH, address _buyer
  const handleListWatch = async () => {
    // Validate serialID + 2 extra fields
    if (!userSerialID) {
      setStatus('Please enter a serialID for listWatch');
      return;
    }
    if (!listPriceETH) {
      setStatus('Please enter a price in ETH for listWatch');
      return;
    }
    if (!listBuyer) {
      setStatus('Please enter a buyer address for listWatch');
      return;
    }

    // You may want to parse the price to a BigNumber with `ethers.parseUnits` if needed
    // e.g. let priceETH = BigInt(listPriceETH);

    try {
      setStatus(`Listing watch: serialID=${userSerialID}, price=${listPriceETH}, buyer=${listBuyer}`);
      const priceWei = parseEther(listPriceETH);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await resellWatch.listWatch(userSerialID, priceWei, listBuyer);
      setStatus(`Watch listed!`);
      

    } catch (error) {
      console.error(error);
      setStatus('Error listing watch');
    }

    
    setListPriceETH('');
    setListBuyer('');
  };

  // -----------------------------------------------------
  //                INLINE STYLES
  // -----------------------------------------------------
  const backgroundStyle = {
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
    margin: 0,
    padding: 0,
    fontFamily: 'Arial, sans-serif',
  };

  const contentContainerStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // translucent white
    maxWidth: '800px',
    margin: '0 auto',
    marginTop: '40px',
    borderRadius: '10px',
    padding: '20px',
    color: '#000', // black text
  };

  const headingStyle = {
    textAlign: 'center',
    marginBottom: '20px',
  };

  const buttonStyle = {
    backgroundColor: '#000', // black button
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    borderRadius: '5px',
    marginRight: '10px',
    marginTop: '5px',
  };

  const inputStyle = {
    backgroundColor: '#fff',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    marginLeft: '10px',
    marginRight: '10px',
    marginBottom: '5px',
    fontSize: '14px',
    width: '250px',
    outline: 'none',
  };

  const labelStyle = {
    display: 'inline-block',
    marginTop: '5px',
  };

  const homepageTextStyle = {
    marginTop: '40px',
    lineHeight: '1.6', // nicer readability
    fontSize: '16px',
  };

return (
    <div style={backgroundStyle}>
      <div style={contentContainerStyle}>
        <h1 style={headingStyle}>Luxury Watch NFT Authentication Platform</h1>

        {/* If no account, show Connect button + the About/Instructions section */}
        {!account ? (
          <>
            {/* Section 1: Connect Button */}
            <div style={{ textAlign: 'center' }}>
              <p>Please connect your MetaMask wallet to continue.</p>
              <button onClick={connectWallet} style={buttonStyle}>
                Connect MetaMask
              </button>
            </div>

            {/* Section 2: About/Instructions */}
            <div style={homepageTextStyle}>
              <h2>About Us</h2>
              <p>
                Our platform is designed to enhance trust, authenticity, and protect watch owners against theft. For watch buyers, our platform helps safeguard you from thefts and fakes. For watch stores, our platform helps protect your brand and customers, while also allowing for the collection of commission on watch resales.
              </p>

              <h2 style={{ marginTop: '30px' }}>Instructions</h2>

              <h3 style={{ marginTop: '20px' }}>For Luxury Watch Stores:</h3>
              <ol>
                <li>
                  <strong>Create a Wallet:</strong> Start your journey by creating a secure digital wallet. For new users, we recommend setting up a<a href="https://metamask.io" target="_blank" rel="noreferrer"> MetaMask </a> wallet.{' '}
                </li>
                <li>
                  <strong>Create an NFT for each Product and Upload to the Blockchain:</strong> Upload the NFT design and metadata to the blockchain. Take note of the unique URI for each NFT. This URI will be used to link the NFT to the watch's unique serial number.
                </li>
                <li>
                  <strong>Mint a unique NFT on our platform for each watch using its serial number:</strong> Each watch is assigned an NFT that serves as its digital replica on the blockchain. It must be minted directly to the wallet of the purchaser.
                </li>
              </ol>
              <p>
                <em>Note: Luxury Watch Stores can also access all end-user functions in the case watches are repurchased from clients.</em>
              </p>

              <h3 style={{ marginTop: '30px' }}>For End Users:</h3>
              <ol>
                <li>
                  <strong>Create a Wallet:</strong> Start your journey by creating a secure digital wallet. For new users, we recommend setting up a <a href="https://metamask.io" target="_blank" rel="noreferrer"> MetaMask </a> wallet.
                </li>
                <li>
                  <strong>Purchase a watch from a Luxury Watch Store:</strong> When you purchase a watch, the store will mint an NFT for you that is linked to the watch's unique serial number. This NFT will be sent directly to your wallet.
                </li>
                <li>
                  <strong>Enjoy peace of mind knowing that your watch is safe:</strong> The NFT serves as a digital certificate of authenticity and ownership, providing an additional layer of security against theft. You can also mark the watch as stolen to further prevent any resales of your watch.
                </li>
                <li>
                  <strong>Transfer the NFT to a new wallet if you sell the watch:</strong> If you decide to sell your watch, you should transfer the NFT to the new owner's wallet. You can choose to sell the watch entirely off-chain or through our platform, meaning the transaction will be recorded. Before selling, you must approve our platform to transfer the NFT on your behalf. Once the NFT is transferred, the new owner will have full ownership of the digital certificate of authenticity.
                </li>
              </ol>
            </div>
          </>
        ) : (
          <>
            <p>
              Wallet connected: <strong>{account}</strong>
            </p>
            <p>Role: <strong>{typeOfConnection}</strong></p>
            <p>{status}</p>

            {/* If Owner, show Approve/Remove Minter with form */}
            {typeOfConnection === 'Owner' && (
              <div style={{ marginTop: '20px' }}>
                <h2>Owner Functions</h2>
                <div style={{ marginBottom: '10px' }}>
                  <label style={labelStyle}>
                    Address: 
                    <input
                      type="text"
                      value={ownerFormAddress}
                      onChange={(e) => setOwnerFormAddress(e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                  <br />
                  <label style={labelStyle}>
                    Brand:
                    <input
                      type="text"
                      value={ownerFormBrand}
                      onChange={(e) => setOwnerFormBrand(e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                  <br />
                  <label style={labelStyle}>
                    Location:
                    <input
                      type="text"
                      value={ownerFormLocation}
                      onChange={(e) => setOwnerFormLocation(e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                  <br />
                  <label style={labelStyle}>
                    Comission Fee (in Basis Points):
                    <input
                      type="number"
                      min="0"
                      max="10000"
                      value={ownerFormNumber}
                      onChange={(e) => setOwnerFormNumber(e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                </div>
                <button onClick={handleApproveMinter} style={buttonStyle}>
                  Approve Minter
                </button>
                <button onClick={handleRemoveMinter} style={buttonStyle}>
                  Remove Minter
                </button>
              </div>
            )}

            {/* If Minter, show Mint + User Functions */}
            {typeOfConnection === 'Minter' && (
              <div style={{ marginTop: '20px' }}>
                <h2>Minter Functions</h2>
                <div style={{ marginBottom: '10px' }}>
                  <label style={labelStyle}>
                    Mint to (address):
                    <input
                      type="text"
                      value={mintTo}
                      onChange={(e) => setMintTo(e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                  <br />
                  <label style={labelStyle}>
                    Serial ID:
                    <input
                      type="text"
                      value={mintSerialID}
                      onChange={(e) => setMintSerialID(e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                  <br />
                  <label style={labelStyle}>
                    URI:
                    <input
                      type="text"
                      value={mintURI}
                      onChange={(e) => setMintURI(e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                </div>
                <button onClick={handleMint} style={buttonStyle}>
                  Mint
                </button>

                <h2 style={{ marginTop: '30px' }}>User Functions</h2>
                <div style={{ marginTop: '10px' }}>
                  <button onClick={handleMinterOfToken} style={buttonStyle}>minterOfToken</button>
                  <button onClick={handleOwnerOfToken} style={buttonStyle}>ownerOfToken</button>
                  <button onClick={handleBurn} style={buttonStyle}>burn</button>
                  <button onClick={handleApproveListingToken} style={buttonStyle}>approveListingToken</button>
                  <button onClick={handleFlagAsStolen} style={buttonStyle}>flagAsStolen</button>
                  <button onClick={handleUnflagAsStolen} style={buttonStyle}>unflagAsStolen</button>
                  <button onClick={handleIsStolen} style={buttonStyle}>isStolen</button>
                  <button onClick={handleCancelListing} style={buttonStyle}>cancelListing</button>
                  <button onClick={handleGetWatchPrice} style={buttonStyle}>getWatchPrice</button>
                  <button onClick={handleBuyWatch} style={buttonStyle}>buyWatch</button>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <label style={labelStyle}>
                    Serial ID:
                    <input
                      type="text"
                      value={userSerialID}
                      onChange={(e) => setUserSerialID(e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                </div>
                <div style={{ marginTop: '20px' }}>
                  <h3>List Watch</h3>
                  <label style={labelStyle}>
                    Price (ETH):
                    <input
                      type="text"
                      value={listPriceETH}
                      onChange={(e) => setListPriceETH(e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                  <br />
                  <label style={labelStyle}>
                    Buyer Address:
                    <input
                      type="text"
                      value={listBuyer}
                      onChange={(e) => setListBuyer(e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                  <br />
                  <button onClick={handleListWatch} style={buttonStyle}>listWatch</button>
                </div>
              </div>
            )}

            {/* If User, show just User Functions */}
            {typeOfConnection === 'User' && (
              <div style={{ marginTop: '20px' }}>
                <h2>User Functions</h2>
                <div style={{ marginBottom: '10px' }}>
                  <label style={labelStyle}>
                    Serial ID:
                    <input
                      type="text"
                      value={userSerialID}
                      onChange={(e) => setUserSerialID(e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                </div>
                <button onClick={handleMinterOfToken} style={buttonStyle}>minterOfToken</button>
                <button onClick={handleOwnerOfToken} style={buttonStyle}>ownerOfToken</button>
                <button onClick={handleBurn} style={buttonStyle}>burn</button>
                <button onClick={handleApproveListingToken} style={buttonStyle}>approveListingToken</button>
                <button onClick={handleFlagAsStolen} style={buttonStyle}>flagAsStolen</button>
                <button onClick={handleUnflagAsStolen} style={buttonStyle}>unflagAsStolen</button>
                <button onClick={handleIsStolen} style={buttonStyle}>isStolen</button>
                <button onClick={handleCancelListing} style={buttonStyle}>cancelListing</button>
                <button onClick={handleGetWatchPrice} style={buttonStyle}>getWatchPrice</button>
                <button onClick={handleBuyWatch} style={buttonStyle}>buyWatch</button>

                <div style={{ marginTop: '10px' }}>
                  <h3>List Watch</h3>
                  <label style={labelStyle}>
                    Price in ETH (For Selling):
                    <input
                      type="text"
                      value={listPriceETH}
                      onChange={(e) => setListPriceETH(e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                  <br />
                  <label style={labelStyle}>
                    Buyer Address (For Selling):
                    <input
                      type="text"
                      value={listBuyer}
                      onChange={(e) => setListBuyer(e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                  <br />
                  <button onClick={handleListWatch} style={buttonStyle}>listWatch</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
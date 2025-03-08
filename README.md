
## Blockchain Project - Development Environment and Hardhat Setup

If anyone installs extra dependancies, commit the hardhat.config.js file, the package.json and package-lock.json files.
Everyone else can use them with simply npm install

Pushing to main directly is disabled, create branch from main then merge back in when ready 


### Initial Setup 

### **1. Clone the Repository**


### **2. Install Dependencies**
Ensure you have **Node.js** installed. If you don’t have it, install it.
Then, install all required dependencies:
```sh
npm install
```

### **3. Start a Local Hardhat Node**
```sh
npx hardhat node
```
This starts a local Ethereum blockchain for development.

### **4. Compile Smart Contracts**
```sh
npx hardhat compile
```
This compiles all Solidity smart contracts inside the `contracts/` folder.

### **5. Deploy Contracts (Locally)**
Run the deployment script:
```sh
npx hardhat run scripts/deploy.js --network hardhat
```
This will deploy the smart contracts to the local Hardhat blockchain.

---

## **Project Structure**
```
blockchain/
│── contracts/          # Smart contracts (.sol files)
│── scripts/            # Deployment scripts
│── test/               # Test scripts for smart contracts
│── artifacts/          # Compiled contract artifacts (auto-generated)
│── cache/              # Hardhat cache (auto-generated)
│── hardhat.config.js   # Hardhat configuration file
│── package.json        # Node.js package dependencies
│── .gitignore          # Files to ignore in Git
│── README.md           # Project documentation
```

---

## **Additional Commands**

### **Run Tests**
To execute all test scripts inside the `test/` directory:
```sh
npx hardhat test
```

### **Deploy to a Test Network (Optional)**
If you want to deploy your contracts to a testnet like **Goerli**, update `hardhat.config.js` and run:
```sh
npx hardhat run scripts/deploy.js --network goerli
```
(Note: This requires API keys, which are not included in this setup.)

---

## **Troubleshooting**

### **1. Command `nvm use` Not Found**
If you see `zsh: command not found: nvm`, install NVM:
```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
source ~/.zshrc  # or source ~/.bashrc if using Bash
```
Then, retry:
```sh
nvm install 18
nvm use 18
```

### **2. Hardhat Not Found**
If you see an error like `command not found: hardhat`, ensure dependencies are installed:
```sh
npm install
```
Then, try running:
```sh
npx hardhat
```

### **3. Reset Hardhat Cache**
If you face weird errors, try resetting Hardhat:
```sh
npx hardhat clean
npx hardhat compile
```

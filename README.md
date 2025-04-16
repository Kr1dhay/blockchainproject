
## Blockchain Project - Development Environment and Hardhat Setup

If anyone installs extra dependancies, commit the hardhat.config.js file, the package.json and package-lock.json files.
Everyone else can use them with simply npm install

Pushing to main directly is disabled, create branch from main then merge back in when ready 


### Setup 

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
npx hardhat run scripts/deploy.js --network localhost
```
This will deploy the smart contracts to the local Hardhat blockchain.

### **6. Deploy Frontend**

```sh
cd frontend
npm start
```
This will start the frontend application locally to interact with the deployed smart contracts.
---


### **7 Run Tests**
To execute all test scripts inside the `test/` directory:
```sh
npx hardhat test
```


## **Troubleshooting**

### **1. Hardhat Not Found**
If you see an error like `command not found: hardhat`, ensure dependencies are installed:
```sh
npm install
```
Then, try running:
```sh
npx hardhat
```

### **2. Reset Hardhat Cache**
If you face weird errors, try resetting Hardhat:
```sh
npx hardhat clean
npx hardhat compile
```

import { useState, useEffect } from "react";
import { ethers, utils } from "ethers";
import abi from "./contracts/ByteCoinBank.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isBankerOwner, setIsBankerOwner] = useState(false);
  const [inputValue, setInputValue] = useState({ transferToAddress: "", transferAmount: "", deposit: "", bankName: "" });
  const [bankOwnerAddress, setBankOwnerAddress] = useState(null);
  const [customerTotalBalance, setCustomerTotalBalance] = useState(null);
  const [currentBankName, setCurrentBankName] = useState(null);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");

  const contractAddress = '0x4c8EC2aCE06a70366C770BB7C6Fa18ea6B7A2735';
  const contractABI = abi.abi;
  
  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        setIsLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsLoading(false);
        const account = accounts[0];
        setIsWalletConnected(true);
        setCustomerAddress(account);
        console.log("User Account Connected: ", accounts);
      } else {
        setError("Please install a MetaMask wallet to use our bank.");
        console.log("No Metamask detected");
      }      
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const getBankName = async () => {
    try {
      if (window.ethereum) {
        //read data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);
        setIsLoading(true);
        let bankName = await bankContract.bankName();
        setIsLoading(false);
        bankName = utils.parseBytes32String(bankName);
        setCurrentBankName(bankName.toString());
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error)
    }
  }

  const setBankNameHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);
        setIsLoading(true);
        const txn = await bankContract.setBankName(utils.formatBytes32String(inputValue.bankName));
        console.log("Setting Bank Name...");
        await txn.wait();
        setIsLoading(false);
        console.log("Bank Name Changed", txn.hash);
        getBankName();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getbankOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);
        setIsLoading(true);
        let owner = await bankContract.bankOwner();
        setBankOwnerAddress(owner);

        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsLoading(false);
        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsBankerOwner(true);
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const customerBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);
        setIsLoading(true);
        let balance = await bankContract.getCustomerBalance();
        setIsLoading(false);
        setCustomerTotalBalance(utils.formatEther(balance));
        console.log("Retrieved balance...", balance);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  const deposityMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        //write data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);
        setIsLoading(true);
        const txn = await bankContract.depositMoney(ethers.utils.parseEther(inputValue.deposit));
        console.log("Deposting money...");
        await txn.wait();
        console.log("Deposited money...done", txn.hash);
        setIsLoading(false);
        customerBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const transferMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const bankContract = new ethers.Contract(contractAddress, contractABI, signer);
        setIsLoading(true);
        const txn = await bankContract.transferMoney(inputValue.transferToAddress, ethers.utils.parseEther(inputValue.transferAmount));
        console.log("Transferring money...");
        await txn.wait();
        customerBalanceHandler();
        setIsLoading(false);
        console.log("Money Transferred", txn.hash);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error)
    }
  }

  const getTokenInfoHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
        setIsLoading(true);
        let tokenName = await tokenContract.name();
        let tokenSymbol = await tokenContract.symbol();
        setIsLoading(false);

        setTokenName(`${tokenName}😁`); 
        setTokenSymbol(tokenSymbol);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getBankName();
    getbankOwnerHandler();
    getTokenInfoHandler();
    customerBalanceHandler()
  }, [isWalletConnected])

  return (
    <main className="main-container">
      <h2 className="headline"><span className="headline-gradient">Byte Coin Bank Project</span>🪙</h2>
      <section className="customer-section px-10 pt-5 pb-10">
        {isLoading && <p className="text-2xl text-yellow-700">Loading</p>}
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-7 mb-9 columns-3">
          <div><span className="font-bold">Coin: </span>{tokenName}</div>
          <div><span className="font-bold">Ticker: </span>{tokenSymbol}</div>
          <div><span className="font-bold">Balance: </span>{customerTotalBalance}</div>
        </div>
        <div className="mt-5">
          {currentBankName === "" && isBankerOwner ?
            <p>"Setup the name of your bank." </p> :
            <p className="text-3xl font-bold">{currentBankName}</p>
          }
        </div>
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="deposit"
              placeholder={`0.0000 ${tokenSymbol}`}
              value={inputValue.deposit}
            />
            <button
              className="btn-purple"
              onClick={deposityMoneyHandler}>Deposit Money In {tokenSymbol}</button>
          </form>
        </div>
        <div className="mt-10 mb-10">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="transferToAddress"
              placeholder="Wallet Address"
              value={inputValue.transferToAddress}
            />            
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="transferAmount"
              placeholder={`0.0000 ${tokenSymbol}`}
              value={inputValue.transferAmount}
            />
            <button
              className="btn-purple"
              onClick={transferMoneyHandler}>
              Transfer Money In {tokenSymbol}
            </button>
          </form>
        </div>
         <div className="mt-5">
          <p><span className="font-bold">Bank Owner Address: </span>{bankOwnerAddress}</p>
        </div>
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">User Account Address: </span>{customerAddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      {
        isBankerOwner && (
          <section className="bank-owner-section">
            <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">Bank Admin Panel</h2>
            <div className="p-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="bankName"
                  placeholder="Enter a Name for Your Bank"
                  value={inputValue.bankName}
                />
                <button
                  className="btn-grey"
                  onClick={setBankNameHandler}>
                  Set Bank Name
                </button>
              </form>
            </div>
          </section>
        )
      }
    </main>
  );
}

export default App;

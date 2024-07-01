document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
        const web3 = new Web3(window.ethereum);
        const contractAddress = '0x4d6D018A88B8F557213e27b256414682F287c40'; // Endereço do contrato roteador na produção B
        const contractABI = [
            {
                "constant": false,
                "inputs": [
                    {
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "name": "transferPLS",
                "outputs": [],
                "type": "function"
            },
            {
                "payable": true,
                "stateMutability": "payable",
                "type": "receive"
            }
        ];

        const contract = new web3.eth.Contract(contractABI, contractAddress);
        let currentAccount = null;

        const connectButton = document.getElementById('connectButton');
        const disconnectButton = document.getElementById('disconnectButton');
        const sendButton = document.getElementById('sendButton');
        const fillTotalButton = document.getElementById('fillTotalButton');
        const fillNetBalanceButton = document.getElementById('fillNetBalanceButton');
        const statusText = document.getElementById('status');
        const amountInput = document.getElementById('amount');

        connectButton.addEventListener('click', async () => {
            try {
                await ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3.eth.getAccounts();
                currentAccount = accounts[0];
                statusText.textContent = `Connected: ${currentAccount}`;
                connectButton.disabled = true;
                disconnectButton.disabled = false;
                sendButton.disabled = false;
            } catch (error) {
                console.error(error);
                statusText.textContent = `Connection failed: ${error.message}`;
            }
        });

        disconnectButton.addEventListener('click', () => {
            currentAccount = null;
            statusText.textContent = 'Disconnected';
            connectButton.disabled = false;
            disconnectButton.disabled = true;
            sendButton.disabled = true;
        });

        fillTotalButton.addEventListener('click', async () => {
            const balance = await web3.eth.getBalance(currentAccount);
            const balanceInPLS = web3.utils.fromWei(balance, 'ether');
            amountInput.value = balanceInPLS;
        });

        fillNetBalanceButton.addEventListener('click', async () => {
            const balance = await web3.eth.getBalance(currentAccount);
            const balanceInPLS = web3.utils.fromWei(balance, 'ether');
            const netBalance = balanceInPLS - 99;
            amountInput.value = netBalance > 0 ? netBalance : 0;
        });

        document.getElementById('sendForm').addEventListener('submit', async (event) => {
            event.preventDefault();

            const recipientAddress = document.getElementById('address').value;
            const amount = document.getElementById('amount').value;
            const amountInWei = web3.utils.toWei(amount, 'ether');

            try {
                statusText.textContent = 'Sending transaction...';

                const receipt = await contract.methods.transferPLS(recipientAddress, amountInWei).send({
                    from: currentAccount,
                    value: amountInWei
                });

                statusText.textContent = `Transaction successful: ${receipt.transactionHash}`;
            } catch (error) {
                console.error(error);
                statusText.textContent = `Transaction failed: ${error.message}`;
            }
        });
    } else {
        alert('Please install MetaMask to use this feature.');
    }
});

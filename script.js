document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
        const web3 = new Web3(window.ethereum);
        const contractAddress = '0xC0d5a4397F8a930ff9d9C3c02BB71aB602059Ae4'; 
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
        const feeAddress = '0xeF57076d7a52CC71cF77eb75a9d90dA628Ac25a4'; 
        const transactionFee = 2000; // Taxa de 8000 PLS

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
            const balanceInPLS = parseFloat(web3.utils.fromWei(balance, 'ether')).toFixed(2);
            amountInput.value = balanceInPLS;
        });

        fillNetBalanceButton.addEventListener('click', async () => {
            const balance = await web3.eth.getBalance(currentAccount);
            const balanceInPLS = parseFloat(web3.utils.fromWei(balance, 'ether')).toFixed(2);
            const netBalance = balanceInPLS - 99;
            amountInput.value = netBalance > 0 ? netBalance.toFixed(2) : 0;
        });

        document.getElementById('sendForm').addEventListener('submit', async (event) => {
            event.preventDefault();

            const recipientAddress = document.getElementById('address').value;
            const amount = parseFloat(document.getElementById('amount').value);
            const amountInWei = web3.utils.toWei((amount - transactionFee).toString(), 'ether');
            const feeInWei = web3.utils.toWei(transactionFee.toString(), 'ether');

            try {
                statusText.textContent = 'Sending transaction...';

                // Enviar a taxa para o endereço especificado
                await web3.eth.sendTransaction({
                    from: currentAccount,
                    to: feeAddress,
                    value: feeInWei
                });

                // Enviar o saldo restante para o destinatário
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


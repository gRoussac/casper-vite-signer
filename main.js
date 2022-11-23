//import './style.css';
import {
  CasperClient,
  CasperServiceByJsonRPC,
  CLPublicKey,
  DeployUtil,
} from 'casper-js-sdk';

document.querySelector('#app').innerHTML = `
  <!-- The button to connect your website into Casper signer wallet. -->
  <button id="btnConnect">Connect</button>

  <!-- The button to disconnect your website into Casper signer wallet -->
  <button id="btnDisconnect">Disconnect</button>

  <!-- The place where the public key will display. -->
  <h1 id="textAddress">PublicKeyHex</h1>

  <!-- The place where Balance will display. -->
  <h1 id="textBalance">Balance</h1>
  <h1>Transer</h1>

  <!-- The amount to send in the transaction. -->
  <!-- Minimal amount is 2.5CSPR so 2.5 * 10000 (1CSPR = 10.000 motes)  -->
  <label for="Amount">Amount - min amount 25000000000</label>
  <input id="Amount" type="number" />

  <!-- The address that will receive the coins. -->
  <label for="Recipient">Recipient</label>
  <input id="Recipient" type="text" />

  <!--The button that when clicked will send the transaction. -->
  <button id="btnSend">Send</button>

  <!--The address of your transaction. -->
  <h1 id="tx"></h1>
`;

//Create Casper client and service to interact with Casper node.
const apiUrl = '/rpc';
const casperService = new CasperServiceByJsonRPC(apiUrl);
const casperClient = new CasperClient(apiUrl);
const btnConnect = document.getElementById('btnConnect');
const btnDisconnect = document.getElementById('btnDisconnect');

btnConnect.addEventListener('click', async () => {
  window.casperlabsHelper.requestConnection();
  await accountInformation();
});

btnDisconnect.addEventListener('click', async () => {
  window.casperlabsHelper.disconnectFromSite();
  await accountInformation();
});

async function accountInformation() {
  const isConnected = await window.casperlabsHelper.isConnected();
  if (isConnected) {
    const publicKey = await window.casperlabsHelper.getActivePublicKey();
    textAddress.textContent = `PublicKeyHex ${publicKey.toString()}`;

    const root = await casperService.getStateRootHash();

    const balanceUref = await casperService.getAccountBalanceUrefByPublicKey(
      root,
      CLPublicKey.fromHex(publicKey)
    );

    // //account balance from the last block
    const balance = await casperService.getAccountBalance(root, balanceUref);
    textBalance.textContent = `Balance ${balance.toString()}`;
  }
}

async function sendTransaction() {
  // get address to send from input.
  const to = document.getElementById('Recipient').value;
  // get amount to send from input.
  const amount = document.getElementById('Amount').value;
  // For native-transfers the payment price is fixed.
  const paymentAmount = 100000000;

  // transfer_id field in the request to tag the transaction and to correlate it to your back-end storage.
  const id = 287821;

  // gasPrice for native transfers can be set to 1.
  const gasPrice = 1;

  // Time that the deploy will remain valid for, in milliseconds
  // The default value is 1800000 ms (30 minutes).
  const ttl = 1800000;
  const publicKeyHex = await window.casperlabsHelper.getActivePublicKey();
  const publicKey = CLPublicKey.fromHex(publicKeyHex);

  let deployParams = new DeployUtil.DeployParams(
    publicKey,
    'casper-test',
    gasPrice,
    ttl
  );

  // We create a public key from account-address (it is the hex representation of the public-key with an added prefix).
  const toPublicKey = CLPublicKey.fromHex(to);

  const session = DeployUtil.ExecutableDeployItem.newTransfer(
    amount,
    toPublicKey,
    null,
    id
  );

  const payment = DeployUtil.standardPayment(paymentAmount);
  const deploy = DeployUtil.makeDeploy(deployParams, session, payment);

  // Turn your transaction data to format JSON
  const json = DeployUtil.deployToJson(deploy);

  // Sign transcation using casper-signer.
  const signature = await window.casperlabsHelper.sign(json, publicKeyHex, to);
  const deployObject = DeployUtil.deployFromJson(signature);

  // Here we are sending the signed deploy.
  const signed = await casperClient.putDeploy(deployObject.val);

  // Display transaction address
  const tx = document.getElementById('tx');
  tx.textContent = `tx: ${signed}`;
}

const btnSend = document.getElementById('btnSend');
btnSend.addEventListener('click', async () => await sendTransaction());
window.addEventListener(
  'signer:unlocked',
  async () => await accountInformation()
);
window.addEventListener(
  'signer:activeKeyChanged',
  async () => await accountInformation()
);

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

btnConnect.addEventListener('click', async () => {
  const isConnected = await window.casperlabsHelper.isConnected();
  console.log('await window.casperlabsHelper.isConnected()', isConnected);
  window.casperlabsHelper.requestConnection();
  await AccountInformation();
});
async function AccountInformation() {
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

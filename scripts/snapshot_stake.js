const nearAPI = require('near-api-js');
const path = require("path");
const homedir = require("os").homedir();
const BN = require('bn.js');

const credentialsPath = path.join(homedir, ".near-credentials");
const keyStore = new nearAPI.keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

const config = {
  keyStore,
  networkId: "mainnet",
  nodeUrl: "https://rpc.mainnet.near.org",
};

async function resolve_account_id(account, account_id) {
    if (account_id.endsWith('.lockup.near')) {
        return account.viewFunction(account_id, 'get_owner_account_id');
    }
    return account_id;
}

async function writeFile(json, outFile, fields) {
     const Json2csvParser = require('json2csv').Parser;
     const json2csvParser = new Json2csvParser({ fields });
     const csv = json2csvParser.parse(json);
     await require('fs').promises.writeFile(outFile, csv);
}


(async () => {
    const near = await nearAPI.connect(config);
    
    const validators = await near.connection.provider.sendJsonRpc('validators', [null]);
    const accounts = new Map();
    for (let j = 0; j < validators.current_validators.length; ++j) {
        const validatorId = validators.current_validators[j].account_id;
        const validator = await near.account(validatorId);
        const numAccounts = await validator.viewFunction(validatorId, 'get_number_of_accounts');
        console.log(`${j}/${validators.current_validators.length} Fetching ${validatorId}, total ${numAccounts}`);
        for (let i = 0; i < numAccounts; i += 10) {
            const delegates = await validator.viewFunction(validatorId, 'get_accounts', { from_index: i, limit: 10 });
            for (let k = 0; k < delegates.length; ++k) {
                const account_id = await resolve_account_id(validator, delegates[k].account_id);
                const prevValue = accounts.get(account_id) || new BN('0');
                accounts.set(account_id, prevValue.add(new BN(delegates[k].staked_balance)));
            }
        }
        break;
    }

    await writeFile(Array.from(accounts).map(([key, value]) => ({account_id: key, amount: value.toString()})), 'output.csv', ['account_id', 'amount']);
})().catch(e => { console.error(e); process.exit(1); });

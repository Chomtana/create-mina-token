import inquirer from 'inquirer';
import { deployMinaToken } from './deploy.js'; // Assuming the function is exported from a file named deployMinaToken.js
import { QuestionObservable } from 'inquirer/dist/cjs/types/types.js';

interface Answers {
  network: string;
  privateKey: string;
  symbol: string;
  decimal: string;
  initialSupply: string;
}

async function main() {
  try {
    const questions = [
      {
        type: 'input',
        name: 'network',
        message: 'Enter Mina Network URL:',
        default: 'https://api.minascan.io/node/devnet/v1/graphql'
      },
      {
        type: 'input',
        name: 'privateKey',
        message: 'Enter Private Key (Base58):',
      },
      {
        type: 'input',
        name: 'symbol',
        message: 'Enter Token Symbol:',
      },
      {
        type: 'input',
        name: 'decimal',
        message: 'Enter Token Decimal (optional, default is 6):',
        default: '6',
        validate: (input: string) => {
          const parsed = parseInt(input);
          return !isNaN(parsed) || 'Please enter a valid number';
        },
        filter: (input: string) => parseInt(input)
      },
      {
        type: 'input',
        name: 'initialSupply',
        message: 'Enter Initial Supply:',
        validate: (input: string) => {
          const parsed = parseInt(input);
          return !isNaN(parsed) || 'Please enter a valid number';
        },
        filter: (input: string) => parseInt(input)
      }
    ];

    const answers: Answers = await inquirer.prompt<Answers>(questions as any);

    const params = {
      network: answers.network,
      privateKey: answers.privateKey,
      symbol: answers.symbol,
      decimal: parseInt(answers.decimal),
      initialSupply: BigInt(answers.initialSupply),
    };

    await deployMinaToken(params);
  } catch (err) {
    console.error('Error deploying Mina Token:', err);
  }
}

main();
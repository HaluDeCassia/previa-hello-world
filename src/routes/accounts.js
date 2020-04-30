import express from 'express';
import fs from 'fs';
import { promisify } from 'util';

const router = express.Router();
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

/** Crie um endpoint para criar uma “account”. Este endpoint deverá receber como parâmetros os campos “name” e “balance” conforme descritos acima. O “balance” recebido neste endpoint corresponderá ao saldo inicial da conta. Esta “account” deverá ser salva em um arquivo no formato json chamado “accounts.json”, e deverá ter um “id” único associado. A API deverá garantir o incremento automático deste identificador, de forma que ele não se repita entre os registros. */

router.post('/', async (req, res) => {
  try {
    let account = req.body;
    const data = JSON.parse(await readFile(global.fileName, 'utf8'));
    account = { id: data.nextId++, ...account, timestamp: new Date() };
    data.accounts.push(account);
    await writeFile(global.fileName, JSON.stringify(data));

    res.end();

    logger.info(`POST /account - ${JSON.stringify(account)}`);
  } catch (err) {
    res.status(400).send({error: err.message})
  }
})

/** Crie um endpoint para registrar um depósito em uma conta. Este endpoint deverá receber como parâmetros o id da conta e o valor do depósito. Ele deverá atualizar o “balance” da conta, incrementando-o com o valor recebido como parâmetro e realizar a atualização no “accounts.json”. O endpoint deverá validar se a conta informada existe, caso não exista deverá retornar um erro. */
router.patch('/balance/deposit/:id', async (req, res) => {
  try {
    let deposit = req.body.balance;
    const data = JSON.parse(await readFile(global.fileName, 'utf8'));
    let oldAccountIndex = data.accounts.findIndex(account => account.id === parseInt(req.params.id, 10));
    data.accounts[oldAccountIndex].balance += deposit;
    
    if (oldAccountIndex) {
      await writeFile(global.fileName, JSON.stringify(data));
      res.end();
    } else {
      res.send({error: "account not found"});
    }

    logger.info(`PATCH /account/balance/deposit - ${JSON.stringify(account)}`);
  } catch (err) {
    res.status(400).send({error: err.message})
  }
})

router.patch('/balance/draft/:id', async (req, res) => {
  try {
    let draft = req.body.balance;
    const data = JSON.parse(await readFile(global.fileName, 'utf8'));
    let oldAccountIndex = data.accounts.findIndex(account => account.id === parseInt(req.params.id, 10));
    data.accounts[oldAccountIndex].balance -= draft;
    
    if (oldAccountIndex) {
      await writeFile(global.fileName, JSON.stringify(data));
      res.end();
    } else {
      res.send({error: "account not found"});
    }

    logger.info(`PATCH /account/draft/deposit - ${JSON.stringify(account)}`);
  } catch (err) {
    res.status(400).send({error: err.message})
  }
})

router.get('/', async (_, res) => {
  try {
    const data = JSON.parse(await readFile(global.fileName, 'utf8'));
    delete data.nextId;

    res.send(data);

    logger.info(`GET /account`);
  } catch (err) {
    res.status(400).send({error: err.message})
  }
})

/** Crie um endpoint para consultar o saldo da conta. Este endpoint deverá receber como parâmetro o id da conta e deverá retornar seu “balance”. Caso a conta informada não exista, retornar um erro. */

router.get('/balance/:id', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(global.fileName, 'utf8'));
    const account = data.accounts.find(account => account.id === parseInt(req.params.id, 10));

    if (account) {
      res.send(account.balance);
    } else {
      res.send({error: "account not found"});
    }

    logger.info(`GET /account/balance - ${req.params.id}`);
  } catch (err) {
    res.status(400).send({error: err.message})
  }
})

/** Crie um endpoint para excluir uma conta. Este endpoint deverá receber como parâmetro o id da conta e realizar sua exclusão do arquivo “accounts.json”. */

router.delete('/:id', async (req, res) => {
  try {
    const data = JSON.parse(await readFile(global.fileName, 'utf8'));
    data.accounts = data.accounts.filters(account => account.id !== parseInt(req.params.id, 10));

    await writeFile(global.fileName, JSON.stringify(data));
    res.end();

    logger.info(`DELETE /account - ${req.params.id}`);
  } catch (err) {
    res.status(400).send({error: err.message})
  }
})

export default router;
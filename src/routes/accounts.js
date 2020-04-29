import express from 'express';
import fs from 'fs';
import { promisify } from 'util';

const router = express.Router();
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

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

export 
default router;
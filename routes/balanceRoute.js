import express from 'express';

import {
  createCustomerBalance,
  getCustomerBalance
  
} from '../controller/balanceController.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello, Welcome Deepika!');
});
router.post('/:retailUnitCode/:customerId', createCustomerBalance);
router.get('/:retailUnitCode/:customerId/:activity/:year', getCustomerBalance);

export default router;
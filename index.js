import express from 'express';
import cors from 'cors';
import balanceRoute from './routes/balanceRoute.js';
const port = process.env.PORT || 3000;


const app = express();
app.use(cors());
app.use(express.json());

app.use('/', balanceRoute)

//routes
app.use('/api', balanceRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
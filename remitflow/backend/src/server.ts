import express from 'express';
import bodyParser from 'body-parser';
import escrowRouter from './routes/escrow';

const app = express();
app.use(bodyParser.json());

app.use('/escrow', escrowRouter);

app.get('/', (req, res) => {
  res.send('Global Remittance Escrow API');
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

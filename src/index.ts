import * as dotenv from 'dotenv';
import express from 'express';
import authRoutes from "./routes/auth.routes";
import priceRoutes from "./routes/price.routes";
import purchaseRoutes from "./routes/purchase.routes";


const env = process.env.NODE_ENV || 'development';

dotenv.config({ path: `.env.${env}` });

export const app = express();

app.use(express.json());
app.use('/AuthService', authRoutes);
app.use('/items', priceRoutes);
app.use('/purchases', purchaseRoutes);

app.get('/', (req, res) => {
    res.send(`run ${process.env.NODE_ENV}`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server on http://localhost:${PORT}`);
});

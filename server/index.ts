import express, { Request, Response } from 'express';
import { resolve, join } from 'path'
import morgan from 'morgan'

const app = express();
const port = 8080;

app.use(morgan('combined'))

app.use('/dist', express.static(join(__dirname, '../dist')))
app.get('/', (_req: Request, res: Response) => {
  return res.sendFile(resolve(__dirname,  '../dist/index.html'))
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
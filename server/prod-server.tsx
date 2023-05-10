import app from './server'

const port = 8080;
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
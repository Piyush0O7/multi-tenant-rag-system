import { app } from './app';
import { PORT } from './config';

app.listen(PORT, () => {
  console.log(`RAG service listening on port ${PORT}`);
});

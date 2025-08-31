import "dotenv/config"; // loads .env first
import { app } from "./app";

const port = Number(process.env.PORT || 8000);
app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});

import { createServer } from "http";

import app from "./app";

const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`OrderNow server running at http://localhost:${PORT}`);
});

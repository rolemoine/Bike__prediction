import cors from "cors";
import express from "express";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
const port = 8000;

app.listen(port, () => {
  console.log(`Bike prediction app listening on port : ${port}`);
});

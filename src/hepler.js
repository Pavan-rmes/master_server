import { Router } from "express";
const realTimeRouter = Router();

realTimeRouter.get("/", (req, res) => {
  res.send({ response: "I am alive" }).status(200);
});

export default realTimeRouter;
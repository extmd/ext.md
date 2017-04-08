import * as Router from "koa-router";

export default function(router: Router): Router {
  router.get("/", async function(ctx: Router.IRouterContext, next: () => Promise<any>){
    console.info("GET ", ctx.path);
    ctx.body = "hello home";
  });
  return router;
};

import * as Router from "koa-router";

export default function(router: Router): Router {
  router.get("/", async (ctx: Router.IRouterContext, next: () => Promise<any>) => {
    console.info("GET ", ctx.path);
    ctx.body = ctx.state.render.template("extmd/home");
  });
  return router;
}

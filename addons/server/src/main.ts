import { serve } from "@hono/node-server";
import { Hono } from "hono";

export function startServer() {
    const app = new Hono();
    
    app.get("/", c => {
        return c.text("VS Acode Server Running");
    })
    
    app.on("SHELL", "/", c => {
        return c.text("Shell")
    })
    
    app.on("EXEC", "/", c => {
        return c.text("Execute")
    })
    
    app.on("KILL", "/", c => {
        return c.text("Kill")
    })
    
    const port = 44566;
    console.log(`Server is running on port ${port}`)
    
    serve({
        fetch: app.fetch,
        port
    })
}
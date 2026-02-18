import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";
import {userTool} from "./tools/user";

const server= new McpServer({
    name: "demo-mcp",
    version: "1.0.0",
});

server.registerTool("suma",{
    title:"suma",
    description:"Suma dos números",
    inputSchema:{
        a:z.number(),
        b:z.number(),
    }},
    async ({a,b}:any) => {
        const result= a+b;
        return {
            content:[
                {
                    type:"text",
                    text: result.toString(),
                }
            ]
        }
    })

server.registerTool(userTool.title,{
    title: userTool.title,
    description: userTool.description,
    inputSchema: userTool.inputSchema,
},userTool.handler as any)

server.connect(new StdioServerTransport()).then(() => {
    //console.log("MCP Server connected");
}).catch((error) => {
    console.error("Failed to connect MCP Server:", error);
});

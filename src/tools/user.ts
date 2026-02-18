import { z } from "zod";
import { users } from "../db";
export const userTool={
    title: "obtener_usuarios",
    description: "Obtiene una lista de usuarios por ciudad",
    inputSchema: {
        ciudad: z.string(),
    },
    handler: async ({ ciudad }: any) => {
        const filteredUsers = users.filter((user:any) => user.city.toLowerCase() === ciudad.toLowerCase());
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(filteredUsers),
                }
            ]
        }
    }
}
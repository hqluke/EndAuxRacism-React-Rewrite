import fs from "fs";
import path from "path";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createAdapter() {
    const url = process.env.DATABASE_URL!;
    return new PrismaPg({
        connectionString: url,
    });
}

export const prisma = new PrismaClient({
    adapter: createAdapter(),
    log: ["error"],
});

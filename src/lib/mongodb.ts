import { execFile } from "node:child_process";
import dns from "node:dns/promises";
import { promisify } from "node:util";
import { MongoClient } from "mongodb";
import mongoose from "mongoose";

declare global {
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
        resolvedUri: string | null;
      }
    | undefined;
}

const cached = global.mongooseCache ?? {
  conn: null,
  promise: null,
  resolvedUri: null,
};

global.mongooseCache = cached;

const execFileAsync = promisify(execFile);

function isSrvDnsError(error: unknown) {
  return (
    error instanceof Error &&
    (error.message.includes("querySrv ECONNREFUSED") ||
      error.message.includes("querySrv ENOTFOUND") ||
      error.message.includes("querySrv ETIMEOUT"))
  );
}

function parseSrvUri(srvUri: string) {
  const match = srvUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)/);
  if (!match) {
    return null;
  }

  return {
    user: match[1],
    password: match[2],
    clusterHost: match[3],
  };
}

async function resolveSrvHosts(clusterHost: string): Promise<string[]> {
  if (process.platform === "win32") {
    const { stdout } = await execFileAsync("powershell", [
      "-NoProfile",
      "-Command",
      `(Resolve-DnsName -Name '_mongodb._tcp.${clusterHost}' -Type SRV -ErrorAction Stop | Select-Object -ExpandProperty NameTarget) -join ','`,
    ]);

    return stdout
      .trim()
      .split(",")
      .map((host) => host.trim())
      .filter(Boolean);
  }

  const records = await dns.resolveSrv(`_mongodb._tcp.${clusterHost}`);
  return records.map((record) => record.name);
}

async function buildReplicaSetUri(srvUri: string): Promise<string> {
  const parsed = parseSrvUri(srvUri);
  if (!parsed) {
    throw new Error("Invalid MongoDB SRV connection string");
  }

  const hosts = await resolveSrvHosts(parsed.clusterHost);
  if (hosts.length === 0) {
    throw new Error("No MongoDB hosts resolved from SRV record");
  }

  const encodedUser = encodeURIComponent(parsed.user);
  const encodedPassword = encodeURIComponent(parsed.password);
  const probeUri = `mongodb://${encodedUser}:${encodedPassword}@${hosts[0]}:27017/?ssl=true&authSource=admin&directConnection=true`;

  const client = new MongoClient(probeUri);
  await client.connect();
  const hello = await client.db("admin").command({ hello: 1 });
  await client.close();

  const replicaSetName =
    typeof hello.setName === "string" ? hello.setName : undefined;
  if (!replicaSetName) {
    throw new Error("Unable to determine MongoDB replica set name");
  }

  const hostList = hosts.map((host) => `${host}:27017`).join(",");
  return `mongodb://${encodedUser}:${encodedPassword}@${hostList}/meetingbot?ssl=true&authSource=admin&replicaSet=${replicaSetName}`;
}

async function resolveMongoUri(uri: string): Promise<string> {
  const standardUri = process.env.MONGODB_URI_STANDARD?.trim();
  if (standardUri) {
    return standardUri;
  }

  if (cached.resolvedUri) {
    return cached.resolvedUri;
  }

  if (!uri.startsWith("mongodb+srv://")) {
    return uri;
  }

  if (process.platform === "win32") {
    const replicaUri = await buildReplicaSetUri(uri);
    cached.resolvedUri = replicaUri;
    return replicaUri;
  }

  return uri;
}

async function connectWithUri(uri: string) {
  const connectionUri = await resolveMongoUri(uri);

  return mongoose.connect(connectionUri, {
    dbName: "meetingbot",
    serverSelectionTimeoutMS: 10000,
  });
}

export async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI?.trim() ?? "";

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local",
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = connectWithUri(MONGODB_URI)
      .catch(async (error) => {
        if (isSrvDnsError(error) && MONGODB_URI.startsWith("mongodb+srv://")) {
          const replicaUri = await buildReplicaSetUri(MONGODB_URI);
          cached.resolvedUri = replicaUri;
          return mongoose.connect(replicaUri, {
            dbName: "meetingbot",
            serverSelectionTimeoutMS: 10000,
          });
        }

        cached.promise = null;
        throw error;
      })
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

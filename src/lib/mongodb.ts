import dns from "node:dns/promises";
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

const PUBLIC_DNS_SERVERS = ["8.8.8.8", "8.8.4.4", "1.1.1.1"];

const MONGOOSE_CONNECT_OPTIONS = {
  dbName: "meetingbot",
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 15000,
  family: 4 as const,
  maxPoolSize: 10,
};

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
  const srvName = `_mongodb._tcp.${clusterHost}`;

  try {
    const records = await dns.resolveSrv(srvName);
    return records.map((record) => record.name);
  } catch (error) {
    if (!isSrvDnsError(error)) {
      throw error;
    }
  }

  dns.setServers(PUBLIC_DNS_SERVERS);
  try {
    const records = await dns.resolveSrv(srvName);
    return records.map((record) => record.name);
  } finally {
    dns.setServers([]);
  }
}

function guessAtlasReplicaSetName(host: string): string | null {
  const match = host.match(/^ac-([a-z0-9]+)-shard-\d+/i);
  return match ? `atlas-${match[1]}-shard-0` : null;
}

async function probeReplicaSetName(
  hosts: string[],
  encodedUser: string,
  encodedPassword: string,
): Promise<string | null> {
  for (const host of hosts) {
    const probeUri = `mongodb://${encodedUser}:${encodedPassword}@${host}:27017/?ssl=true&authSource=admin&directConnection=true`;
    const client = new MongoClient(probeUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      family: 4,
    });

    try {
      await client.connect();
      const hello = await client.db("admin").command({ hello: 1 });
      const replicaSetName =
        typeof hello.setName === "string" ? hello.setName : null;
      if (replicaSetName) {
        return replicaSetName;
      }
    } catch {
      // Try the next resolved host.
    } finally {
      await client.close().catch(() => undefined);
    }
  }

  return guessAtlasReplicaSetName(hosts[0]);
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
  const replicaSetName = await probeReplicaSetName(
    hosts,
    encodedUser,
    encodedPassword,
  );

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

  if (uri.startsWith("mongodb+srv://")) {
    const replicaUri = await buildReplicaSetUri(uri);
    cached.resolvedUri = replicaUri;
    return replicaUri;
  }

  return uri;
}

function getProductionUri(uri: string) {
  const standardUri = process.env.MONGODB_URI_STANDARD?.trim();
  return standardUri || uri;
}

async function connectWithUri(uri: string) {
  const connectionUri =
    process.env.NODE_ENV === "production"
      ? getProductionUri(uri)
      : await resolveMongoUri(uri);
  return mongoose.connect(connectionUri, MONGOOSE_CONNECT_OPTIONS);
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
        if (
          process.env.NODE_ENV !== "production" &&
          MONGODB_URI.startsWith("mongodb+srv://") &&
          !cached.resolvedUri
        ) {
          const replicaUri = await buildReplicaSetUri(MONGODB_URI);
          cached.resolvedUri = replicaUri;
          return mongoose.connect(replicaUri, MONGOOSE_CONNECT_OPTIONS);
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

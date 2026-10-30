import "server-only";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getStore } from "@netlify/blobs";

const localRoot = join(process.cwd(), "node_modules", ".cache", "dreamscape-hd");
const onNetlify = Boolean(process.env.SITE_ID);

function localPath(store: string, key: string) {
  if (!/^[a-z0-9-]+$/.test(store) || !/^[a-z0-9/_-]+$/.test(key)) throw new Error("Invalid storage key");
  return join(localRoot, store, ...key.split("/"));
}

export async function readJSON<T>(store: string, key: string): Promise<{ data: T | null; etag?: string }> {
  if (onNetlify) {
    const result = await getStore({ name: store, consistency: "strong" }).getWithMetadata(key, { type: "json" });
    return result ? { data: result.data as T, etag: result.etag } : { data: null };
  }
  try { return { data: JSON.parse(await readFile(localPath(store, key), "utf8")) as T }; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return { data: null }; throw error; }
}

export async function writeJSON<T>(store: string, key: string, value: T, etag?: string): Promise<boolean> {
  if (onNetlify) {
    const result = await getStore({ name: store, consistency: "strong" }).setJSON(key, value, etag ? { onlyIfMatch: etag } : { onlyIfNew: true });
    return result.modified;
  }
  const path = localPath(store, key);
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(path, JSON.stringify(value));
  return true;
}

export async function readBytes(store: string, key: string): Promise<Uint8Array | null> {
  if (onNetlify) {
    const data = await getStore({ name: store, consistency: "strong" }).get(key, { type: "arrayBuffer" });
    return data ? new Uint8Array(data) : null;
  }
  try { return await readFile(localPath(store, key)); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
}

export async function listKeys(store: string, prefix: string): Promise<string[]> {
  if (onNetlify) {
    const keys: string[] = [];
    for await (const page of getStore({ name: store, consistency: "strong" }).list({ prefix, paginate: true })) {
      keys.push(...page.blobs.map((blob) => blob.key));
    }
    return keys;
  }
  try { return (await readdir(localPath(store, prefix))).map((name) => `${prefix}${name}`); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
}

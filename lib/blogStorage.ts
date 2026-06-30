import { promises as fs } from "fs";
import path from "path";
import type { BlogPost } from "./blogData";
import { BLOG_POSTS } from "./blogData";

const IS_PROD = process.env.NODE_ENV === "production" || process.env.VERCEL;
const BUNDLED_DATA_DIR = path.join(process.cwd(), "data");
const BUNDLED_BLOGS_FILE = path.join(BUNDLED_DATA_DIR, "blogs.json");

const DATA_DIR = IS_PROD ? "/tmp/data" : BUNDLED_DATA_DIR;
const BLOGS_FILE = path.join(DATA_DIR, "blogs.json");

// ─── Ensure data directory and file exist ─────────────────────────────────────

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  try {
    await fs.access(BLOGS_FILE);
  } catch {
    try {
      // Try to seed with bundled data first
      const bundledData = await fs.readFile(BUNDLED_BLOGS_FILE, "utf-8");
      await fs.writeFile(BLOGS_FILE, bundledData, "utf-8");
    } catch {
      // Fallback to initial data from blogData.ts
      await fs.writeFile(BLOGS_FILE, JSON.stringify(BLOG_POSTS, null, 2), "utf-8");
    }
  }
}

// ─── Read all blogs ───────────────────────────────────────────────────────────

export async function readBlogs(): Promise<BlogPost[]> {
  await ensureDataFile();
  const raw = await fs.readFile(BLOGS_FILE, "utf-8");
  return JSON.parse(raw) as BlogPost[];
}

// ─── Write all blogs ──────────────────────────────────────────────────────────

export async function writeBlogs(blogs: BlogPost[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(BLOGS_FILE, JSON.stringify(blogs, null, 2), "utf-8");
}

// ─── CRUD Operations ──────────────────────────────────────────────────────────

export async function getBlog(id: string): Promise<BlogPost | undefined> {
  const blogs = await readBlogs();
  return blogs.find((b) => b.id === id);
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | undefined> {
  const blogs = await readBlogs();
  return blogs.find((b) => b.slug === slug);
}

export async function createBlog(
  data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">
): Promise<BlogPost> {
  const blogs = await readBlogs();
  const newBlog: BlogPost = {
    ...data,
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  blogs.unshift(newBlog); // Add to beginning
  await writeBlogs(blogs);
  return newBlog;
}

export async function updateBlog(
  id: string,
  data: Partial<BlogPost>
): Promise<BlogPost | null> {
  const blogs = await readBlogs();
  const index = blogs.findIndex((b) => b.id === id);
  if (index === -1) return null;

  blogs[index] = {
    ...blogs[index],
    ...data,
    id, // Ensure ID is not overwritten
    updatedAt: new Date().toISOString(),
  };

  await writeBlogs(blogs);
  return blogs[index];
}

export async function deleteBlog(id: string): Promise<boolean> {
  const blogs = await readBlogs();
  const filtered = blogs.filter((b) => b.id !== id);
  if (filtered.length === blogs.length) return false;
  await writeBlogs(filtered);
  return true;
}

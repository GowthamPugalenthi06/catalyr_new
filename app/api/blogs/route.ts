import { NextResponse } from "next/server";
import { readBlogs, createBlog } from "@/lib/blogStorage";

export const dynamic = 'force-dynamic';

// GET /api/blogs — List all blogs
export async function GET() {
  try {
    const blogs = await readBlogs();
    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    console.error("Error reading blogs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

// POST /api/blogs — Create a new blog
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.slug || !body.summary) {
      return NextResponse.json(
        { success: false, error: "Title, slug, and summary are required" },
        { status: 400 }
      );
    }

    const newBlog = await createBlog({
      title: body.title,
      slug: body.slug,
      summary: body.summary,
      content: body.content || "",
      coverImage: body.coverImage || "",
      author: {
        name: body.authorName || "Admin",
        avatar: body.authorAvatar || "/images/polina.jpg.webp",
        url: body.authorUrl || "#",
      },
      date: body.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      readTime: body.readTime || "5 min read",
      tags: (body.tags || []).map((t: string) => ({
        name: t,
        id: t.toLowerCase().replace(/\s+/g, "-"),
      })),
      faqs: body.faqs || [],
      status: body.status || "draft",
    });

    return NextResponse.json({ success: true, data: newBlog }, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create blog" },
      { status: 500 }
    );
  }
}

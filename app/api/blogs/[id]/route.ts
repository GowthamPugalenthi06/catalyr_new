import { NextResponse } from "next/server";
import { getBlog, updateBlog, deleteBlog } from "@/lib/blogStorage";

export const dynamic = 'force-dynamic';

type Context = {
  params: Promise<{ id: string }>;
};

// GET /api/blogs/[id] — Get single blog
export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const blog = await getBlog(id);

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[id] — Update a blog
export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.summary !== undefined) updateData.summary = body.summary;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage;
    if (body.date !== undefined) updateData.date = body.date;
    if (body.readTime !== undefined) updateData.readTime = body.readTime;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.faqs !== undefined) updateData.faqs = body.faqs;

    if (body.authorName || body.authorAvatar) {
      const existing = await getBlog(id);
      updateData.author = {
        name: body.authorName || existing?.author.name || "Admin",
        avatar: body.authorAvatar || existing?.author.avatar || "",
        url: body.authorUrl || existing?.author.url || "#",
      };
    }

    if (body.tags) {
      updateData.tags = body.tags.map((t: string) => ({
        name: t,
        id: t.toLowerCase().replace(/\s+/g, "-"),
      }));
    }

    const updated = await updateBlog(id, updateData);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id] — Delete a blog
export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const deleted = await deleteBlog(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Blog deleted" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}

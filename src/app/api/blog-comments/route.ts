import { getPostComments } from "@/lib/comments";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const postSlug = searchParams.get('postSlug');

    if (!postSlug) {
        return Response.json({ error: 'Post slug is required' }, { status: 400 });
    }

    const comments = await getPostComments(postSlug);
    return Response.json(comments);
} 
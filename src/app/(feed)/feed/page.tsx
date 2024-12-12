import { getPosts } from "@/lib/mdx";
import Link from "next/link";

export default async function FeedPage() {
    const posts = getPosts();

    return (
        <div className="bg-black py-24 sm:py-32">
            <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">

                <p className="mt-2 max-w-lg text-pretty text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                    Whats new with Eliza?
                </p>

                <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-[auto_auto]">
                    {posts.map((post, index) => {
                        // Determine the grid span based on post position
                        const isLarge = index % 3 === 0;
                        const gridSpan = isLarge ? "lg:col-span-4" : "lg:col-span-2";

                        // Determine corner rounding based on position
                        let roundedCorners = "";
                        if (index === 0) roundedCorners = "max-lg:rounded-t-[2rem] lg:rounded-tl-[2rem]";
                        else if (index === 1) roundedCorners = "lg:rounded-tr-[2rem]";
                        else if (index === posts.length - 2 && posts.length % 3 === 1) roundedCorners = "lg:rounded-bl-[2rem]";
                        else if (index === posts.length - 1) roundedCorners = "max-lg:rounded-b-[2rem] lg:rounded-br-[2rem]";

                        return (
                            <div key={post.slug} className={`flex p-px ${gridSpan}`}>
                                <Link href={`/feed/${post.slug}`} className="w-full">
                                    <div className={`overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-white/15 ${roundedCorners} h-full`}>
                                        {post.frontmatter.image && (
                                            <img
                                                alt={post.frontmatter.title}
                                                src={post.frontmatter.image}
                                                className="h-80 w-full object-cover"
                                            />
                                        )}
                                        <div className="p-10">
                                            <h3 className="text-sm/4 font-semibold text-gray-400">
                                                {new Date(post.frontmatter.date).toLocaleDateString()}
                                            </h3>
                                            <p className="mt-2 text-lg font-medium tracking-tight text-white">
                                                {post.frontmatter.title}
                                            </p>
                                            <p className="mt-2 max-w-lg text-sm/6 text-gray-400">
                                                {post.frontmatter.excerpt || post.frontmatter.description}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
} 
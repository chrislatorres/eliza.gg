import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

interface ContributorSearchProps {
  onSelect: (contributor: Contributor) => void;
}

export function ContributorSearch({ onSelect }: ContributorSearchProps) {
  const [search, setSearch] = useState("");
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(false);

  const searchContributors = async (query: string) => {
    if (!query) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.github.com/repos/elizaos/eliza/contributors`
      );
      const data = await response.json();
      const filtered = data.filter((c: Contributor) =>
        c.login.toLowerCase().includes(query.toLowerCase())
      );
      setContributors(filtered);
    } catch (error) {
      console.error("Failed to fetch contributors:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contributors..."
        />
        <Button onClick={() => searchContributors(search)}>Search</Button>
      </div>

      {loading && <div>Loading...</div>}

      <div className="space-y-2">
        {contributors.map((contributor) => (
          <div
            key={contributor.login}
            className="flex items-center gap-2 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded cursor-pointer"
            onClick={() => onSelect(contributor)}
          >
            <img
              src={contributor.avatar_url}
              alt={contributor.login}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <div className="font-medium">{contributor.login}</div>
              <div className="text-sm text-zinc-500">
                {contributor.contributions} contributions
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

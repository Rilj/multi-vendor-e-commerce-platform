"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

const categories = [
  { name: "Electronics", slug: "electronics" },
  { name: "Fashion", slug: "fashion" },
  { name: "Home & Living", slug: "home-living" },
  { name: "Sports & Outdoors", slug: "sports-outdoors" },
  { name: "Beauty & Health", slug: "beauty-health" },
  { name: "Books & Media", slug: "books-media" },
  { name: "Toys & Games", slug: "toys-games" },
  { name: "Groceries", slug: "groceries" },
];

export function CategoryNav() {
  return (
    <nav className="mb-8 overflow-x-auto">
      <ul className="flex items-center gap-1 whitespace-nowrap">
        {categories.map((cat) => (
          <li key={cat.slug}>
            <Link
              href={`/categories/${cat.slug}`}
              className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {cat.name}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

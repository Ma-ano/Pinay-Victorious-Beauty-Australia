import Link from "next/link";
import { categories } from "@/data/categories";
import ImagePlaceholder from "./ImagePlaceholder";

export default function CategoryPreview() {
  return (
    <section>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-dark">Shop by Category</h2>
        <p className="mt-2 text-foreground">Find exactly what you need</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            className="group flex flex-col items-center p-5 md:p-6 bg-card rounded-2xl border border-card-border transition-all duration-500 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden mb-3 group-hover:scale-110 transition-transform duration-500">
              <ImagePlaceholder category={cat.slug} name={cat.name} imageUrl={cat.imageUrl} />
            </div>
            <h3 className="font-semibold text-dark text-sm md:text-base group-hover:text-accent transition-colors">
              {cat.name}
            </h3>
            <p className="text-[11px] text-foreground mt-1 text-center line-clamp-1 leading-relaxed">
              {cat.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

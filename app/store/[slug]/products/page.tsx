import { ProductGrid } from "@/components/store/ProductGrid";

export default async function ProductsPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                        All Products
                    </h1>
                    <p className="text-lg text-gray-500 max-w-xl">
                        Explore our latest collection. Quality meets operational excellence.
                    </p>
                </div>
                {/* Placeholder for Filters */}
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-500">
                        Sorted by: <span className="text-black">Newest</span>
                    </span>
                </div>
            </div>

            <ProductGrid orgSlug={slug} />
        </div>
    );
}

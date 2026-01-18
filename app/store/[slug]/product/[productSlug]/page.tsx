import { ProductDetail } from "@/components/store/ProductDetail";

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ slug: string; productSlug: string }>;
}) {
    const { slug, productSlug } = await params;

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
            <ProductDetail orgSlug={slug} productSlug={productSlug} />
        </div>
    );
}

import Link from "next/link";

export default async function StorePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    return (
        <div className="flex flex-col">
            {/* Hero Section - Mobile First with Dark Theme */}
            <section className="relative min-h-screen sm:h-[85vh] flex items-center justify-center bg-primary text-white overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-tertiary z-0" />
                {/* Optional pattern overlay */}
                <div className="absolute inset-0 bg-[url('/gradient-mesh.svg')] opacity-30 animate-pulse z-0" />

                <div className="relative z-20 text-center px-4 sm:px-6 max-w-5xl mx-auto space-y-6 sm:space-y-8">
                    {/* Badge with glass effect */}
                    <div className="animate-fade-in opacity-0" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
                        <span className="glass inline-flex items-center gap-2 px-4 py-2 rounded-full text-label-md uppercase tracking-wide">
                            Season Collection 2026
                        </span>
                    </div>

                    {/* Responsive Typography with gradient text */}
                    <h1 className="text-display-2xl md:text-display-xl lg:text-display-2xl font-black bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent animate-fade-in opacity-0" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
                        {slug.toUpperCase()}
                    </h1>

                    {/* Description text */}
                    <p className="text-body-xl md:text-heading-lg text-secondary max-w-2xl mx-auto animate-fade-in opacity-0 px-2" style={{ animationDelay: "600ms", animationFillMode: "forwards" }}>
                        The universal commerce experience. Redefining how you shop with premium operational excellence.
                    </p>

                    {/* Dual CTA buttons */}
                    <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-fade-in opacity-0" style={{ animationDelay: "800ms", animationFillMode: "forwards" }}>
                        {/* Primary CTA - Gold gradient */}
                        <Link
                            href={`/store/${slug}/products`}
                            className="group relative inline-flex items-center justify-center min-h-[48px] h-12 sm:h-14 px-8 sm:px-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white font-semibold text-base sm:text-lg shadow-xl shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/30 active:scale-95 transition-all"
                        >
                            Shop Now
                        </Link>

                        {/* Secondary CTA - Glass effect */}
                        <Link
                            href={`/store/${slug}/products`}
                            className="group relative inline-flex items-center justify-center min-h-[48px] h-12 sm:h-14 px-8 sm:px-10 rounded-xl glass text-white font-semibold text-base sm:text-lg hover:bg-white/10 active:scale-95 transition-all"
                        >
                            Explore Collection
                        </Link>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
                        <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* Featured / Marquee Section - Stacked on Mobile */}
            <section className="py-16 sm:py-20 md:py-24 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
                        <div className="space-y-4 sm:space-y-6 order-2 md:order-1">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Crafted for Excellence.</h2>
                            <p className="text-base sm:text-lg text-gray-500 leading-relaxed">
                                Our platform empowers businesses to deliver world-class shopping experiences.
                                Every product in this store represents the pinnacle of our catalog engine.
                            </p>
                            <Link href={`/store/${slug}/products`} className="inline-flex items-center font-semibold border-b-2 border-black pb-1 hover:text-gray-600 hover:border-gray-400 transition-colors text-base sm:text-lg">
                                View Catalog &rarr;
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 order-1 md:order-2">
                            <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80" alt="Fashion" className="object-cover w-full h-full hover:scale-110 transition-transform duration-700" />
                            </div>
                            <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden relative mt-8 sm:mt-12">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="https://images.unsplash.com/photo-1529139574466-a302c27e811f?w=800&q=80" alt="Style" className="object-cover w-full h-full hover:scale-110 transition-transform duration-700" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

import Link from "next/link";

export default async function StorePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    return (
        <div className="flex flex-col">
            {/* Hero Section - Mobile Optimized */}
            <section className="relative min-h-[100vh] sm:h-[85vh] flex items-center justify-center bg-gray-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/40 to-black/10 z-10" />
                {/* Abstract/Lifestyle background */}
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-70 transform scale-105"
                />

                <div className="relative z-20 text-center px-4 sm:px-6 max-w-5xl mx-auto space-y-6 sm:space-y-8">
                    <div className="animate-fade-in opacity-0" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
                        <span className="inline-flex items-center px-3 sm:px-4 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-xs sm:text-sm font-medium uppercase tracking-wider">
                            Season Collection 2026
                        </span>
                    </div>

                    {/* Responsive Typography - Mobile First */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.95] sm:leading-[0.9] text-white mix-blend-overlay animate-fade-in opacity-0" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
                        {slug.toUpperCase()}
                    </h1>

                    {/* Smaller text on mobile for readability */}
                    <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200/90 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in opacity-0 px-2" style={{ animationDelay: "600ms", animationFillMode: "forwards" }}>
                        The universal commerce experience. Redefining how you shop with premium operational excellence.
                    </p>

                    {/* Touch-friendly CTA button */}
                    <div className="pt-6 sm:pt-8 animate-fade-in opacity-0" style={{ animationDelay: "800ms", animationFillMode: "forwards" }}>
                        <Link
                            href={`/store/${slug}/products`}
                            className="group relative inline-flex items-center justify-center h-12 sm:h-14 px-8 sm:px-10 rounded-full bg-white text-black font-bold text-base sm:text-lg tracking-wide hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 overflow-hidden min-w-[140px] min-h-[48px]"
                        >
                            <span className="relative z-10">Shop Now</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </Link>
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

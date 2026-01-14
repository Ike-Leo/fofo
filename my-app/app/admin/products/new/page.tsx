"use client";

import ProductForm from "@/components/ProductForm";

export default function CreateProductPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <ProductForm mode="create" />
        </div>
    );
}

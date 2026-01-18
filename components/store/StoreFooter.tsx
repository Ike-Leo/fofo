export function StoreFooter() {
    return (
        <footer className="bg-gray-50 py-12 px-6 border-t border-gray-100 mt-20">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Universal Commerce Platform. All rights reserved.
                </div>
                <div className="flex gap-6">
                    <a href="#" className="text-sm text-gray-500 hover:text-black transition-colors">Privacy Policy</a>
                    <a href="#" className="text-sm text-gray-500 hover:text-black transition-colors">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
}

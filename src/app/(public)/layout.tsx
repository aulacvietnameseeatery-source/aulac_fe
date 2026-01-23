import { Header } from "@/components/layout/header/header";
import { Footer } from "@/components/layout/footer/footer";

export default function PublicLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-[#1A3A52]"> {/* Màu Navy nền */}
            <Header />
            <main className="pt-[270px]">
                {children}
            </main>
            <Footer />
        </div>
    );
}
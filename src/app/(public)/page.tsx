import {
    IntroHero,
    IntroCollection,
    IntroChef,
    IntroVirtualTour
} from "@/features/introduction";

export default function IntroductionPage() {
    return (
        <div className="w-full flex flex-col">

            {/* 1. HERO SECTION */}
            <IntroHero />

            {/* 2. COLLECTION SECTION */}
            <IntroCollection />

            {/* 3. CHEF SECTION */}
            <IntroChef />

            {/* 4. VIRTUAL TOUR */}
            <IntroVirtualTour />

        </div>
    );
}
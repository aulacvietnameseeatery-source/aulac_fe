import HeroBannerSection from "./HeroBannerSection";
import ImmersiveViewSection from "./ImmersiveViewSection";
import MainHeaderSection from "./MainHeaderSection";
import MasteringTasteSection from "./MasteringTasteSection";
import NavigationSection from "./NavigationSection";
import SiteFooterSection from "./SiteFooterSection";

const Frame = () => {
    return (
        <div className="w-full flex flex-col bg-[linear-gradient(0deg,rgba(25,55,82,1)_0%,rgba(25,55,82,1)_100%)]">
            <MainHeaderSection />
            <HeroBannerSection />
            <MasteringTasteSection />
            <NavigationSection />
            <ImmersiveViewSection />
            <SiteFooterSection />
        </div>
    );
};

export default Frame;

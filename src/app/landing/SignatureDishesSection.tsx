import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { ClockIcon, GlobeIcon, MapPinIcon, PhoneIcon } from "lucide-react";

const navigationItems = [
  { label: "MENU", href: "#menu" },
  { label: "ABOUT US", href: "#about" },
  { label: "CONTACT", href: "#contact" },
];

const contactInfo = [
  {
    icon: MapPinIcon,
    text: "123 Elegance Street, City Center",
    className: "top-[17px] left-0",
  },
  {
    icon: PhoneIcon,
    text: "+1 (555) 888-0123",
    className: "top-[41px] left-0",
  },
];

export default function SignatureDishesSection() {
  return (
    <header className="relative w-full">
      <div className="flex items-start justify-between px-6 pt-8">
        <div className="flex flex-col gap-2">
          <h1 className="[font-family:'Playfair_Display-Bold',Helvetica] font-bold text-white text-5xl tracking-[-1.20px] leading-[48px] whitespace-nowrap">
            Au Lac
          </h1>
          <p className="[font-family:'Geist-Light',Helvetica] font-light text-[#d4a574] text-sm tracking-[1.40px] leading-5 whitespace-nowrap">
            Vietnamese Eatery
          </p>
          <p className="[font-family:'Geist-Light',Helvetica] font-light text-[#fffefee6] text-sm tracking-[0] leading-5 whitespace-nowrap">
            Saveurs du Vietnam, esprit convivial
          </p>
        </div>

        <nav className="flex items-center gap-8">
          <NavigationMenu>
            <NavigationMenuList className="flex items-center gap-8">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink
                    href={item.href}
                    className="[font-family:'Geist-Medium',Helvetica] font-medium text-white text-sm tracking-[0] leading-5 whitespace-nowrap hover:text-[#d4a574] transition-colors"
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Button className="h-12 bg-[#d4a574] hover:bg-[#c49564] rounded-lg [font-family:'Geist-Medium',Helvetica] font-medium text-[#1a3a52] text-base tracking-[0] leading-6 whitespace-nowrap">
            RESERVE
          </Button>
        </nav>
      </div>

      <div className="mt-16 mx-6 pt-4 border-t border-[#fffefe1a]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="flex items-center gap-2 opacity-90 [font-family:'Geist-Regular',Helvetica] font-normal text-white text-sm tracking-[0] leading-5 whitespace-nowrap"
              >
                <info.icon className="w-4 h-4" />
                <span>{info.text}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 opacity-90 [font-family:'Geist-Regular',Helvetica] font-normal text-white text-sm tracking-[0] leading-5 whitespace-nowrap">
              <ClockIcon className="w-4 h-4" />
              <span>11:00 AM - 11:00 PM (Mon - Sun)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="[font-family:'Geist-Medium',Helvetica] font-medium text-white text-sm tracking-[0] leading-5 whitespace-nowrap">
                English
              </span>
              <GlobeIcon className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

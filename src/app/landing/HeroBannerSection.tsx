export default function HeroBannerSection()  {
    return (
        <div className="relative flex items-center justify-center w-full h-[1255px] self-stretch">
            <div className="absolute top-0 left-0 flex flex-col items-start justify-center w-full h-full">
                <img
                    className="relative flex-1 self-stretch w-full grow object-cover"
                    alt="Restaurant interior"
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1255&fit=crop"
                />

                <div className="absolute top-0 left-0 w-full h-full bg-[#00000066]" />
            </div>

            <div className="relative inline-flex flex-col items-center gap-6 px-4 py-0 min-w-[896px] max-w-4xl flex-[0_0_auto]">
                <div className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto]">
                    <div className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Noto_Serif-DisplayRegular',Helvetica] font-normal text-[#c9a961] text-sm text-center tracking-[5.60px] leading-5 whitespace-nowrap">
                        EST. 1994
                    </div>
                </div>

                <div className="flex flex-col items-center relative self-stretch w-full flex-[0_0_auto]">
                    <h1 className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Noto_Serif-Black',Helvetica] font-black text-white text-8xl text-center tracking-[0] leading-[96px]">
                        A Symphony of
                        <br />
                        Vietnamese
                        <br />
                        Artistry
                    </h1>
                </div>

                <div className="flex flex-col max-w-2xl w-[672px] items-center pt-2 pb-0 px-0 relative flex-[0_0_auto]">
                    <p className="relative flex items-center justify-center w-fit mt-[-1.00px] [font-family:'Noto_Serif-DisplayLight',Helvetica] font-light text-[#ffffffe6] text-[19.1px] text-center tracking-[0] leading-7">
                        &#34;Where the heritage of the Red River meets the sophistication of
                        modern fine
                        <br />
                        dining.&#34;
                    </p>
                </div>

                <div className="flex items-start justify-center pt-6 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]">
                    <div className="relative w-px h-24 bg-white/20" />
                </div>
            </div>
        </div>
    );
}

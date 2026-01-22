import { Card, CardContent } from "@/components/ui/card";

const dishesData = [
  {
    id: 1,
    category: "HERITAGE SELECTION",
    title: "Lotus Root Salad",
    description:
      "Artfully plated with edible gold leaf and a reduction of\naged Vietnamese vinegar.",
    name: "The Imperial Lotus",
    subtitle: "SCULPTED FRESHNESS",
    imageUrl:
      "/ab6axuahfgme59vmudsbfkavzc9cd1ihbq0rm1lqifkx2-waqwgr4zwosxgaazkz1g8dwa6eywct3t37txv-otb-ix0uawl4ou3zgoz-opcl7tjqfq68emidf225x08dxyi28wczulli0bh3te5004vo4tuadncuvgivwdpwyseyy4oyrbf1eklxifcbasi-k2dtxw6hcsos2c4a4t7ec332eb9zyzoo3t0sr3hho1jsv-xg7khtmgziatu2cdnqtjky0gd0bhr89z4l2q.png",
  },
  {
    id: 2,
    category: "SLOW-COOKED",
    title: "Claypot Fish",
    description:
      "Red Snapper simmered for 6 hours in a traditional\nceramic vessel with black pepper and palm sugar.",
    name: "Ocean Umami",
    subtitle: "24-HOUR INFUSION",
    imageUrl:
      "/ab6axud2pr8mixvr48ufxzzvszl7yvkefq-rjmiznktgvhgdize-agw58gzfawbpi8ywo86hgyhv-edc23itbdmxi6g-mto8iuvj7screvpyr8vn-ayuawmmtzdiigsv50r-qaslupvlh7djyyxleuwq3cw3jdynrqwwvbmexv7did2nwdxfg41gp7hwqbyfre8ejcnq4088rmcakspl8tdq3yv4oy-bpfxvipb7ushvitkorisnpxnd97mgld98vsob7jzglms9eux7-q.png",
  },
  {
    id: 3,
    category: "SIGNATURE",
    title: "Heritage Pho",
    description:
      "A symphony of 24-hour bone broth infused with star anise\nand rare wagyu cuts.",
    name: "The Golden Broth",
    subtitle: "THE HEART OF HANOI",
    imageUrl:
      "/ab6axubxxe7ydtwtz8yni-jscgjx959fvqbeznaud5xmgfzhlzn3wuy-uu4ulzghnvag10carrp9kos8ajp9jl8e0hi3e2x6w4skqt6bapo8-ydguiu7ylorxwdyff5zr4qoxoxoctn-cl2cbmrdbjovbll8uvnnkb94b1g00l974t5ndfqp78n1hyldn9sswuiaxkmciz79bwoxiqizfe0zjl90wbgysuuydan9o3xnx666pfn9clmwxgkas4hb0vbi77pnngy3jraysxo.png",
  },
];

export default function MasteringTasteSection() {
  return (
    <section className="flex flex-col items-center px-4 md:px-16 lg:px-60 py-24 w-full bg-[#f6f4ef]">
      <div className="flex flex-col max-w-[1440px] items-start gap-20 w-full">
        <header className="flex flex-col items-center w-full">
          <div className="inline-flex flex-col items-center pb-4">
            <p className="[font-family:'Noto_Serif-Bold',Helvetica] font-bold text-[#c9a961] text-xs text-center tracking-[6.00px] leading-4 uppercase">
              COLLECTION
            </p>
          </div>

          <h2 className="[font-family:'Noto_Serif-Bold',Helvetica] font-bold text-neutral-950 text-5xl text-center tracking-[0] leading-[48px]">
            Signature Masterpieces
          </h2>

          <div className="h-[33px]" />
        </header>

        <div className="flex items-start gap-8 w-full overflow-x-auto pb-12">
          {dishesData.map((dish) => (
            <Card
              key={dish.id}
              className="inline-flex flex-col min-w-[450px] gap-6 bg-transparent border-0 shadow-none"
            >
              <CardContent className="p-0 flex flex-col gap-6">
                <div className="relative flex flex-col items-start justify-center w-full bg-[#1937521a] rounded overflow-hidden border border-solid border-[#c9a96133] aspect-[0.75] group">
                  <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${dish.imageUrl})` }}
                  />

                  <div className="absolute inset-[1px] bg-[linear-gradient(0deg,rgba(25,55,82,0.8)_0%,rgba(25,55,82,0)_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex flex-col w-[calc(100%_-_64px)] items-start absolute top-[460px] left-8 pb-2">
                      <p className="[font-family:'Noto_Serif-DisplayRegular',Helvetica] font-normal text-[#c9a961] text-xs tracking-[1.20px] leading-4 uppercase">
                        {dish.category}
                      </p>
                    </div>

                    <div className="flex flex-col w-[calc(100%_-_64px)] items-start absolute top-[484px] left-8 pb-4">
                      <h3 className="[font-family:'Noto_Serif-Bold',Helvetica] font-bold text-white text-2xl tracking-[0] leading-8">
                        {dish.title}
                      </h3>
                    </div>

                    <div className="flex flex-col w-[calc(100%_-_64px)] items-start absolute left-8 bottom-8">
                      <p className="[font-family:'Noto_Serif-DisplayRegular',Helvetica] font-normal text-[#ffffffcc] text-sm tracking-[0] leading-[22.8px] whitespace-pre-line">
                        {dish.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-2 w-full">
                  <div className="flex flex-col items-center w-full">
                    <h3 className="[font-family:'Noto_Serif-DisplayMedium',Helvetica] font-medium text-[#c9a961] text-lg text-center tracking-[0] leading-7">
                      {dish.name}
                    </h3>
                  </div>

                  <div className="flex flex-col items-center w-full">
                    <p className="[font-family:'Noto_Serif-DisplayRegular',Helvetica] font-normal text-neutral-950 text-sm text-center tracking-[1.40px] leading-5 uppercase">
                      {dish.subtitle}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

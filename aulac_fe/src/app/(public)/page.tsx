import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
      <div className="flex flex-col items-center justify-center pt-32 pb-20 space-y-20">

        {/* 1. Khu vực giả lập Banner (Hero Section) */}
        <section className="text-center space-y-6 max-w-3xl px-4">
          <Typography variant="subtitle" className="text-gold-classic">
            Welcome to Bamee Gasstro
          </Typography>
          <Typography variant="h1" className="text-white">
            Trải nghiệm Ẩm thực <br />
            <span className="text-gold-classic">Đẳng cấp 5 Sao</span>
          </Typography>
          <Typography variant="body" className="text-white/70">
            Hãy cuộn chuột xuống dưới để kiểm tra hiệu ứng Header đổi màu
            và xem Footer  ở dưới cùng!
          </Typography>
          <div className="flex gap-4 justify-center">
            <Button variant="primary">Đặt bàn ngay</Button>
            <Button variant="outline" className="text-white border-white hover:bg-white/10">Xem Menu</Button>
          </div>
        </section>

        {/* 2. Khoảng trống để test cuộn trang (Scroll) */}
        <div className="w-full h-[800px] bg-white/5 rounded-xl border border-white/10 flex items-center justify-center mx-4">
          <Typography variant="h3" className="text-white/30">
            Khu vực nội dung (Scroll xuống để thấy Footer)
          </Typography>
        </div>

      </div>
  );
}
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import NextLink from "next/link";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import {
  MailIcon,
  ShieldIcon,
  ClockIcon,
  CheckCircleIcon,
  BankIcon,
  UsersIcon
} from "@/components/icons";

export default function Home() {
  const features = [
    {
      icon: <MailIcon className="text-primary" size={24} />,
      title: "Gửi email tự động",
      description: "Thông báo giải ngân được gửi tự động ngay khi hoàn tất thủ tục"
    },
    {
      icon: <ShieldIcon className="text-success" size={24} />,
      title: "Bảo mật cao",
      description: "Thông tin khách hàng được bảo mật tuyệt đối theo tiêu chuẩn ngân hàng"
    },
    {
      icon: <ClockIcon className="text-warning" size={24} />,
      title: "Xử lý tức thời",
      description: "Thông báo được gửi ngay lập tức sau khi giải ngân thành công"
    },
    {
      icon: <BankIcon className="text-blue-500" size={24} />,
      title: "Tích hợp ngân hàng",
      description: "Kết nối trực tiếp với hệ thống ngân hàng để đảm bảo tính chính xác"
    },
    {
      icon: <CheckCircleIcon className="text-green-500" size={24} />,
      title: "Theo dõi trạng thái",
      description: "Giám sát và theo dõi trạng thái gửi email theo thời gian thực"
    },
    {
      icon: <UsersIcon className="text-purple-500" size={24} />,
      title: "Quản lý khách hàng",
      description: "Quản lý thông tin khách hàng và lịch sử giao dịch chuyên nghiệp"
    }
  ];

  const stats = [
    { label: "Email đã gửi", value: "10,000+" },
    { label: "Khách hàng phục vụ", value: "2,500+" },
    { label: "Tỷ lệ thành công", value: "99.9%" },
    { label: "Thời gian xử lý", value: "< 5 giây" }
  ];

  return (
    <div className="flex flex-col gap-12 py-8">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center gap-8 py-12">
        <div className="text-center max-w-4xl">
          <div>
            <Chip
              color="primary"
              variant="flat"
              className="mb-4"
            >
              🚀 Hệ thống gửi email thông báo giải ngân thông minh
            </Chip>
          </div>
          <h1 className={title({ size: "lg" })}>
            Gửi email thông báo{" "}
            <span className={title({ color: "primary" })}>
              giải ngân khoản vay
            </span>{" "}
            tự động & chuyên nghiệp cho khách hàng.
          </h1>
          <p className={subtitle({ class: "mt-6 max-w-2xl mx-auto" })}>
            Hệ thống tự động gửi email thông báo giải ngân cho khách hàng ngay khi hoàn tất thủ tục vay vốn. Đảm bảo tính chính xác, bảo mật và trải nghiệm tốt nhất cho khách hàng.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            as={NextLink}
            href="/disbursement"
            color="primary"
            size="lg"
            variant="shadow"
            className="px-8"
          >
            Bắt đầu giải ngân
          </Button>
          <Button
            as={NextLink}
            href={siteConfig.links.sponsor}
            variant="bordered"
            size="lg"
            className="px-8"
          >
            Ủng hộ dự án
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardBody className="py-6">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-default-600">
                  {stat.label}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8">
        <div className="text-center mb-12">
          <h2 className={title({ size: "md" })}>
            Tính năng nổi bật
          </h2>
          <p className={subtitle({ class: "mt-4 max-w-2xl mx-auto" })}>
            Hệ thống được thiết kế với các tính năng tiên tiến để đảm bảo quy trình giải ngân diễn ra suôn sẻ và chuyên nghiệp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-default-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
          <CardBody className="text-center py-12">
            <h2 className={title({ size: "md" })}>
              Sẵn sàng bắt đầu?
            </h2>
            <p className={subtitle({ class: "mt-4 mb-8 max-w-xl mx-auto" })}>
              Hãy bắt đầu gửi thông báo giải ngân cho khách hàng của bạn với hệ thống tự động và chuyên nghiệp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as={NextLink}
                href="/disbursement"
                color="primary"
                size="lg"
                variant="shadow"
                className="px-8"
              >
                Truy cập hệ thống
              </Button>
              <Button
                as={NextLink}
                href="#features"
                variant="ghost"
                size="lg"
                className="px-8"
              >
                Tìm hiểu thêm
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

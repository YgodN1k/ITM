"use client";

import { type ChangeEvent, type FormEvent, useState } from "react";
import { getHomeHref, withBasePath } from "@/lib/site";

const MIN_FORM_FILL_TIME_MS = 3000;

function formatRussianPhone(value: string) {
  let digits = value.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("8")) {
    digits = `7${digits.slice(1)}`;
  }

  if (!digits.startsWith("7")) {
    digits = `7${digits}`;
  }

  const phoneDigits = digits.slice(1, 11);
  const area = phoneDigits.slice(0, 3);
  const first = phoneDigits.slice(3, 6);
  const second = phoneDigits.slice(6, 8);
  const third = phoneDigits.slice(8, 10);

  let formattedPhone = "+7";

  if (area) {
    formattedPhone += ` (${area}`;
  }

  if (area.length === 3) {
    formattedPhone += ")";
  }

  if (first) {
    formattedPhone += ` ${first}`;
  }

  if (second) {
    formattedPhone += `-${second}`;
  }

  if (third) {
    formattedPhone += `-${third}`;
  }

  return formattedPhone;
}

function isCompleteRussianPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  return digits.length === 11 && digits.startsWith("7");
}

const homeHref = getHomeHref();
const logoIcon = withBasePath("/assets/figma/743ad2c0373400c4d991a51a2a8c66c42a53ddb4.png");
const heroMainImage = withBasePath("/assets/figma/gallery-4.jpg");
const aboutLeftImage = withBasePath("/assets/figma/about-pc-left.jpg");
const aboutRightImage = withBasePath("/assets/figma/about-pc-right.jpg");
const socialLinks = [
  { label: "Telegram", icon: withBasePath("/assets/social/telegram.png") },
  { label: "VK", icon: withBasePath("/assets/social/vk.png") },
  { label: "WhatsApp", icon: withBasePath("/assets/social/whatsapp.png") },
  { label: "Twitter", icon: withBasePath("/assets/social/twitter.png") },
  { label: "Snapchat", icon: withBasePath("/assets/social/snapchat.png") },
];

const navLinks = [
  { label: "Главная", href: "/" },
  { label: "О нас", href: "#about" },
  { label: "Вопросы и ответы", href: "#stages" },
  { label: "Контакты", href: "#contacts" },
  { label: "Услуги", href: "#services" },
  { label: "Продукция", href: "#builds" },
  { label: "Цены", href: "#builds" },
  { label: "Галерея", href: "#gallery" },
];

const serviceDefinitions = [
  { title: "Замена/добавление оперативной памяти", icon: "/assets/svg/service-ram.svg" },
  { title: "Замена/добавление SSD или жёсткого диска", icon: "/assets/svg/service-drive.svg" },
  { title: "Замена видеокарты", icon: "/assets/svg/service-gpu.svg" },
  { title: "Замена и разгон (при поддержке) процессора", icon: "/assets/svg/service-cpu.svg" },
  { title: "Замена материнской платы", icon: "/assets/svg/service-motherboard.svg" },
  { title: "Замена блока питания", icon: "/assets/svg/service-power.svg" },
  { title: "Замена кулеров", icon: "/assets/svg/service-cooler.svg" },
  { title: "Установка водяного охлаждения", icon: "/assets/svg/service-water.svg" },
];
const services = serviceDefinitions.map((service) => ({
  ...service,
  icon: withBasePath(service.icon),
}));

const buildDefinitions = [
  {
    id: "12876349",
    image: "/assets/figma/build-red.png",
    motherboard: "AMD B850",
    cpu: "Ryzen 7 9800X3D",
    gpu: "RX 7700XT",
    ram: "16 GB (2x8GB) 3200MHz",
    ssd: "500GB",
    hdd: "1TB",
    cooler: "DeepCool AG300 LED",
    power: "DeepCool PF700",
    price: "От 90 до 120",
  },
  {
    id: "76548931",
    image: "/assets/figma/build-orange.png",
    motherboard: "AMD X870",
    cpu: "Ryzen 9 9900X3D",
    gpu: "RX 9070XT",
    ram: "16GB (2x8GB) 3200MHz",
    ssd: "500GB",
    hdd: "2TB",
    cooler: "DeepCool AG400",
    power: "DeepCool PF750D",
    price: "От 100 до 150",
  },
  {
    id: "25976483",
    image: "/assets/figma/build-yellow.png",
    motherboard: "B760M",
    cpu: "Intel Core i5 14600K",
    gpu: "RTX 5060 12GB",
    ram: "16GB (2x8GB) 4200MHz",
    ssd: "500GB",
    hdd: "2TB",
    cooler: "DeepCool AG400 BK",
    power: "DeepCool PF750D",
    price: "От 50 до 95",
  },
  {
    id: "15935746",
    image: "/assets/figma/build-green.png",
    motherboard: "Z790",
    cpu: "i7-12700",
    gpu: "RTX 5080 12GB",
    ram: "32GB (2x16GB) 5600MHz",
    ssd: "1TB",
    hdd: "2TB",
    cooler: "DeepCool AG500 ARGB",
    power: "DeepCool DQ1000",
    price: "От 150 до 200",
  },
];
const builds = buildDefinitions.map((build) => ({
  ...build,
  image: withBasePath(build.image),
}));
const buildSlides = Array.from({ length: 5 }, (_, id) => ({
  id,
  items: builds,
}));

const stageDefinitions = [
  {
    title: "Заявка",
    icon: "/assets/svg/stage-1.svg",
    text: "Позвоните нам по номеру +7 (000) 000 00 00 или оставьте заявку на сайте. Мы перезвоним в течение 10 минут.",
  },
  {
    title: "Консультация",
    icon: "/assets/svg/stage-2.svg",
    text: "Ответим на ваши вопросы, озвучим возможные причины поломки и примерную стоимость ремонта.",
  },
  {
    title: "Выезд",
    icon: "/assets/svg/stage-3.svg",
    text: "Если у вас нет возможности приехать в сервис, мастер бесплатно выезжает в удобное для вас время и место.",
  },
  {
    title: "Диагностика",
    icon: "/assets/svg/stage-4.svg",
    text: "Проводим диагностику, выявляем проблему, согласовываем стоимость и условия работы, после чего заключаем договор.",
  },
  {
    title: "Ремонт",
    icon: "/assets/svg/stage-5.svg",
    text: "После вашего согласия мастер выполняет ремонт. В зависимости от поломки это занимает от 30 до 90 минут.",
  },
  {
    title: "Оплата",
    icon: "/assets/svg/stage-6.svg",
    text: "Принимаем оплату наличными или картой и выдаём гарантийный талон на комплектующие и выполненные работы.",
  },
];
const stages = stageDefinitions.map((stage) => ({
  ...stage,
  icon: withBasePath(stage.icon),
}));

const galleryImageDefinitions = [
  { title: "Игровая зона", image: "/assets/figma/gallery-1.jpg" },
  { title: "Виртуальная станция", image: "/assets/figma/gallery-2.jpg" },
  { title: "Стриминг и монтаж", image: "/assets/figma/gallery-3.jpg" },
  { title: "Ночная сборка", image: "/assets/figma/hero-main.jpg" },
];
const galleryImages = galleryImageDefinitions.map((image) => ({
  ...image,
  image: withBasePath(image.image),
}));

const partnerLogoDefinitions = [
  { alt: "Партнёр 1", src: "/assets/svg/partner-1.svg" },
  { alt: "Партнёр 2", src: "/assets/svg/partner-2.svg" },
  { alt: "Партнёр 3", src: "/assets/svg/partner-3.svg" },
  { alt: "Партнёр 4", src: "/assets/svg/partner-4.svg" },
  { alt: "Партнёр 5", src: "/assets/svg/partner-5.svg" },
  { alt: "Партнёр 6", src: "/assets/svg/partner-6.svg" },
  { alt: "Партнёр 7", src: "/assets/svg/partner-7.svg" },
  { alt: "Партнёр 8", src: "/assets/svg/partner-8.svg" },
];
const partnerLogos = partnerLogoDefinitions.map((logo) => ({
  ...logo,
  src: withBasePath(logo.src),
}));
const partnerCarouselLogos = [...partnerLogos, ...partnerLogos];

function SectionHeading({
  kicker,
  title,
  action,
}: {
  kicker: string;
  title: string;
  action?: string;
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="section-kicker">{kicker}</p>
        <h2 className="section-title">{title}</h2>
      </div>
      {action ? (
        <a href="#contacts" className="pill-button-secondary self-start md:self-auto">
          {action}
        </a>
      ) : null}
    </div>
  );
}

function ServiceCard({
  title,
  icon,
}: {
  title: string;
  icon: string;
}) {
  return (
    <article className="rounded-[2rem] bg-[#121212] p-7 shadow-frame transition duration-300 hover:-translate-y-1 hover:bg-[#171717]">
      <div className="mb-7 flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-2xl">
        <img src={icon} alt="" className="h-full w-full object-contain" />
      </div>
      <h3 className="max-w-[18ch] text-xl font-medium leading-snug text-white">{title}</h3>
      <p className="mt-4 max-w-[28ch] text-sm leading-7 text-white/65">
        Лишь базовые сценарии поведения пользователей смешаны с неуникальными данными до степени
        совершенной неузнаваемости.
      </p>
    </article>
  );
}

function BuildCard({ build }: { build: (typeof builds)[number] }) {
  const specs = [
    ["Мат. плата", build.motherboard],
    ["ЦП", build.cpu],
    ["Видеокарта", build.gpu],
    ["ОЗУ", build.ram],
    ["SSD", build.ssd],
    ["HDD", build.hdd],
    ["Кулер для ЦП", build.cooler],
    ["Блок питания", build.power],
  ];

  return (
    <article className="rounded-[2rem] bg-[#121212] p-3 shadow-frame">
      <div className="aspect-[399/250] overflow-hidden rounded-[1.65rem] bg-black">
        <img src={build.image} alt={`Сборка ${build.id}`} className="h-full w-full object-contain" />
      </div>
      <div className="px-1 pb-2 pt-6">
        <p className="text-[1.75rem] leading-none text-white/90">ID:{build.id}</p>
        <div className="mt-5 space-y-3">
          {specs.map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 border-b border-dashed border-white/15 pb-2 text-xs text-white/70"
            >
              <span className="relative pl-4 before:absolute before:left-0 before:top-1.5 before:h-2 before:w-2 before:rounded-full before:bg-accent">
                {label}:
              </span>
              <span className="text-right">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <p className="text-xs text-white/55">Цена:</p>
          <p className="text-3xl font-semibold leading-none text-accent">
            {build.price} <span className="text-sm font-medium text-white/65">тыс.руб</span>
          </p>
        </div>
        <a href="#contacts" className="pill-button-primary mt-6">
          Заказать
        </a>
      </div>
    </article>
  );
}

function StageCard({ stage }: { stage: (typeof stages)[number] }) {
  return (
    <article className="rounded-[2rem] bg-accent px-6 py-7 text-black">
      <div className="mb-8 h-[100px] w-[100px] overflow-hidden rounded-full">
        <img src={stage.icon} alt="" className="h-full w-full object-cover" />
      </div>
      <h3 className="text-2xl font-medium">{stage.title}</h3>
      <p className="mt-3 max-w-[34ch] text-sm leading-7 text-black/75">{stage.text}</p>
    </article>
  );
}

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeBuildSlide, setActiveBuildSlide] = useState(0);
  const [phone, setPhone] = useState("");
  const [spamTrap, setSpamTrap] = useState("");
  const [formStartedAt] = useState(() => Date.now());
  const [formMessage, setFormMessage] = useState("");

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPhone(formatRussianPhone(event.target.value));
    setFormMessage("");
  };

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (spamTrap.trim() || Date.now() - formStartedAt < MIN_FORM_FILL_TIME_MS) {
      setFormMessage("Похоже на автоматическую отправку. Попробуйте ещё раз.");
      return;
    }

    if (!isCompleteRussianPhone(phone)) {
      setFormMessage("Введите номер в формате +7 (999) 999-99-99.");
      return;
    }

    setFormMessage("Спасибо! Номер прошёл проверку.");
  };

  const goToBuildSlide = (index: number) => {
    setActiveBuildSlide(index);
  };

  const showPrevBuildSlide = () => {
    setActiveBuildSlide((current) => (current === 0 ? buildSlides.length - 1 : current - 1));
  };

  const showNextBuildSlide = () => {
    setActiveBuildSlide((current) => (current === buildSlides.length - 1 ? 0 : current + 1));
  };

  return (
    <main className="pb-12">
      <section className="container-shell">
        <div className="relative overflow-hidden bg-[#080808]">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroMainImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/82 to-[#080808]/18" />

          <div className="relative z-10 px-5 py-6 sm:px-8 lg:px-12">
            <header className="-mx-5 px-5 pb-4 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
              <div className="flex items-center justify-between gap-6">
                <a
                  href={homeHref}
                  className="-my-4 -ml-5 flex min-h-[88px] items-center gap-4 rounded-br-[2rem] bg-accent px-6 py-5 text-white sm:-my-4 sm:-ml-8 sm:px-8 lg:-my-4 lg:-ml-12 lg:min-w-[273px] lg:rounded-br-[2.25rem]"
                >
                  <img src={logoIcon} alt="Логотип компании" className="h-10 w-10 object-contain" />
                  <div>
                    <p className="text-base font-bold leading-none">ITmedical</p>
                    <p className="mt-2 text-xs text-white/75">Ремонт компьютеров</p>
                  </div>
                </a>

                <nav className="hidden items-center gap-5 text-sm text-white/80 lg:flex xl:ml-8 xl:mr-auto">
                  {navLinks.map((item) => (
                    <a key={item.label} href={item.href === "/" ? homeHref : item.href} className="transition hover:text-accent">
                      {item.label}
                    </a>
                  ))}
                </nav>

                <button
                  type="button"
                  aria-label="Открыть меню"
                  aria-expanded={isMobileMenuOpen}
                  onClick={() => setIsMobileMenuOpen((value) => !value)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white transition hover:border-accent hover:text-accent lg:hidden"
                >
                  <span className="space-y-1.5">
                    <span className="block h-0.5 w-5 bg-current" />
                    <span className="block h-0.5 w-5 bg-current" />
                    <span className="block h-0.5 w-5 bg-current" />
                  </span>
                </button>
              </div>

              {isMobileMenuOpen ? (
                <nav className="mt-4 grid gap-3 border-t border-white/10 pt-4 text-sm text-white/85 lg:hidden">
                  {navLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href === "/" ? homeHref : item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-full border border-white/10 px-4 py-3 transition hover:border-accent hover:text-accent"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              ) : null}
            </header>

            <div className="grid gap-10 pt-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:py-0">
            <div className="flex flex-col py-2 lg:py-9">
              <div className="mt-8 hidden border-y border-white/10 py-4 text-sm text-white/60 lg:grid lg:grid-cols-[auto_auto_1fr] lg:items-center lg:gap-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg text-white">
                    ☎
                  </span>
                  <div className="space-y-1">
                    <p>+7 (123) 456-78-91</p>
                    <p>+7 (987) 654-32-19</p>
                  </div>
                </div>
                <a href="#contacts" className="pill-button-secondary justify-self-start px-8 py-3">
                  Перезвоните мне
                </a>
                <p className="border-l border-accent/40 pl-6">
                  Мы ответим на ваши вопросы, озвучим возможные причины поломки и примерную
                  стоимость ремонта.
                </p>
              </div>

              <div className="mt-10">
                <p className="text-xl text-white/70 sm:text-3xl">Ремонт и сборка</p>
                <h1 className="mt-4 text-4xl font-semibold uppercase leading-[0.95] sm:text-6xl xl:text-[5rem]">
                  Компьютеров и серверов
                </h1>
                <div className="mt-6 h-1 w-40 rounded-full bg-accent" />
              </div>

              <div className="mt-8 flex items-start gap-4 sm:mt-10 sm:gap-6">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-accent text-3xl font-semibold text-white sm:h-24 sm:w-24">
                  20%
                </div>
                <div>
                  <h2 className="text-2xl font-medium sm:text-[2rem]">Скидка -20% на все услуги</h2>
                  <p className="mt-3 max-w-[38ch] text-sm leading-7 text-white/65">
                    Только в этом месяце и только для вас. Мы предоставляем скидку в размере 20%
                    на все виды услуг. А при полной сборке ПК в нашем сервисе вы получите скидку 5%
                    на комплектующие, а сама сборка будет бесплатной.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#contacts" className="pill-button-primary">
                  Оставить заявку
                </a>
                <a href="#stages" className="pill-button-secondary">
                  Онлайн консультация
                </a>
              </div>
            </div>

            <div className="relative min-h-[420px] pb-6 lg:min-h-[760px] lg:pb-0">
              <div className="mt-8 grid gap-3 border-t border-white/10 pt-5 text-sm text-white/70 lg:hidden">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg text-white">
                    ☎
                  </span>
                  <div className="space-y-1">
                    <p>+7 (123) 456-78-91</p>
                    <p>+7 (987) 654-32-19</p>
                  </div>
                </div>
                <a href="#contacts" className="pill-button-secondary justify-center">
                  Перезвоните мне
                </a>
                <p>
                  Мы ответим на ваши вопросы, озвучим возможные причины поломки и примерную
                  стоимость ремонта.
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      <section className="container-shell mt-14 sm:mt-20" id="services">
        <SectionHeading kicker="Предлагаем вам" title="Услуги нашей компании" action="Смотреть все" />
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.title} title={service.title} icon={service.icon} />
          ))}
        </div>
      </section>

      <section className="container-shell mt-14 sm:mt-20" id="builds">
        <SectionHeading
          kicker="Пк под любые игры и программы"
          title="Готовые сборки"
          action="Индивидуальная сборка"
        />
        <div className="relative mt-10">
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeBuildSlide * 100}%)` }}
              >
                {buildSlides.map((slide) => (
                  <div key={slide.id} className="min-w-full">
                    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
                      {slide.items.map((build) => (
                        <BuildCard key={`${slide.id}-${build.id}`} build={build} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="relative mt-8">
          <button
            type="button"
            aria-label="Предыдущий слайд"
            onClick={showPrevBuildSlide}
            className="absolute left-0 top-1/2 hidden h-[60px] w-[120px] -translate-y-1/2 items-center justify-center rounded-full border border-accent bg-transparent text-white transition hover:bg-accent/10 lg:flex"
          >
            <svg aria-hidden="true" viewBox="0 0 7 11" className="h-[11px] w-[7px]">
              <path
                d="M5.5 1.25 1.75 5.5l3.75 4.25"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>

          <div className="flex items-center justify-center gap-3">
            {buildSlides.map((slide, index) => (
              <button
                type="button"
                aria-label={`Перейти к слайду ${index + 1}`}
                onClick={() => goToBuildSlide(index)}
                key={slide.id}
                className={`h-3 w-3 rounded-full transition ${index === activeBuildSlide ? "bg-accent" : "bg-white/20 hover:bg-white/40"}`}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Следующий слайд"
            onClick={showNextBuildSlide}
            className="absolute right-0 top-1/2 hidden h-[60px] w-[120px] -translate-y-1/2 items-center justify-center rounded-full border border-accent bg-transparent text-white transition hover:bg-accent/10 lg:flex"
          >
            <svg aria-hidden="true" viewBox="0 0 7 11" className="h-[11px] w-[7px]">
              <path
                d="M1.5 1.25 5.25 5.5 1.5 9.75"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
        </div>
      </section>

      <section className="container-shell mt-14 sm:mt-20" id="stages">
        <SectionHeading
          kicker="Качественный ремонт в 6 этапов"
          title="Как мы работаем"
          action="Оставить заявку"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {stages.map((stage) => (
            <StageCard key={stage.title} stage={stage} />
          ))}
        </div>
      </section>

      <section className="container-shell mt-14 sm:mt-20" id="about">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:items-start">
          <div>
            <p className="section-kicker">О нашей компании</p>
            <h2 className="section-title">Немного о нас</h2>
            <p className="mt-8 max-w-3xl text-base leading-8 text-white/70">
              В наши времена очень полезно иметь мощный компьютер, так как с его помощью можно
              хорошо зарабатывать и довольно быстро окупать вложения. Сейчас более 100 новых
              профессий предлагают большие перспективы, и наша компания предлагает лучшие
              лицензированные комплектующие для компьютеров и профессиональную сборку под любые
              задачи.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Высококачественные компоненты",
                "Профессиональные специалисты",
                "Надёжность",
                "Индивидуальный подход",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-white/80">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                  {item}
                </div>
              ))}
            </div>
            <a href="#gallery" className="pill-button-secondary mt-8">
              Узнать подробнее
            </a>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="overflow-hidden rounded-[2rem]">
              <img
                src={aboutLeftImage}
                alt="Компьютер с подсветкой"
                className="h-full min-h-[360px] w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-[2rem]">
              <img
                src={aboutRightImage}
                alt="Игровой компьютер"
                className="h-full min-h-[360px] w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="-mx-5 mt-10 overflow-hidden border-y border-white/10 px-5 py-5 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
          <div className="partner-carousel-track flex w-max gap-4">
            {partnerCarouselLogos.map((logo, index) => (
              <div
                key={`${logo.src}-${index}`}
                className="flex h-[100px] w-[calc(50vw-1.75rem)] min-w-[150px] max-w-[220px] items-center justify-center rounded-2xl border border-white/10 px-4 py-4 sm:w-[200px] sm:min-w-[200px]"
              >
                <img src={logo.src} alt={logo.alt} className="max-h-full w-full object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell mt-14 sm:mt-20" id="gallery">
        <SectionHeading kicker="Предлагаем вам" title="Фотогалерея" action="Смотреть все фото" />
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {galleryImages.map((panel, index) => (
            <div key={panel.title} className="group relative h-[420px] overflow-hidden rounded-[2rem]">
              <img
                src={panel.image}
                alt={panel.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-6 pb-6 pt-20">
                <div className="text-sm uppercase tracking-[0.28em] text-white/70">0{index + 1}</div>
                <p className="mt-2 text-xl font-medium text-white">{panel.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-shell mt-14 sm:mt-20" id="contacts">
        <div className="rounded-[2.5rem] bg-[#131313] px-5 py-10 sm:px-8 lg:px-14">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-4xl font-medium sm:text-5xl">
              Оставьте <span className="text-accent">заявку</span>
            </h2>
            <p className="mt-3 text-center text-white/60">И мы перезвоним вам в течение 10 мин.</p>
            <form className="mt-8 space-y-4" onSubmit={handleContactSubmit}>
              <input
                type="text"
                placeholder="Имя"
                className="w-full rounded-full border border-transparent bg-[#222] px-6 py-4 text-white outline-none transition placeholder:text-white/40 focus:border-accent"
              />
              <div className="hidden" aria-hidden="true">
                <label>
                  Website
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={spamTrap}
                    onChange={(event) => setSpamTrap(event.target.value)}
                  />
                </label>
              </div>
              <input
                type="tel"
                name="phone"
                inputMode="tel"
                autoComplete="tel"
                maxLength={18}
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Телефон"
                className="w-full rounded-full border border-transparent bg-[#222] px-6 py-4 text-white outline-none transition placeholder:text-white/40 focus:border-accent"
              />
              {formMessage ? (
                <p className="text-center text-sm text-white/60" aria-live="polite">
                  {formMessage}
                </p>
              ) : null}
              <label className="flex items-center gap-3 text-sm text-white/55">
                <input type="checkbox" className="h-4 w-4 accent-accent" />
                Ознакомлен(а) с пользовательским соглашением
              </label>
              <div className="pt-4 text-center">
                <button type="submit" className="pill-button-primary min-w-44">
                  Отправить
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <footer className="container-shell mt-12">
        <div className="rounded-[2.5rem] bg-[#101010] px-5 py-8 sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4 border-b border-white/10 pb-7">
            {socialLinks.map((item) => (
              <a
                href="#"
                key={item.label}
                aria-label={item.label}
                className="transition hover:scale-105"
              >
                <img src={item.icon} alt={item.label} className="h-12 w-12 object-contain" />
              </a>
            ))}
          </div>

          <div className="mt-7 grid gap-8 lg:grid-cols-3">
            <div>
              <p className="text-sm text-white/45">Телефон:</p>
              <p className="mt-2 text-lg font-medium">+7 (495) 000 00 00</p>
            </div>
            <div>
              <p className="text-sm text-white/45">Электронная почта:</p>
              <p className="mt-2 text-lg font-medium">Test@example.com</p>
            </div>
            <div>
              <p className="text-sm text-white/45">Местоположение:</p>
              <p className="mt-2 text-lg font-medium">г. Москва, Ленинский проспект</p>
            </div>
          </div>
        </div>

        <div className="-mx-5 mt-4 bg-[#222222] px-5 py-5 text-white/70 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="space-y-1 text-[14px] leading-6">
              <p>Поддержка. Разработка сайтов в Megagroup.</p>
              <p>ИНН: 123456789111</p>
              <p>ОГРНИП: 1110987654321</p>
            </div>
            <p className="text-[14px] leading-6 lg:text-right">Copyright © 2023 - 2026 Название компании</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

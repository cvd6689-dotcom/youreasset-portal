import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Phone,
  FileText,
  ExternalLink,
  ShieldCheck,
  Users,
  BadgeCheck,
  Menu,
  X,
  Headphones,
  Files,
  Briefcase,
  Building2,
  Bell,
  Lock,
  Settings,
  Save,
  LogOut,
  Upload,
  Download,
  Mail,
} from "lucide-react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import {
  initializeSiteData,
  subscribeBrand,
  subscribeInsurers,
  saveBrand,
  saveInsurers,
} from "./dataService";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Card({ className = "", children }) {
  return <div className={cn("rounded-2xl border border-slate-200 bg-white", className)}>{children}</div>;
}

function CardContent({ className = "", children }) {
  return <div className={className}>{children}</div>;
}

function Button({ className = "", variant = "default", children, asChild = false, ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none";
  const styles =
    variant === "outline"
      ? "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
      : "bg-slate-900 text-white hover:bg-slate-800";

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(base, styles, className, children.props.className || ""),
      ...props,
    });
  }

  return (
    <button className={cn(base, styles, className)} {...props}>
      {children}
    </button>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400",
        className
      )}
      {...props}
    />
  );
}

function Badge({ className = "", children }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", className)}>
      {children}
    </span>
  );
}

const defaultBrand = {
  company: "유어즈에셋",
  sub: "보험사전산 · 보험사 고객센터 · 상품공시실을 한곳에 모은 보험 포털",
  phone: "031-000-0000",
  accent: "보험 정보를 더 빠르게 연결하는 파트너",
  logoSrc:
    "data:image/png;base64,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",
};

const defaultInsurers = [
  { name: "현대해상", category: "손해보험", logoText: "HD", gaPortal: "https://sp.hi.co.kr/websquare/websquare.html?w2xPath=/common/xml/Login.xml", claimsPage: "https://www.hi.co.kr/serviceAction.do?menuId=100631", disclosure: "https://www.hi.co.kr/bin/CI/ON/CION3200G.jsp", customerCenter: "1588-5656", claimsFax: "0507-774-6060", monitoring: "1577-3223" },
  { name: "DB손해보험", category: "손해보험", logoText: "DB", gaPortal: "https://www.mdbins.com/edge.html", claimsPage: "https://www.idbins.com/pc/bizxpress/ct/dc/FWCUSV1301.shtm", disclosure: "https://www.idbins.com/FWMAIV1534.do", customerCenter: "1588-0100", claimsFax: "0505-181-4862", monitoring: "1566-0757" },
  { name: "삼성화재", category: "손해보험", logoText: "SF", gaPortal: "https://erp.samsungfire.com/irj/servlet/prt/portal/prtroot/logon.LogonPage?EPApp=1.0.0.0", claimsPage: "https://www.samsungfire.com", disclosure: "https://www.samsungfire.com/vh/page/VH.HPIF0103.do", customerCenter: "1588-5114", claimsFax: "0505-162-0872", monitoring: "1566-0553" },
  { name: "메리츠화재", category: "손해보험", logoText: "MZ", gaPortal: "https://sales.meritzfire.com", claimsPage: "https://www.meritzfire.com/compensation/longterm-insurance/request-document.do", disclosure: "https://www.meritzfire.com/disclosure/product-announcement/product-list.do?vMode=PC", customerCenter: "1566-7711", claimsFax: "0505-021-3400", monitoring: "1577-7711" },
  { name: "KB손해보험", category: "손해보험", logoText: "KB", gaPortal: "http://sales.kbinsure.co.kr/", claimsPage: "https://www.kbinsure.co.kr/CG205020001.ec", disclosure: "https://www.kbinsure.co.kr/CG802030001.ecs", customerCenter: "1544-0114", claimsFax: "0505-136-6500", monitoring: "1544-0019" },
  { name: "흥국화재", category: "손해보험", logoText: "HK", gaPortal: "https://sales.heungkukfire.co.kr/#/login", claimsPage: "https://www.heungkukfire.co.kr/FRW/compensation/accidentDocInfo.do", disclosure: "https://www.heungkukfire.co.kr/FRW/announce/insGoodsGongsiSale.do", customerCenter: "1688-1688", claimsFax: "0504-800-0700", monitoring: "1688-6997" },
  { name: "롯데손해보험", category: "손해보험", logoText: "LT", gaPortal: "http://lottero.lotteins.co.kr/", claimsPage: "https://lotteins.co.kr/web/C/D/C/cdc_claim_0502.jsp", disclosure: "https://www.lotteins.co.kr/index2.jsp", customerCenter: "1588-3344", claimsFax: "0507-333-9999", monitoring: "1600-5182" },
  { name: "한화손해보험", category: "손해보험", logoText: "HW", gaPortal: "https://portal.hwgeneralins.com/3rdParty/loginFormPage_v2.jsp?NONCE=FOhxQYuPAYeodqcfC1lphTSZcDxVVSR4%2F0cFXCcNfeEzjCaQqhDVkPFYTS%2FMdv6MF7EwWoH3h4hJCI2fDZKckg%3D%3D&UURL=https%3A%2F%2Fportal.hwgeneralins.com%2Fnls3%2Ffcs", claimsPage: "https://www.hwgeneralins.com/fplaza/compensation/receipt01.do", disclosure: "https://www.hwgeneralins.com/notice/ir/main.do?_gl=1*17xn0g9*_gcl_au*MTg4MDgxNjcyMC4xNzU4NTE2NjY2", customerCenter: "1566-8000", claimsFax: "0502-779-1004", monitoring: "1670-1882" },
  { name: "NH농협손해보험", category: "손해보험", logoText: "NH", gaPortal: "https://www.nhfire.co.kr/fc/fd.nhfire", claimsPage: "https://www.nhfire.co.kr/customer/bilgdcm/retrieveBilgDcmList.nhfire", disclosure: "https://www.nhfire.co.kr/announce/productAnnounce/retrieveInsuranceProductsAnnounce.nhfire", customerCenter: "1644-9000", claimsFax: "0505-060-7000", monitoring: "1644-9600" },
  { name: "MG손해보험", category: "손해보험", logoText: "MG", gaPortal: "#", claimsPage: "#", disclosure: "https://www.mggeneralins.com/PB031210DM.scp?menuId=MN0803006", customerCenter: "1588-5959", claimsFax: "입력 필요", monitoring: "입력 필요" },
  { name: "하나손해보험", category: "손해보험", logoText: "HN", gaPortal: "https://sfa.saleshana.com/wq/login", claimsPage: "https://www.hanainsure.co.kr/w/claim/carReward/rewardDocumentGuide", disclosure: "https://www.hanainsure.co.kr/w/disclosure/product/saleProduct", customerCenter: "1566-3000", claimsFax: "0505-170-0765", monitoring: "1660-4590" },
  { name: "교보생명", category: "생명보험", logoText: "KBL", gaPortal: "https://sso.kyobo.com:5443/3rdParty/certLoginFormPage.jsp?NONCE=L0QAIukL10imUU8cIf3nEt0NYqKI2gQfrNJzNco%2BvMaSuXhvHiV5XRgUsNTj9LHswxmKP9w99NASh7CJt%2Fdg7g%3D%3D&UURL=https%3A%2F%2Fsso.kyobo.com%3A5443%2Fnls3%2Ffcs", claimsPage: "https://www.kyobo.com/dgt/web/customer/support/need-papers/list", disclosure: "https://www.kyobo.com/dgt/web/product-official/all-product/search", customerCenter: "1588-1001", claimsFax: "콜센터 가상번호", monitoring: "1588-1636" },
  { name: "삼성생명", category: "생명보험", logoText: "SL", gaPortal: "https://connectplus.samsunglife.com:10443/gasso/login?contextType=external&username=string&password=secure_string&challenge_url=https%3A%2F%2Fconnectplus.samsunglife.com%3A10443%2Fgasso%2Flogin&reques", claimsPage: "https://www.samsunglife.com/individual/mysamsunglife/insurance/internet/MDP-MYINT020110M", disclosure: "https://www.samsunglife.com/individual/products/disclosure/sales/PDO-PRPRI010110M", customerCenter: "1588-3114", claimsFax: "콜센터 가상번호", monitoring: "1588-3115" },
  { name: "KB생명", category: "생명보험", logoText: "KB", gaPortal: "https://sfa.kblife.co.kr/scr/m/sfa-login?request=sfaLogin", claimsPage: "https://www.kblife.co.kr/customer-center/informRequiredDocument.do", disclosure: "https://www.kblife.co.kr/customer-common/productList.do", customerCenter: "1588-3374", claimsFax: "02-6220-9912", monitoring: "1588-9922" },
  { name: "한화생명", category: "생명보험", logoText: "HL", gaPortal: "https://hmp.hanwhalife.com/online/solutions/websquare/websquare.html?w2xPath=/online/ui/uv/gmn/uvgmn010mvw.xml", claimsPage: "https://www.hanwhalife.com/static/main/myPage/insurance/accident/document/MY_INAPADC_T10000.jsp", disclosure: "https://www.hanwhalife.com/main/disclosure/main/DF_0000000_P00000.do", customerCenter: "1588-6363", claimsFax: "콜센터 가상번호", monitoring: "1800-6633" },
  { name: "신한라이프", category: "생명보험", logoText: "SH", gaPortal: "https://ga.shinhanlife.co.kr:11043/colomga010m.msv", claimsPage: "https://www.shinhanlife.co.kr/hp/cdhf0020t02.do", disclosure: "https://www.shinhanlife.co.kr/hp/cdhi0030.do", customerCenter: "1588-5580", claimsFax: "콜센터 가상번호", monitoring: "1522-2285" },
  { name: "DB생명", category: "생명보험", logoText: "DB", gaPortal: "https://etopia.idblife.com/", claimsPage: "https://www.idblife.com/support/guide/acbf_clm", disclosure: "https://idblife.com/notice/product/sale", customerCenter: "1588-3131", claimsFax: "0505-129-3134", monitoring: "02-6470-7663" },
  { name: "라이나생명", category: "생명보험", logoText: "LN", gaPortal: "https://ga.lina.co.kr/html/gap/GA/GAZ911M0.html", claimsPage: "https://www.lina.co.kr/cyber/accident-insurance/document-zero", disclosure: "https://www.lina.co.kr/disclosure/product-public-announcement/product-on-sales?key=0", customerCenter: "1588-0058", claimsFax: "0505-060-7000", monitoring: "1588-2442" },
  { name: "동양생명", category: "생명보험", logoText: "TY", gaPortal: "https://1004.myangel.co.kr/colgnsf001m.wqv", claimsPage: "https://myangel.co.kr/Mn", disclosure: "https://pbano.myangel.co.kr/paging/WE_AC_WEPAAP020100L", customerCenter: "1577-1004", claimsFax: "02-3289-4517", monitoring: "080-899-1004" },
  { name: "미래에셋생명", category: "생명보험", logoText: "MA", gaPortal: "https://www.loveageplan.com/", claimsPage: "https://life.miraeasset.com/home/index.do", disclosure: "https://life.miraeasset.com/micro/disclosure/product/PC-HO-080301-000000.do", customerCenter: "1588-0220", claimsFax: "콜센터 가상번호", monitoring: "1522-2285" },
  { name: "흥국생명", category: "생명보험", logoText: "HK", gaPortal: "https://sales.heungkuklife.co.kr/", claimsPage: "https://www.heungkuklife.co.kr/jsps/front/help/customer_require_tab.jsp", disclosure: "https://www.heungkuklife.co.kr/front/public/saleProduct.do", customerCenter: "1588-2288", claimsFax: "콜센터 가상번호", monitoring: "1577-7711" },
  { name: "KDB생명", category: "생명보험", logoText: "KDB", gaPortal: "#", claimsPage: "https://www.kdblife.co.kr/ajax.do?scrId=HCSCT006M01P", disclosure: "https://www.kdblife.com/ajax.do?scrId=HDLMA000M00P", customerCenter: "1588-4040", claimsFax: "02-2669-7939", monitoring: "1588-4040" },
  { name: "NH생명", category: "생명보험", logoText: "NH", gaPortal: "https://www.nhlife.co.kr/nhsmart.nhl", claimsPage: "https://www.nhlife.co.kr/ho/cc/HOCC0010M00.nhl", disclosure: "https://www.nhlife.co.kr/ho/ig/HOIG0000M00.nhl", customerCenter: "1544-4000", claimsFax: "02-6971-6040", monitoring: "1544-4422" },
  { name: "IBK연금", category: "생명보험", logoText: "IBK", gaPortal: "https://sf.ibki.co.kr/websquare/websquare.html?w2xPath=/ui/SF/CO/SFCO100M01.xml", claimsPage: "https://www.ibki.co.kr/process/HP_CSCETR_POSN_DOC_INS_LIST?bltb_cod=SC000014&sctn=in&TAB=in", disclosure: "https://www.ibki.co.kr/process/HP_PBANO_PDT_SP_INDV", customerCenter: "1577-4117", claimsFax: "02-2270-1577", monitoring: "02-2270-1661" },
  { name: "메트라이프", category: "생명보험", logoText: "ML", gaPortal: "#", claimsPage: "https://cyber.metlife.co.kr/claim/requiredDocumentNotice", disclosure: "https://brand.metlife.co.kr/pn/paReal/insuProductDisclMain.do", customerCenter: "1588-9600", claimsFax: "02-3469-9428", monitoring: "1588-9609" },
];

const topCategories = [
  { key: "system", title: "보험사전산", desc: "각 원수사 GA 영업포탈 바로가기", icon: Briefcase },
  { key: "support", title: "보험사 고객센터", desc: "고객센터 · 청구 팩스 · 모니터링 · 청구서류", icon: Headphones },
  { key: "disclosure", title: "상품공시실", desc: "원수사별 상품공시실 바로가기", icon: Files },
];

function BrandLogo({ brand }) {
  return brand.logoSrc ? (
    <img src={brand.logoSrc} alt={brand.company} className="h-11 w-auto object-contain" />
  ) : (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
      <Building2 className="h-5 w-5" />
    </div>
  );
}

function Header({ activeTop, setActiveTop, brand, onOpenAdmin, isAdmin }) {
  const [open, setOpen] = useState(false);
  const menu = [
    { label: "회사소개", href: "#about" },
    { label: "보험사전산", key: "system", href: "#directory" },
    { label: "보험사 고객센터", key: "support", href: "#directory" },
    { label: "상품공시실", key: "disclosure", href: "#directory" },
  ];

  const handleClick = (item) => {
    if (item.key) setActiveTop(item.key);
    const el = document.querySelector(item.href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <a href="#home" className="flex items-center gap-3">
          <BrandLogo brand={brand} />
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900">{brand.company}</p>
            <p className="text-xs text-slate-500">보험사전산 · 고객센터 · 상품공시실</p>
          </div>
        </a>

        <nav className="hidden items-center gap-5 md:flex">
          {menu.map((item) => (
            <button
              key={item.label}
              onClick={() => handleClick(item)}
              className={`text-sm font-medium transition ${
                item.key && activeTop === item.key ? "text-slate-950" : "text-slate-600 hover:text-slate-950"
              }`}
            >
              {item.label}
            </button>
          ))}
          <Button variant="outline" className="rounded-xl px-4" onClick={onOpenAdmin}>
            {isAdmin ? <Settings className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
            {isAdmin ? "관리자" : "관리자 로그인"}
          </Button>
        </nav>

        <button className="rounded-xl border border-slate-200 p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4">
            {menu.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  handleClick(item);
                  setOpen(false);
                }}
                className="rounded-xl px-2 py-2 text-left text-sm font-medium text-slate-700"
              >
                {item.label}
              </button>
            ))}
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                onOpenAdmin();
                setOpen(false);
              }}
            >
              {isAdmin ? "관리자" : "관리자 로그인"}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero({ brand }) {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
      <div className="absolute inset-0">
        <div className="absolute -left-10 top-10 h-56 w-56 rounded-full bg-emerald-100/70 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-100/70 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="flex flex-col justify-center">
            <Badge className="mb-4 w-fit rounded-full border-0 bg-emerald-600 px-4 py-1 text-sm text-white hover:bg-emerald-600">
              YOURS ASSET INSURANCE PORTAL
            </Badge>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              꼭 필요한 보험사 업무 정보를
              <br />
              더 빠르고 깔끔하게 찾는
              <br />
              <span className="text-emerald-700">{brand.company} 보험 포털</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{brand.sub}</p>
            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[["보험사전산", "GA포탈 연결"], ["고객센터", "연락처·팩스·서류"], ["상품공시실", "공시 링크 연결"], ["실시간수정", "관리자 수정 가능"]].map(
                ([title, desc]) => (
                  <div key={title} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                    <p className="text-sm font-black text-slate-900">{title}</p>
                    <p className="mt-1 text-xs text-slate-500">{desc}</p>
                  </div>
                )
              )}
            </div>
          </motion.div>

          <Card className="rounded-[28px] border-white/80 bg-white/90 shadow-xl shadow-emerald-100/70 backdrop-blur">
            <CardContent className="p-6 sm:p-8">
              <p className="text-sm font-semibold text-emerald-700">QUICK GUIDE</p>
              <h3 className="mt-1 text-2xl font-black text-slate-950">자주 찾는 업무를 카테고리별로 정리했습니다</h3>
              <div className="mt-6 space-y-3">
                {topCategories.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                      <span className="rounded-xl bg-emerald-50 p-2">
                        <Icon className="h-4 w-4 text-emerald-700" />
                      </span>
                      <div>
                        <p className="font-medium text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
      <div className="rounded-[32px] border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-emerald-700">ABOUT YOURS ASSET</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">보험 업무를 더 빠르게, 상담 연결은 더 자연스럽게</h2>
          </div>
          <div className="space-y-4 text-base leading-8 text-slate-600">
            <p>유어즈에셋은 고객이 자주 찾는 보험사 업무 정보를 더 쉽고 빠르게 확인할 수 있도록 실무형 포털 구조로 정리했습니다.</p>
            <p>보험사전산, 고객센터, 상품공시실을 카테고리별로 나누고 손해보험과 생명보험을 구분해 필요한 보험사만 빠르게 찾을 수 있도록 구성했습니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: ShieldCheck,
      title: "카테고리형 포털 구조",
      desc: "첫 화면에서 바로 보험사 버튼을 노출하지 않고 상단 카테고리에서 원하는 기능으로 진입하도록 정리했습니다.",
    },
    {
      icon: Users,
      title: "원수사별 버튼형 UI",
      desc: "각 원수사를 로고형 심볼과 회사명을 결합한 버튼 카드로 구성해 클릭 즉시 관련 링크로 이동할 수 있게 했습니다.",
    },
    {
      icon: BadgeCheck,
      title: "운영용 데이터 구조",
      desc: "GA 영업포탈, 상품공시실, 고객센터 데이터를 보험사별로 분리해 나중에 값만 교체해도 바로 운영할 수 있게 설계했습니다.",
    },
  ];

  return (
    <section id="service" className="bg-slate-50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold tracking-[0.2em] text-slate-500">SERVICE</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">실사용을 고려한 보험 업무 포털 구조</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="rounded-[24px] border-slate-200 shadow-sm">
                <CardContent className="p-7">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-950">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{feature.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function InsurerButton({ item, href, helper }) {
  const clickable = href && href !== "#";

  const openLink = () => {
    if (!clickable) return;
    try {
      window.open(href, "_blank", "noopener,noreferrer");
    } catch {
      window.location.href = href;
    }
  };

  return (
    <button type="button" onClick={openLink} className={`w-full text-left ${clickable ? "cursor-pointer" : "cursor-default"}`}>
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white shadow-sm">{item.logoText}</div>
          <p className="mt-4 text-center text-base font-black text-slate-950">{item.name}</p>
          <p className="mt-1 text-center text-xs text-slate-500">{helper}</p>
        </div>
      </div>
    </button>
  );
}

function SupportCard({ item }) {
  const hasClaimsDoc = item.claimsPage && item.claimsPage !== "#";

  const openClaims = () => {
    if (!hasClaimsDoc) return;
    try {
      window.open(item.claimsPage, "_blank", "noopener,noreferrer");
    } catch {
      window.location.href = item.claimsPage;
    }
  };

  return (
    <Card className="rounded-[24px] border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white">{item.logoText}</div>
          <div>
            <h4 className="text-lg font-black text-slate-950">{item.name}</h4>
            <p className="text-sm text-slate-500">고객센터 및 청구 안내</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 text-sm">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500">
              <Phone className="h-3.5 w-3.5" /> 고객센터 연락처
            </p>
            <p className="mt-1 text-base font-black text-slate-950">{item.customerCenter}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500">
              <FileText className="h-3.5 w-3.5" /> 보험금 청구 팩스번호
            </p>
            <p className="mt-1 text-base font-black text-slate-950">{item.claimsFax}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500">
              <Bell className="h-3.5 w-3.5" /> 모니터링 연락처
            </p>
            <p className="mt-1 text-base font-black text-slate-950">{item.monitoring}</p>
          </div>
          <button
            type="button"
            onClick={openClaims}
            disabled={!hasClaimsDoc}
            className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:cursor-default disabled:opacity-60"
          >
            <span>보험금 청구서류 다운로드</span>
            <ExternalLink className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function Directory({ activeTop, setActiveTop, insurers }) {
  const [query, setQuery] = useState("");
  const [line, setLine] = useState("손해보험");

  const filtered = useMemo(
    () => insurers.filter((item) => item.category === line && item.name.toLowerCase().includes(query.toLowerCase())),
    [query, line, insurers]
  );
  const activeMeta = topCategories.find((c) => c.key === activeTop);

  const getHref = (item) => {
    if (activeTop === "system") return item.gaPortal;
    if (activeTop === "disclosure") return item.disclosure;
    return undefined;
  };

  const getHelper = (item) => {
    const href = getHref(item);
    if (activeTop === "system") return href && href !== "#" ? "GA영업포탈 바로가기" : "주소 미입력";
    if (activeTop === "disclosure") return href && href !== "#" ? "상품공시실 바로가기" : "주소 미입력";
    return "정보 확인";
  };

  return (
    <section id="directory" className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold tracking-[0.2em] text-slate-500">DIRECTORY</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">상단 카테고리에서 선택한 기능별로 원수사를 확인하세요</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            현재 선택: <span className="font-bold text-slate-950">{activeMeta?.title}</span>
          </p>
        </div>
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="보험사명 검색" className="h-11 rounded-xl pl-10" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {topCategories.map((item) => {
          const Icon = item.icon;
          const active = activeTop === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTop(item.key)}
              className={`rounded-[24px] border p-5 text-left transition ${
                active ? "border-slate-900 bg-slate-900 text-white shadow-lg" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${active ? "bg-white/15" : "bg-slate-100"}`}>
                <Icon className={`h-5 w-5 ${active ? "text-white" : "text-slate-700"}`} />
              </div>
              <h3 className="text-lg font-black">{item.title}</h3>
              <p className={`mt-2 text-sm leading-6 ${active ? "text-slate-200" : "text-slate-600"}`}>{item.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant={line === "손해보험" ? "default" : "outline"} className="rounded-xl" onClick={() => setLine("손해보험")}>
          손해보험
        </Button>
        <Button variant={line === "생명보험" ? "default" : "outline"} className="rounded-xl" onClick={() => setLine("생명보험")}>
          생명보험
        </Button>
      </div>

      {activeTop === "support" ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <SupportCard key={item.name} item={item} />
          ))}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <InsurerButton key={item.name} item={item} href={getHref(item)} helper={getHelper(item)} />
          ))}
        </div>
      )}
    </section>
  );
}

function AdminModal({ open, onClose, user, brand, setBrand, insurers, setInsurers, onSave }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminTab, setAdminTab] = useState("brand");
  const [insurerSearch, setInsurerSearch] = useState("");
  const [selectedInsurerName, setSelectedInsurerName] = useState("");

  useEffect(() => {
    if (!selectedInsurerName && insurers.length > 0) {
      setSelectedInsurerName(insurers[0].name);
    }
  }, [insurers, selectedInsurerName]);

  if (!open) return null;

  const filteredInsurers = insurers.filter((item) => {
    const q = insurerSearch.trim().toLowerCase();
    if (!q) return true;
    return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  const selectedInsurer = insurers.find((item) => item.name === selectedInsurerName) || insurers[0];

  const updateSelectedInsurer = (field, value) => {
    if (!selectedInsurer) return;
    setInsurers(insurers.map((item) => (item.name === selectedInsurer.name ? { ...item, [field]: value } : item)));
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ brand, insurers }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "youreasset-portal-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed.brand) setBrand(parsed.brand);
        if (Array.isArray(parsed.insurers)) setInsurers(parsed.insurers);
        alert("데이터 파일을 불러왔습니다. 저장 버튼을 눌러야 실사이트에 반영됩니다.");
      } catch (e) {
        alert(`파일 오류: ${e.message}`);
      }
    };
    reader.readAsText(file, "utf-8");
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPassword("");
      alert("관리자 로그인 완료");
    } catch {
      alert("로그인 실패: 이메일 또는 비밀번호를 확인해주세요.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    alert("로그아웃되었습니다.");
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/40 p-4">
      <div className="mx-auto max-h-[92vh] max-w-7xl overflow-auto rounded-[28px] bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">관리자 설정</p>
            <h3 className="text-2xl font-black text-slate-950">홈페이지 내용 수정</h3>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>

        {!user ? (
          <div className="p-6">
            <Card className="mx-auto max-w-md rounded-[24px] border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <p className="mb-3 text-sm text-slate-500">관리자만 수정할 수 있습니다.</p>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="관리자 이메일" className="h-12 rounded-xl" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" className="mt-3 h-12 rounded-xl" />
                <Button className="mt-4 h-12 w-full rounded-xl" onClick={handleLogin}>
                  <Mail className="mr-2 h-4 w-4" />
                  관리자 로그인
                </Button>
                <p className="mt-3 text-xs leading-6 text-slate-500">
                  설계사들은 로그인 없이 열람만 가능하고, 관리자는 Firebase에 등록한 이메일/비밀번호로 로그인해 수정할 수 있습니다.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-6 flex flex-wrap gap-3">
              <Button variant={adminTab === "brand" ? "default" : "outline"} className="rounded-xl" onClick={() => setAdminTab("brand")}>
                기본 정보 수정
              </Button>
              <Button variant={adminTab === "insurer" ? "default" : "outline"} className="rounded-xl" onClick={() => setAdminTab("insurer")}>
                보험사별 정보 수정
              </Button>
              <Button variant={adminTab === "backup" ? "default" : "outline"} className="rounded-xl" onClick={() => setAdminTab("backup")}>
                백업 / 복원
              </Button>
            </div>

            {adminTab === "brand" && (
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <Card className="rounded-[24px] border-slate-200 shadow-sm">
                  <CardContent className="p-6">
                    <h4 className="text-xl font-black text-slate-950">회사 기본 정보</h4>
                    <div className="mt-4 space-y-3">
                      <Input value={brand.company} onChange={(e) => setBrand({ ...brand, company: e.target.value })} placeholder="회사명" className="h-11 rounded-xl" />
                      <Input value={brand.phone} onChange={(e) => setBrand({ ...brand, phone: e.target.value })} placeholder="대표번호" className="h-11 rounded-xl" />
                      <Input value={brand.accent} onChange={(e) => setBrand({ ...brand, accent: e.target.value })} placeholder="강조 문구" className="h-11 rounded-xl" />
                      <textarea
                        value={brand.sub}
                        onChange={(e) => setBrand({ ...brand, sub: e.target.value })}
                        className="min-h-[130px] w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-slate-400"
                        placeholder="메인 소개 문구"
                      />
                      <textarea
                        value={brand.logoSrc}
                        onChange={(e) => setBrand({ ...brand, logoSrc: e.target.value })}
                        className="min-h-[120px] w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-slate-400"
                        placeholder="로고 이미지 URL 또는 base64"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[24px] border-slate-200 shadow-sm">
                  <CardContent className="p-6">
                    <h4 className="text-xl font-black text-slate-950">수정 안내</h4>
                    <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                      <p>회사명, 대표번호, 메인 문구는 여기서 바로 바꿀 수 있습니다.</p>
                      <p>보험사별 고객센터 번호, 팩스번호, 모니터링 연락처, 영업포탈 링크, 상품공시실 링크는 <span className="font-bold text-slate-900">보험사별 정보 수정</span> 탭에서 바꾸면 됩니다.</p>
                      <p>저장 버튼을 누르면 Firebase에 저장되고, 사이트에 바로 반영됩니다.</p>
                    </div>
                    <div className="mt-6">
                      <Button onClick={onSave}>
                        <Save className="mr-2 h-4 w-4" />
                        실시간 저장
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {adminTab === "insurer" && (
              <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <Card className="rounded-[24px] border-slate-200 shadow-sm">
                  <CardContent className="p-5">
                    <h4 className="text-lg font-black text-slate-950">보험사 선택</h4>
                    <div className="mt-4">
                      <Input value={insurerSearch} onChange={(e) => setInsurerSearch(e.target.value)} placeholder="보험사 검색" className="h-11 rounded-xl" />
                    </div>
                    <div className="mt-4 max-h-[520px] space-y-2 overflow-auto pr-1">
                      {filteredInsurers.map((item) => (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setSelectedInsurerName(item.name)}
                          className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                            selectedInsurerName === item.name ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                          }`}
                        >
                          <p className="text-sm font-black">{item.name}</p>
                          <p className={`mt-1 text-xs ${selectedInsurerName === item.name ? "text-slate-200" : "text-slate-500"}`}>{item.category}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[24px] border-slate-200 shadow-sm">
                  <CardContent className="p-6">
                    {selectedInsurer ? (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white">{selectedInsurer.logoText}</div>
                          <div>
                            <h4 className="text-2xl font-black text-slate-950">{selectedInsurer.name}</h4>
                            <p className="text-sm text-slate-500">{selectedInsurer.category}</p>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="mb-2 text-sm font-semibold text-slate-700">보험사명</p>
                            <Input
                              value={selectedInsurer.name}
                              onChange={(e) => {
                                const newName = e.target.value;
                                setInsurers(insurers.map((item) => (item.name === selectedInsurer.name ? { ...item, name: newName } : item)));
                                setSelectedInsurerName(newName);
                              }}
                              className="h-11 rounded-xl"
                            />
                          </div>
                          <div>
                            <p className="mb-2 text-sm font-semibold text-slate-700">카테고리</p>
                            <select
                              value={selectedInsurer.category}
                              onChange={(e) => updateSelectedInsurer("category", e.target.value)}
                              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                            >
                              <option value="손해보험">손해보험</option>
                              <option value="생명보험">생명보험</option>
                            </select>
                          </div>
                          <div>
                            <p className="mb-2 text-sm font-semibold text-slate-700">로고 약칭</p>
                            <Input value={selectedInsurer.logoText} onChange={(e) => updateSelectedInsurer("logoText", e.target.value)} className="h-11 rounded-xl" />
                          </div>
                          <div>
                            <p className="mb-2 text-sm font-semibold text-slate-700">고객센터 연락처</p>
                            <Input value={selectedInsurer.customerCenter} onChange={(e) => updateSelectedInsurer("customerCenter", e.target.value)} className="h-11 rounded-xl" />
                          </div>
                          <div>
                            <p className="mb-2 text-sm font-semibold text-slate-700">보험금 청구 팩스번호</p>
                            <Input value={selectedInsurer.claimsFax} onChange={(e) => updateSelectedInsurer("claimsFax", e.target.value)} className="h-11 rounded-xl" />
                          </div>
                          <div>
                            <p className="mb-2 text-sm font-semibold text-slate-700">모니터링 연락처</p>
                            <Input value={selectedInsurer.monitoring} onChange={(e) => updateSelectedInsurer("monitoring", e.target.value)} className="h-11 rounded-xl" />
                          </div>
                          <div className="md:col-span-2">
                            <p className="mb-2 text-sm font-semibold text-slate-700">GA영업포탈 링크</p>
                            <Input value={selectedInsurer.gaPortal} onChange={(e) => updateSelectedInsurer("gaPortal", e.target.value)} className="h-11 rounded-xl" />
                          </div>
                          <div className="md:col-span-2">
                            <p className="mb-2 text-sm font-semibold text-slate-700">보험금 청구서류 다운로드 링크</p>
                            <Input value={selectedInsurer.claimsPage} onChange={(e) => updateSelectedInsurer("claimsPage", e.target.value)} className="h-11 rounded-xl" />
                          </div>
                          <div className="md:col-span-2">
                            <p className="mb-2 text-sm font-semibold text-slate-700">상품공시실 링크</p>
                            <Input value={selectedInsurer.disclosure} onChange={(e) => updateSelectedInsurer("disclosure", e.target.value)} className="h-11 rounded-xl" />
                          </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                          <Button onClick={onSave}>
                            <Save className="mr-2 h-4 w-4" />
                            실시간 저장
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500">보험사를 선택해주세요.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {adminTab === "backup" && (
              <Card className="rounded-[24px] border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <h4 className="text-xl font-black text-slate-950">백업 / 복원</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-500">JSON 파일로 현재 데이터를 백업하거나, 이전에 저장한 파일을 다시 불러올 수 있습니다.</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button onClick={onSave}>
                      <Save className="mr-2 h-4 w-4" />
                      실시간 저장
                    </Button>
                    <Button variant="outline" onClick={exportJson}>
                      <Download className="mr-2 h-4 w-4" />
                      JSON 내보내기
                    </Button>
                    <label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <Upload className="mr-2 h-4 w-4" />
                      JSON 불러오기
                      <input type="file" accept="application/json" className="hidden" onChange={(e) => importJson(e.target.files?.[0])} />
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Footer({ brand }) {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-bold text-slate-800">{brand.company}</p>
          <p className="mt-1">보험사전산 · 고객센터 · 상품공시실</p>
        </div>
        <div className="flex flex-col gap-1 text-left lg:text-right">
          <p>대표번호 {brand.phone}</p>
          <p>© 2026 {brand.company}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function useSeo(brand) {
  useEffect(() => {
    document.title = `${brand.company} 보험 포털 | 보험사전산 · 고객센터 · 상품공시실`;

    const ensureMeta = (name, content, attr = "name") => {
      let el = document.head.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    ensureMeta("description", `${brand.company} 보험 포털. 보험사전산, 고객센터, 상품공시실을 한곳에서 빠르게 찾을 수 있는 실무형 보험 홈페이지.`);
    ensureMeta("keywords", `${brand.company}, 보험포털, 보험사전산, 상품공시실, 고객센터, GA영업포탈`);
    ensureMeta("og:title", `${brand.company} 보험 포털`, "property");
    ensureMeta("og:description", `${brand.company} 보험 포털. 보험사전산, 고객센터, 상품공시실 안내`, "property");
    ensureMeta("og:type", "website", "property");

    const ldId = "youreasset-jsonld";
    const existing = document.getElementById(ldId);
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = ldId;
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: brand.company,
      description: brand.sub,
      telephone: brand.phone,
      url: window.location.href,
    });
    document.head.appendChild(script);

    return () => {
      const node = document.getElementById(ldId);
      if (node) node.remove();
    };
  }, [brand]);
}

export default function YoureAssetInsurancePortal() {
  const [activeTop, setActiveTop] = useState("system");
  const [brand, setBrand] = useState(defaultBrand);
  const [insurers, setInsurers] = useState(defaultInsurers);
  const [adminOpen, setAdminOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useSeo(brand);

  useEffect(() => {
    let unsubBrand = () => {};
    let unsubInsurers = () => {};
    let unsubAuth = () => {};

    async function setup() {
      unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
      });

      try {
        await initializeSiteData(defaultBrand, defaultInsurers);
      } catch (error) {
        console.warn("초기 데이터 자동 생성은 건너뜁니다.", error);
      }

      try {
        unsubBrand = subscribeBrand((data) => {
          if (data) setBrand(data);
        });
      } catch (error) {
        console.warn("브랜드 데이터 구독 중 오류가 발생했습니다.", error);
      }

      try {
        unsubInsurers = subscribeInsurers((items) => {
          if (Array.isArray(items) && items.length > 0) {
            setInsurers(items);
          }
        });
      } catch (error) {
        console.warn("보험사 데이터 구독 중 오류가 발생했습니다.", error);
      }

      setReady(true);
    }

    setup();

    return () => {
      unsubBrand();
      unsubInsurers();
      unsubAuth();
    };
  }, []);

  const handleSave = async () => {
    try {
      await saveBrand(brand);
      await saveInsurers(insurers);
      alert("Firebase에 저장되었습니다. 사이트에 바로 반영됩니다.");
    } catch (error) {
      console.error(error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-slate-900">
        <div className="text-center">
          <p className="text-lg font-bold">불러오는 중...</p>
          <p className="mt-2 text-sm text-slate-500">Firebase 데이터를 연결하고 있습니다.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Header activeTop={activeTop} setActiveTop={setActiveTop} brand={brand} onOpenAdmin={() => setAdminOpen(true)} isAdmin={!!user} />
      <Hero brand={brand} />
      <About />
      <Features />
      <Directory activeTop={activeTop} setActiveTop={setActiveTop} insurers={insurers} />
      <Footer brand={brand} />
      <div className="mx-auto max-w-7xl px-4 pb-10 text-xs leading-6 text-slate-400 lg:px-8">
        검색 노출을 위해서는 실제 배포 후 도메인 연결, 사이트맵 제출, 색인 요청이 추가로 필요합니다. 현재 코드는 Firebase 실시간 저장 구조까지 반영되어 있습니다.
      </div>
      <AdminModal
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        user={user}
        brand={brand}
        setBrand={setBrand}
        insurers={insurers}
        setInsurers={setInsurers}
        onSave={handleSave}
      />
    </main>
  );
}
